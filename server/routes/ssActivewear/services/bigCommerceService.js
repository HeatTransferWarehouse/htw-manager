const axios = require('axios');
const config = require('../config');
const logger = require('./loggerService');

class BigCommerceService {
  constructor() {
    this.apiUrl = config.bigcommerce.apiUrl;
    this.accessToken = config.bigcommerce.accessToken;
    this.clientId = config.bigcommerce.clientId;
  }

  getHeaders() {
    return {
      'X-Auth-Token': this.accessToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getAllProducts() {
    try {
      let allProducts = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(`${this.apiUrl}/v3/catalog/products`, {
          headers: this.getHeaders(),
          params: {
            page,
            limit: 250,
            include: 'variants,images'
          }
        });

        allProducts = allProducts.concat(response.data.data);

        const meta = response.data.meta.pagination;
        hasMore = meta.current_page < meta.total_pages;
        page++;
      }

      return allProducts;
    } catch (error) {
      throw new Error(`Failed to fetch BigCommerce products: ${error.message}`);
    }
  }

  async getAllProductSkus() {
    try {
      const productMap = {};
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(`${this.apiUrl}/v3/catalog/products`, {
          headers: this.getHeaders(),
          params: {
            page,
            limit: 250,
            include_fields: 'id,sku'
          }
        });

        response.data.data.forEach(product => {
          if (product.sku) {
            productMap[product.sku] = product.id;
          }
        });

        const meta = response.data.meta.pagination;
        hasMore = meta.current_page < meta.total_pages;
        page++;
      }
      return productMap;
    } catch (error) {
      throw new Error(`Failed to fetch all BigCommerce product SKUs: ${error.message}`);
    }
  }

  async getAllVariantSkus() {
    try {
      const variantSkuMap = new Map();
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(`${this.apiUrl}/v3/catalog/products`, {
          headers: this.getHeaders(),
          params: {
            page,
            limit: 250,
            include: 'variants'
          }
        });

        response.data.data.forEach(product => {
          if (product.variants && Array.isArray(product.variants)) {
            product.variants.forEach(variant => {
              if (variant.sku) {
                variantSkuMap.set(variant.sku, {
                  productId: product.id,
                  variantId: variant.id
                });
              }
            });
          }
        });

        const meta = response.data.meta.pagination;
        hasMore = meta.current_page < meta.total_pages;
        page++;
      }
      return variantSkuMap;
    } catch (error) {
      throw new Error(`Failed to fetch all BigCommerce variant SKUs: ${error.message}`);
    }
  }

  async getProductBySku(sku) {
    try {
      const response = await axios.get(`${this.apiUrl}/v3/catalog/products`, {
        headers: this.getHeaders(),
        params: {
          sku: sku
        }
      });

      return response.data.data.length > 0 ? response.data.data[0] : null;
    } catch (error) {
      throw new Error(`Failed to fetch product by SKU ${sku}: ${error.message}`);
    }
  }

  async getProductVariants(productId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v3/catalog/products/${productId}/variants`,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
          return [];
      }
      throw new Error(`Failed to fetch variants for product ${productId}: ${error.message}`);
    }
  }

  async getVariantBySku(sku) {
    try {
      const v2Url = this.apiUrl.replace('/v3', '/v2');
      const response = await axios.get(`${v2Url}/products`, {
        headers: this.getHeaders(),
        params: {
          sku: sku,
          include: 'variants'
        }
      });

      const productData = response.data;
      if (productData.length > 0) {
        for (const product of productData) {
          for (const variant of product.variants || []) {
            if (variant.sku === sku) {
              return variant;
            }
          }
        }
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to fetch variant by SKU ${sku}: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v3/catalog/products`,
        productData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      const errorMessage = typeof errorDetails === 'object'
        ? JSON.stringify(errorDetails)
        : errorDetails;
      throw new Error(`Failed to create product: ${errorMessage}`);
    }
  }

  async updateProduct(productId, updateData) {
    try {
      const response = await axios.put(
        `${this.apiUrl}/v3/catalog/products/${productId}`,
        updateData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      const errorMessage = typeof errorDetails === 'object'
        ? JSON.stringify(errorDetails)
        : errorDetails;

      logger.error(`BigCommerce API error updating product ${productId}`, {
        status: error.response?.status,
        data: errorDetails,
        updateData
      });

      throw new Error(`Failed to update product ${productId}: ${errorMessage}`);
    }
  }

  async deleteProduct(productId) {
    try {
      await axios.delete(
        `${this.apiUrl}/v3/catalog/products/${productId}`,
        { headers: this.getHeaders() }
      );
      return true;
    } catch (error) {
      throw new Error(`Failed to delete product ${productId}: ${error.message}`);
    }
  }

  async createProductOption(productId, optionData) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v3/catalog/products/${productId}/options`,
        optionData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      const errorMessage = typeof errorDetails === 'object'
        ? JSON.stringify(errorDetails)
        : errorDetails;
      throw new Error(`Failed to create product option for product ${productId}: ${errorMessage}`);
    }
  }

  async getProductOptions(productId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v3/catalog/products/${productId}/options`,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to retrieve product options for product ${productId}: ${error.message}`);
    }
  }

  async updateVariant(productId, variantId, variantData) {
    try {
      const response = await axios.put(
        `${this.apiUrl}/v3/catalog/products/${productId}/variants/${variantId}`,
        variantData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to update variant ${variantId}: ${error.message}`);
    }
  }

  async createVariant(productId, variantData) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v3/catalog/products/${productId}/variants`,
        variantData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      const errorMessage = typeof errorDetails === 'object'
        ? JSON.stringify(errorDetails, null, 2)
        : errorDetails;
      throw new Error(`Failed to create variant: ${errorMessage}`);
    }
  }

  async addProductImage(productId, imageUrl, isThumbnail = false, description = null) {
    try {
      const imageData = {
        image_url: imageUrl,
        is_thumbnail: isThumbnail
      };

      if (description) {
        imageData.description = description;
      }

      const response = await axios.post(
        `${this.apiUrl}/v3/catalog/products/${productId}/images`,
        imageData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to add image to product ${productId}: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      let allCategories = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(`${this.apiUrl}/v3/catalog/categories`, {
          headers: this.getHeaders(),
          params: {
            limit: 250,
            page
          }
        });

        const categories = response.data.data;
        allCategories = allCategories.concat(categories);

        hasMore = categories.length === 250;
        page++;
      }

      return allCategories;
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getBrands() {
    try {
      let allBrands = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(`${this.apiUrl}/v3/catalog/brands`, {
          headers: this.getHeaders(),
          params: {
            limit: 250,
            page
          }
        });

        const brands = response.data.data;
        allBrands = allBrands.concat(brands);

        const meta = response.data.meta.pagination;
        hasMore = meta.current_page < meta.total_pages;
        page++;
      }

      return allBrands;
    } catch (error) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }
  }

  async findOrCreateBrand(brandName) {
    try {
      if (!brandName || brandName.trim() === '') {
        return null;
      }

      const brands = await this.getBrands();
      const existingBrand = brands.find(b =>
        b.name.toLowerCase() === brandName.toLowerCase()
      );

      if (existingBrand) {
        return existingBrand.id;
      }

      const response = await axios.post(
        `${this.apiUrl}/v3/catalog/brands`,
        { name: brandName },
        { headers: this.getHeaders() }
      );
      return response.data.data.id;
    } catch (error) {
      logger.error(`Failed to find or create brand "${brandName}":`, error.message);
      return null;
    }
  }

  async getChannels() {
    try {
      const response = await axios.get(`${this.apiUrl}/v3/channels`, {
        headers: this.getHeaders(),
        params: {
          limit: 250
        }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch channels: ${error.message}`);
    }
  }

  async assignProductToChannel(productId, channelId) {
    try {
      const response = await axios.put(
        `${this.apiUrl}/v3/catalog/products/channel-assignments`,
        [{
          product_id: productId,
          channel_id: channelId
        }],
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      const errorMessage = typeof errorDetails === 'object'
        ? JSON.stringify(errorDetails)
        : errorDetails;
      throw new Error(`Failed to assign product ${productId} to channel ${channelId}: ${errorMessage}`);
    }
  }
}

module.exports = new BigCommerceService();
