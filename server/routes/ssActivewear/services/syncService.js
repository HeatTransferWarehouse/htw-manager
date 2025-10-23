const ssActiveWearService = require('./ssActivewearService');
const bigCommerceService = require('./bigCommerceService');
const categoryMapper = require('../utils/categoryMapper');
const logger = require('./loggerService');

class SyncService {
  constructor() {
    this.stats = {
      totalProducts: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY_MS = 1000;
    this.BATCH_SIZE = 5;
    this.RATE_LIMIT_DELAY_MS = 500;
    this.VARIANT_BATCH_SIZE = 10;
    this.VARIANT_DELAY_MS = 200;
  }

 async performSync() {
    const startTime = Date.now();
    logger.info('Starting product sync');
    this.resetStats();

    try {
      logger.info('Fetching BigCommerce SKU map');
      const bcProductMap = await this.retryWithBackoff(() =>
        bigCommerceService.getAllProductSkus()
      );

      logger.info('Fetching BigCommerce variant SKUs map');
      const bcVariantSkusMap = await this.retryWithBackoff(() =>
        bigCommerceService.getAllVariantSkus()
      );

      logger.info('Fetching BigCommerce categories');
      const bcCategories = await this.retryWithBackoff(() =>
        bigCommerceService.getCategories()
      );

      logger.info('Fetching BigCommerce channels');
      const bcChannels = await this.retryWithBackoff(() =>
        bigCommerceService.getChannels()
      );

      const htwChannel = bcChannels.find(ch =>
        ch.name && ch.name.toLowerCase().includes('heat transfer warehouse')
      );
      const channelId = htwChannel ? htwChannel.id : null;

      if (channelId) {
        logger.info(`Found Heat Transfer Warehouse channel with ID: ${channelId}`);
      } else {
        logger.warn('Heat Transfer Warehouse channel not found');
      }

      logger.info('Fetching BigCommerce brands');
      const bcBrands = await this.retryWithBackoff(() =>
        bigCommerceService.getBrands()
      );
      const brandMap = new Map(bcBrands.map(b => [b.name.toLowerCase(), b.id]));

      logger.info('Starting streaming sync from SS Activewear');

      for await (const brandResult of ssActiveWearService.streamAllConfiguredBrands()) {
        if (!brandResult.success) {
          logger.error(`Failed to fetch products for brand: ${brandResult.brand}`, {
            error: brandResult.error
          });
          this.stats.errors.push({
            brand: brandResult.brand,
            message: brandResult.error
          });
          continue;
        }

        if (!Array.isArray(brandResult.products) || brandResult.products.length === 0) {
          logger.warn(`No products returned for brand: ${brandResult.brand}`);
          continue;
        }

        logger.info(`Processing ${brandResult.products.length} products from ${brandResult.brand}`);

        const productGroups = this.groupVariantsByStyleId(brandResult.products);

        logger.info(`Processing ${productGroups.length} product groups (Style IDs)`);

        await this.processBatch(productGroups, bcProductMap, bcCategories, bcVariantSkusMap, channelId, brandMap);

        if (global.gc) {
          global.gc();
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const summary = {
        startTime,
        endTime,
        duration,
        ...this.stats
      };

      logger.info('Sync completed', summary);
      await logger.sendSyncSummaryToSlack(summary);

      return summary;
    } catch (error) {
      logger.error('Sync failed', { error: error.message, stack: error.stack });
      throw error;
    }
  }


  groupVariantsByStyleId(products) {
    const groups = new Map();

    for (const product of products) {
      const styleId = product.styleID || product.sku;

      if (!styleId) {
        logger.warn('Product missing styleID and sku', { product });
        this.stats.skipped++;
        continue;
      }

      if (!groups.has(styleId)) {
        groups.set(styleId, []);
      }

      groups.get(styleId).push(product);
    }

    return Array.from(groups.values());
  }

  async processBatch(productGroups, bcProductMap, bcCategories, bcVariantSkusMap, channelId = null, brandMap = null) {
    const totalGroups = productGroups.length;
    logger.info(`Processing ${totalGroups} product groups in batches of ${this.BATCH_SIZE}`);

    for (let i = 0; i < productGroups.length; i += this.BATCH_SIZE) {
      const batch = productGroups.slice(i, i + this.BATCH_SIZE);
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(totalGroups / this.BATCH_SIZE);

      logger.info(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`);

      for (const productGroup of batch) {
        try {
          await this.syncProductGroup(productGroup, bcProductMap, bcCategories, bcVariantSkusMap, channelId, brandMap);
        } catch (error) {
          logger.error('Error processing product group', {
            error: error.message,
            styleId: productGroup[0]?.styleID
          });
        }
      }

      if (i + this.BATCH_SIZE < productGroups.length) {
        logger.info(`Waiting ${this.RATE_LIMIT_DELAY_MS}ms before next batch...`);
        await this.delay(this.RATE_LIMIT_DELAY_MS);
      }
    }

    logger.info(`Completed processing all ${totalGroups} product groups`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async syncProductGroup(ssProductGroup, bcProductMap, bcCategories, bcVariantSkusMap, channelId = null, brandMap = null) {
    if (!Array.isArray(ssProductGroup) || ssProductGroup.length === 0) {
      logger.warn('Empty product group received');
      this.stats.skipped++;
      return;
    }

    const baseProduct = ssProductGroup[0];
    const styleId = baseProduct.styleID;

    try {
      const normalizedProduct = ssActiveWearService.normalizeCoreProduct(baseProduct);
      const sku = normalizedProduct.sku;

      this.stats.totalProducts++;

      if (!sku) {
        logger.warn('Product missing SKU', { styleId, name: normalizedProduct.name });
        this.stats.skipped++;
        return;
      }


      const existingProductId = bcProductMap[sku];

      if (existingProductId) {
        await this.updateExistingProduct(existingProductId, ssProductGroup, normalizedProduct, channelId, bcCategories, brandMap);
      } else {
        await this.createNewProduct(ssProductGroup, bcCategories, bcVariantSkusMap, channelId, brandMap);
      }
    } catch (error) {
      this.stats.errors.push({
        styleId,
        sku: baseProduct.sku,
        message: error.message
      });
      logger.error('Failed to sync product group', {
        styleId,
        error: error.message,
        stack: error.stack
      });
    }
  }

  async updateExistingProduct(bcProductId, ssProductGroup, baseProduct, channelId = null, bcCategories = [], brandMap = null) {
    const ssProductSku = baseProduct.sku;

    try {

      if (!bcProductId || typeof bcProductId !== 'number') {
        throw new Error(`Invalid BigCommerce product ID: ${bcProductId}`);
      }


      const lowestPrice = this.calculateLowestPrice(ssProductGroup);


      const updateData = {
        price: lowestPrice,
        name: baseProduct.name,
        description: baseProduct.description
      };

      if (brandMap && ssProductGroup[0].brandName) {
        const brandId = brandMap.get(ssProductGroup[0].brandName.toLowerCase());
        if (brandId) {
          updateData.brand_id = brandId;
        }
      }

      await this.retryWithBackoff(() =>
        bigCommerceService.updateProduct(bcProductId, updateData)
      );

      const categoryId = await categoryMapper.mapToBigCommerceCategory(
        baseProduct.name,
        ssProductGroup[0].category || '',
        bcCategories,
        ssProductGroup[0].baseCategoryId || ssProductGroup[0].BaseCategoryID || null,
        ssProductGroup[0].brandName || null
      );

      if (categoryId) {
        // Verify the primary category exists before assigning
        const categoryExists = bcCategories.some(cat => cat.id === categoryId);

        if (categoryExists) {
          const categories = [categoryId];

          // Add additional category 468 (Clothing) for products in category 503 (Headwear) or 498 (Mens Clothing Blanks) if it exists
          if (categoryId === 503 || categoryId === 498) {
            const category468Exists = bcCategories.some(cat => cat.id === 468);
            if (category468Exists) {
              categories.push(468);
            }
          }

          await this.retryWithBackoff(() =>
            bigCommerceService.updateProduct(bcProductId, { categories })
          );
        } else {
          logger.warn(`Category ${categoryId} does not exist in BigCommerce, skipping category assignment for product ${bcProductId}`);
        }
      }

      if (channelId) {
        try {
          await this.retryWithBackoff(() =>
            bigCommerceService.assignProductToChannel(bcProductId, channelId)
          );
          logger.info(`Assigned product ${bcProductId} to channel ${channelId}`);
        } catch (channelError) {
          logger.warn(`Failed to assign product ${bcProductId} to channel: ${channelError.message}`);
        }
      }


      const [bcVariants, bcOptions] = await Promise.all([
        this.retryWithBackoff(() => bigCommerceService.getProductVariants(bcProductId)),
        this.retryWithBackoff(() => bigCommerceService.getProductOptions(bcProductId))
      ]);

      const bcVariantMap = new Map(
        (bcVariants || []).map(v => [v.sku, v])
      );

      let idMap = this.mapOptionsToIds(bcOptions || []);


      if (!idMap['Color'] || !idMap['Size']) {
        logger.info(`Product ${bcProductId} is missing Color/Size options, creating them now`);

        const optionsData = ssActiveWearService.normalizeProductOptions(ssProductGroup);

        for (const option of optionsData) {
          await this.retryWithBackoff(() =>
            bigCommerceService.createProductOption(bcProductId, option)
          );
        }


        const updatedOptions = await this.retryWithBackoff(() =>
          bigCommerceService.getProductOptions(bcProductId)
        );
        idMap = this.mapOptionsToIds(updatedOptions);

        logger.info(`Created missing options for product ${bcProductId}`);
      }

      let variantsUpdated = 0;
      let variantsCreated = 0;

      logger.info(`Updating ${ssProductGroup.length} variants for product ${ssProductSku}`);

      for (let i = 0; i < ssProductGroup.length; i++) {
        const ssVariant = ssProductGroup[i];
        const variantSku = ssVariant.sku || `${ssProductSku}-${ssVariant.sizeName}-${ssVariant.colorName}`;

        const bcVariant = bcVariantMap.get(variantSku);

        if (bcVariant) {
          const inventoryLevel = parseInt(ssVariant.qty) || 0;


          let price = 0;
          const mapPrice = parseFloat(ssVariant.mapPrice) || 0;
          const piecePrice = parseFloat(ssVariant.piecePrice) || 0;

          if (mapPrice >= 1) {
            price = mapPrice;
          } else if (piecePrice > 0) {

            price = piecePrice / 0.6;
          } else if (mapPrice > 0) {
            price = mapPrice;
          }

          const variantUpdateData = {
            price: price,
            inventory_level: inventoryLevel,
            inventory_warning_level: 0,
            weight: this.getVariantWeight(ssVariant)
          };


          if (ssVariant.colorFrontImage) {
            const imageUrl = ssActiveWearService.getFinalImageUrl(ssVariant.colorFrontImage);
            if (this.isValidUrl(imageUrl)) {
              variantUpdateData.image_url = imageUrl;
            }
          } else if (ssVariant.colorSwatchImage) {
            const imageUrl = ssActiveWearService.getFinalImageUrl(ssVariant.colorSwatchImage);
            if (this.isValidUrl(imageUrl)) {
              variantUpdateData.image_url = imageUrl;
            }
          }

          logger.info(`Updating variant ${i + 1}/${ssProductGroup.length}: ${variantSku} with inventory: ${inventoryLevel}`, {
            sku: variantSku,
            inventory: inventoryLevel,
            price: variantUpdateData.price
          });

          await this.retryWithBackoff(() =>
            bigCommerceService.updateVariant(bcProductId, bcVariant.id, variantUpdateData)
          );
          variantsUpdated++;

          if ((i + 1) % this.VARIANT_BATCH_SIZE === 0 && i + 1 < ssProductGroup.length) {
            logger.info(`Updated ${i + 1} variants, waiting ${this.VARIANT_DELAY_MS}ms before next batch...`);
            await this.delay(this.VARIANT_DELAY_MS);
          }
        } else {

          if (idMap['Color'] && idMap['Size']) {
            try {
              await this.createSingleVariant(bcProductId, ssVariant, idMap, ssProductSku);
              variantsCreated++;

              if ((i + 1) % this.VARIANT_BATCH_SIZE === 0 && i + 1 < ssProductGroup.length) {
                logger.info(`Created ${variantsCreated} variants, waiting ${this.VARIANT_DELAY_MS}ms before next batch...`);
                await this.delay(this.VARIANT_DELAY_MS);
              }
            } catch (error) {
              if (error.message.includes('is not unique')) {
                logger.info(`Duplicate SKU detected for ${variantSku} - attempting to update existing variant`);

                try {
                  const existingVariants = await this.retryWithBackoff(() =>
                    bigCommerceService.getProductVariants(bcProductId)
                  );
                  const existingVariant = existingVariants.find(v => v.sku === variantSku);

                  if (existingVariant) {

                    let price = 0;
                    const mapPrice = parseFloat(ssVariant.mapPrice) || 0;
                    const piecePrice = parseFloat(ssVariant.piecePrice) || 0;

                    if (mapPrice >= 1) {
                      price = mapPrice;
                    } else if (piecePrice > 0) {

                      price = piecePrice / 0.6;
                    } else if (mapPrice > 0) {
                      price = mapPrice;
                    }

                    const variantUpdateData = {
                      price: price,
                      inventory_level: parseInt(ssVariant.qty) || 0,
                      weight: this.getVariantWeight(ssVariant)
                    };

                    await this.retryWithBackoff(() =>
                      bigCommerceService.updateVariant(bcProductId, existingVariant.id, variantUpdateData)
                    );

                    logger.info(`Updated duplicate variant ${variantSku}`, {
                      price: variantUpdateData.price,
                      inventory: variantUpdateData.inventory_level
                    });
                    variantsUpdated++;
                  } else {
                    logger.info(`Skipping duplicate variant ${variantSku} - not found in product`);
                  }
                } catch (updateError) {
                  logger.warn(`Could not update duplicate variant ${variantSku}: ${updateError.message}`);
                }
              } else {
                throw error;
              }
            }
          } else {
            logger.warn(`Cannot create variant ${variantSku}: Missing Color/Size options on product ${bcProductId}. Options must be created manually or product must be re-synced from scratch.`);
          }
        }
      }

      this.stats.updated++;
      logger.info(`Updated product: ${ssProductSku}`, {
        sku: ssProductSku,
        variantsUpdated,
        variantsCreated
      });

    } catch (error) {
      throw new Error(`Failed to update product ${ssProductSku}: ${error.message}`);
    }
  }

  async createSingleVariant(productId, ssVariant, idMap, baseStyleId) {
    const colorValueId = idMap['Color']?.values[ssVariant.colorName];
    const sizeValueId = idMap['Size']?.values[ssVariant.sizeName];

    if (!colorValueId || !sizeValueId) {
      logger.warn(`Missing Option ID for variant. Color: ${ssVariant.colorName}, Size: ${ssVariant.sizeName}`);
      return;
    }


    let price = 0;
    const mapPrice = parseFloat(ssVariant.mapPrice) || 0;
    const piecePrice = parseFloat(ssVariant.piecePrice) || 0;

    if (mapPrice >= 1) {
      price = mapPrice;
    } else if (piecePrice > 0) {

      price = piecePrice / 0.6;
    } else if (mapPrice > 0) {
      price = mapPrice;
    }

    const variantData = {
      sku: ssVariant.sku || `${baseStyleId}-${ssVariant.sizeName}-${ssVariant.colorName}`,
      price: price,
      inventory_level: parseInt(ssVariant.qty) || 0,
      inventory_warning_level: 0,
      weight: this.getVariantWeight(ssVariant),
      option_values: [
        { option_id: idMap['Color'].option_id, id: colorValueId },
        { option_id: idMap['Size'].option_id, id: sizeValueId }
      ]
    };


    if (ssVariant.colorFrontImage) {
      const imageUrl = ssActiveWearService.getFinalImageUrl(ssVariant.colorFrontImage);
      if (this.isValidUrl(imageUrl)) {
        variantData.image_url = imageUrl;
      }
    } else if (ssVariant.colorSwatchImage) {
      const imageUrl = ssActiveWearService.getFinalImageUrl(ssVariant.colorSwatchImage);
      if (this.isValidUrl(imageUrl)) {
        variantData.image_url = imageUrl;
      }
    }

    await this.retryWithBackoff(() =>
      bigCommerceService.createVariant(productId, variantData)
    );
  }

  mapOptionsToIds(productOptions) {
    const optionsMap = {};

    if (!Array.isArray(productOptions)) {
      return optionsMap;
    }

    productOptions.forEach(option => {
      if (!option.display_name || !option.id) {
        logger.warn('Invalid option structure', { option });
        return;
      }

      optionsMap[option.display_name] = {
        option_id: option.id,
        values: {}
      };

      if (Array.isArray(option.option_values)) {
        option.option_values.forEach(value => {
          if (value.label && value.id) {
            optionsMap[option.display_name].values[value.label] = value.id;
          }
        });
      }
    });

    return optionsMap;
  }


  async createNewProduct(ssProductGroup, bcCategories, bcVariantSkusMap, channelId = null, brandMap = null) {
    if (!Array.isArray(ssProductGroup) || ssProductGroup.length === 0) {
      throw new Error('Invalid product group: empty or not an array');
    }

    const variantSkus = ssProductGroup.map(v => v.sku).filter(Boolean);
    const existingVariants = this.checkExistingVariantSkus(variantSkus, bcVariantSkusMap);

    if (existingVariants.length > 0) {
      logger.info(`Product has existing variants, updating inventory and prices instead`, {
        existingVariants: existingVariants.length
      });
      await this.updateExistingVariants(ssProductGroup, bcVariantSkusMap);
      this.stats.updated++;
      return;
    }

    const lowestPrice = this.calculateLowestPrice(ssProductGroup);

    const baseProductData = ssActiveWearService.normalizeCoreProduct(ssProductGroup[0], lowestPrice);
    const ssProductSku = baseProductData.sku;

    if (brandMap && baseProductData.brand_name) {
      const brandId = brandMap.get(baseProductData.brand_name.toLowerCase());
      if (brandId) {
        baseProductData.brand_id = brandId;
      }
      delete baseProductData.brand_name;
    }

    let productId = null;

    try {

      const createdProduct = await this.retryWithBackoff(() =>
        bigCommerceService.createProduct(baseProductData)
      );

      productId = createdProduct.id;

      if (!productId) {
        throw new Error('Product creation returned no ID');
      }

      const categoryId = await categoryMapper.mapToBigCommerceCategory(
        baseProductData.name,
        ssProductGroup[0].category || '',
        bcCategories,
        ssProductGroup[0].baseCategoryId || ssProductGroup[0].BaseCategoryID || null,
        ssProductGroup[0].brandName || null
      );

      if (categoryId) {
        // Verify the primary category exists before assigning
        const categoryExists = bcCategories.some(cat => cat.id === categoryId);

        if (categoryExists) {
          const categories = [categoryId];

          // Add additional category 468 (Clothing) for products in category 503 (Headwear) or 498 (Mens Clothing Blanks) if it exists
          if (categoryId === 503 || categoryId === 498) {
            const category468Exists = bcCategories.some(cat => cat.id === 468);
            if (category468Exists) {
              categories.push(468);
            }
          }

          await this.retryWithBackoff(() =>
            bigCommerceService.updateProduct(productId, { categories })
          );
        } else {
          logger.warn(`Category ${categoryId} does not exist in BigCommerce, skipping category assignment for product ${productId}`);
        }
      }

      if (channelId) {
        try {
          await this.retryWithBackoff(() =>
            bigCommerceService.assignProductToChannel(productId, channelId)
          );
          logger.info(`Assigned new product ${productId} to channel ${channelId}`);
        } catch (channelError) {
          logger.warn(`Failed to assign new product ${productId} to channel: ${channelError.message}`);
        }
      }


      await this.addMainProductImage(productId, ssProductGroup[0], ssProductSku);


      await this.createComplexProductStructure(productId, ssProductGroup, bcVariantSkusMap);

      logger.info(`Created complex product: ${ssProductSku}`, {
        sku: ssProductSku,
        name: baseProductData.name,
        variants: ssProductGroup.length
      });

      this.stats.created++;
    } catch (error) {

      if (productId) {
        try {
          logger.warn(`Attempting to delete partially created product ${productId}`);

          await bigCommerceService.deleteProduct(productId);
        } catch (deleteError) {
          logger.error(`Failed to cleanup product ${productId}`, {
            error: deleteError.message
          });
        }
      }
      throw new Error(`Failed to create product ${ssProductSku}: ${error.message}`);
    }
  }

  async addMainProductImage(productId, ssProduct, baseSku) {
    try {
      const imageTypes = [
        { field: 'colorFrontImage', name: 'Front' },
        { field: 'colorBackImage', name: 'Back' },
        { field: 'colorSideImage', name: 'Side' }
      ];

      const availableImages = [];

      for (const imageType of imageTypes) {
        if (ssProduct[imageType.field]) {
          const imageUrl = ssActiveWearService.getFinalImageUrl(ssProduct[imageType.field]);
          if (this.isValidUrl(imageUrl)) {
            availableImages.push({
              url: imageUrl,
              name: imageType.name
            });
          }
        }
      }

      if (availableImages.length === 0) {
        if (ssProduct.images && Array.isArray(ssProduct.images) && ssProduct.images.length > 0) {
          const imageUrl = ssActiveWearService.getFinalImageUrl(ssProduct.images[0]);
          if (this.isValidUrl(imageUrl)) {
            availableImages.push({ url: imageUrl, name: 'Default' });
          }
        }
      }

      if (availableImages.length === 0) {
        logger.warn(`No valid images found for base product ${baseSku}`);
        return;
      }

      logger.info(`Adding ${availableImages.length} images to base product ${baseSku}`, {
        images: availableImages.map(img => img.name)
      });

      for (let i = 0; i < availableImages.length; i++) {
        const isThumbnail = i === 0;
        const brandName = ssProduct.brandName || '';
        const styleName = ssProduct.style || ssProduct.styleName || '';
        const colorName = ssProduct.colorName || '';
        const altText = `${brandName ? brandName + ' ' : ''}Style ${styleName}${colorName ? ' - ' + colorName : ''} - ${availableImages[i].name} View`;

        await this.retryWithBackoff(() =>
          bigCommerceService.addProductImage(productId, availableImages[i].url, isThumbnail, altText)
        );

        logger.info(`Added ${availableImages[i].name} image to base product ${baseSku}`, {
          url: availableImages[i].url,
          isThumbnail,
          altText
        });

        if (i < availableImages.length - 1) {
          await this.delay(100);
        }
      }

    } catch (error) {
      logger.warn(`Failed to add images for base product ${baseSku}`, {
        error: error.message
      });
    }
  }

  async addProductImages(productId, images, sku) {
    const imageLimit = 5;
    const imagesToAdd = images.slice(0, imageLimit);

    for (let i = 0; i < imagesToAdd.length; i++) {
      try {
        const imageUrl = ssActiveWearService.getFinalImageUrl(imagesToAdd[i]);

        if (!this.isValidUrl(imageUrl)) {
          logger.warn(`Invalid image URL for product ${sku}`, { imageUrl });
          continue;
        }

        await this.retryWithBackoff(() =>
          bigCommerceService.addProductImage(productId, imageUrl)
        );
      } catch (error) {
        logger.warn(`Failed to add image ${i + 1} for product ${sku}`, {
          error: error.message
        });
      }
    }
  }

  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  getVariantWeight(ssVariant) {
    const weightInLbs = parseFloat(ssVariant.unitWeight || ssVariant.UnitWeight || ssVariant.weight || ssVariant.pieceWeight || ssVariant.Weight || ssVariant.PieceWeight) || 0;
    return weightInLbs * 16;
  }

  checkExistingVariantSkus(skus, bcVariantSkusMap) {
    const existing = [];
    logger.info(`Checking ${skus.length} variant SKUs for duplicates in BigCommerce`);

    for (const sku of skus) {
      if (bcVariantSkusMap.has(sku)) {
        existing.push(sku);
        logger.warn(`Variant SKU ${sku} already exists in BigCommerce`);
      }
    }

    return existing;
  }

  async updateExistingVariants(ssProductGroup, bcVariantSkusMap) {
    logger.info(`Updating ${ssProductGroup.length} existing variants`);

    let updated = 0;
    const errors = [];

    for (const ssVariant of ssProductGroup) {
      const sku = ssVariant.sku;

      if (!sku) {
        logger.warn('Variant missing SKU, skipping', { color: ssVariant.colorName, size: ssVariant.sizeName });
        continue;
      }

      const variantInfo = bcVariantSkusMap.get(sku);

      if (!variantInfo) {
        logger.warn(`Variant SKU ${sku} not found in map, skipping`);
        continue;
      }

      try {
        const inventoryLevel = parseInt(ssVariant.qty) || 0;

        let price = 0;
        const mapPrice = parseFloat(ssVariant.mapPrice) || 0;
        const piecePrice = parseFloat(ssVariant.piecePrice) || 0;

        if (mapPrice >= 1) {
          price = mapPrice;
        } else if (piecePrice > 0) {
          price = piecePrice / 0.6;
        } else if (mapPrice > 0) {
          price = mapPrice;
        }

        const variantUpdateData = {
          price: price,
          inventory_level: inventoryLevel,
          inventory_warning_level: 0
        };

        await this.retryWithBackoff(() =>
          bigCommerceService.updateVariant(variantInfo.productId, variantInfo.variantId, variantUpdateData)
        );

        updated++;
        logger.debug(`Updated variant ${sku}`, { price, inventory: inventoryLevel });
      } catch (error) {
        errors.push({ sku, error: error.message });
        logger.error(`Failed to update variant ${sku}`, { error: error.message });
      }
    }

    logger.info(`Updated ${updated}/${ssProductGroup.length} variants`, {
      errors: errors.length
    });

    if (errors.length > 0) {
      throw new Error(`Failed to update ${errors.length} variants: ${errors.map(e => e.sku).join(', ')}`);
    }
  }


  async createComplexProductStructure(productId, ssProductGroup, bcVariantSkusMap) {
    try {
      const optionsData = ssActiveWearService.normalizeProductOptions(ssProductGroup);

      if (!Array.isArray(optionsData) || optionsData.length === 0) {
        logger.warn(`No options generated for product ${productId}`);
        return;
      }


      for (const option of optionsData) {
        await this.retryWithBackoff(() =>
          bigCommerceService.createProductOption(productId, option)
        );
      }


      const bcOptions = await this.retryWithBackoff(() =>
        bigCommerceService.getProductOptions(productId)
      );

      const idMap = this.mapOptionsToIds(bcOptions);

      if (!idMap['Color'] || !idMap['Size']) {
        logger.error(`Failed to map required options (Color/Size) for product ${productId}`);
        throw new Error('Missing required Color/Size options after creation');
      }

      logger.info(`Creating ${ssProductGroup.length} variants in batches of ${this.VARIANT_BATCH_SIZE}`);

      for (let i = 0; i < ssProductGroup.length; i++) {
        const ssVariant = ssProductGroup[i];

        const colorValueId = idMap['Color'].values[ssVariant.colorName];
        const sizeValueId = idMap['Size'].values[ssVariant.sizeName];

        if (!colorValueId || !sizeValueId) {
          logger.warn(`Missing Option ID for variant: ${ssVariant.sku}. Color: ${ssVariant.colorName}, Size: ${ssVariant.sizeName}`);
          continue;
        }

        const inventoryLevel = parseInt(ssVariant.qty) || 0;


        let price = 0;
        const mapPrice = parseFloat(ssVariant.mapPrice) || 0;
        const piecePrice = parseFloat(ssVariant.piecePrice) || 0;

        if (mapPrice >= 1) {
          price = mapPrice;
        } else if (piecePrice > 0) {
          price = piecePrice / 0.6;
        } else if (mapPrice > 0) {
          price = mapPrice;
        }

        const variantData = {
          sku: ssVariant.sku || `${ssProductGroup[0].styleID}-${ssVariant.sizeName}-${ssVariant.colorName}`,
          price: price,
          inventory_level: inventoryLevel,
          inventory_warning_level: 0,
          weight: this.getVariantWeight(ssVariant),
          option_values: [
            { option_id: idMap['Color'].option_id, id: colorValueId },
            { option_id: idMap['Size'].option_id, id: sizeValueId }
          ]
        };

        logger.info(`Creating variant ${i + 1}/${ssProductGroup.length} with inventory: ${inventoryLevel}`, {
          sku: variantData.sku,
          color: ssVariant.colorName,
          size: ssVariant.sizeName,
          inventory: inventoryLevel,
          hasColorFrontImage: !!ssVariant.colorFrontImage,
          hasColorSwatchImage: !!ssVariant.colorSwatchImage
        });


        if (ssVariant.colorFrontImage) {
          const imageUrl = ssActiveWearService.getFinalImageUrl(ssVariant.colorFrontImage);
          if (this.isValidUrl(imageUrl)) {
            variantData.image_url = imageUrl;
            logger.info(`Added colorFrontImage to variant: ${variantData.sku}`, { imageUrl });
          }
        } else if (ssVariant.colorSwatchImage) {
          const imageUrl = ssActiveWearService.getFinalImageUrl(ssVariant.colorSwatchImage);
          if (this.isValidUrl(imageUrl)) {
            variantData.image_url = imageUrl;
            logger.info(`Added colorSwatchImage to variant: ${variantData.sku}`, { imageUrl });
          }
        } else {
          logger.warn(`No variant image available for ${variantData.sku}`, {
            availableFields: Object.keys(ssVariant).filter(k => k.toLowerCase().includes('image'))
          });
        }

        try {
          await this.retryWithBackoff(() =>
            bigCommerceService.createVariant(productId, variantData)
          );

          if ((i + 1) % this.VARIANT_BATCH_SIZE === 0 && i + 1 < ssProductGroup.length) {
            logger.info(`Processed ${i + 1} variants, waiting ${this.VARIANT_DELAY_MS}ms before next batch...`);
            await this.delay(this.VARIANT_DELAY_MS);
          }
        } catch (variantError) {
          logger.error(`Failed to create variant ${i + 1}/${ssProductGroup.length}`, {
            productId,
            variantData,
            error: variantError.message
          });
          throw variantError;
        }

        if (i < ssProductGroup.length - 1) {
          await this.delay(50);
        }
      }
    } catch (error) {
      throw new Error(`Failed to create product structure: ${error.message}`);
    }
  }


  async retryWithBackoff(fn, maxRetries = this.MAX_RETRIES) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        const status = error.response ? error.response.status : null;


        if (status === 409 && error.message.includes('is not unique')) {
          throw error;
        }

        if (status === 400 || status === 422 || status === 404) {
          throw error;
        }

        const isLastAttempt = attempt === maxRetries - 1;

        if (isLastAttempt) {
          break;
        }

        const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt);

        await this.delay(delay);
      }
    }

    throw lastError;
  }

  calculateLowestPrice(ssProductGroup) {
    let lowestPrice = Infinity;

    for (const ssVariant of ssProductGroup) {
      const mapPrice = parseFloat(ssVariant.mapPrice) || 0;
      const piecePrice = parseFloat(ssVariant.piecePrice) || 0;

      let price = 0;


      if (mapPrice >= 1) {
        price = mapPrice;
      } else if (piecePrice > 0) {

        price = piecePrice / 0.6;
      } else if (mapPrice > 0) {
        price = mapPrice;
      }

      if (price > 0 && price < lowestPrice) {
        lowestPrice = price;
      }
    }

    return lowestPrice === Infinity ? 0 : lowestPrice;
  }

  resetStats() {
    this.stats = {
      totalProducts: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
  }

  getStats() {
    return { ...this.stats };
  }
}

module.exports = new SyncService();
