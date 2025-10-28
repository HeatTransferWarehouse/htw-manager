const axios = require('axios');
const config = require('../config.js');
const logger = require('./loggerService');

class SSActivewearService {
  constructor() {
    this.apiKey = config.ssActivewear.apiKey;
    this.accountNumber = config.ssActivewear.accountNumber;
    this.baseUrl = 'https://api.ssactivewear.com';
  }

  getHeaders() {
    return {
      'Authorization': `Basic ${Buffer.from(`${this.accountNumber}:${this.apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json'
    };
  }

  async *streamAllConfiguredBrands() {
    const brands = config.ssActivewear.brands;

    for (const brandId of brands) {
      try {
        logger.info(`Fetching products for brand: ${brandId}`);
        const products = await this.getProductsByBrand(brandId);
        yield { brand: brandId, products, success: true };
      } catch (error) {
        logger.error(`Failed to fetch products for brand ${brandId}:`, error.message);
        yield { brand: brandId, products: [], error: error.message, success: false };
      }
    }
  }

  async getProductsByBrand(brandId) {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/products`, {
        headers: this.getHeaders(),
        params: { brandid: brandId }
      });
      return response.data || [];
    } catch (error) {
      const statusCode = error.response?.status || 'unknown';
      const statusText = error.response?.statusText || '';
      const responseData = error.response?.data || '';

      logger.error(`SS Activewear API error for brand ${brandId}`, {
        status: statusCode,
        statusText,
        data: responseData,
        message: error.message
      });

      throw new Error(`Failed to fetch SS Activewear products for brand ${brandId}: ${statusCode} ${statusText} - ${error.message}`);
    }
  }

  normalizeCoreProduct(ssProduct, lowestPrice = 0) {
    const weightInLbs = parseFloat(ssProduct.unitWeight || ssProduct.UnitWeight || ssProduct.weight || ssProduct.pieceWeight || ssProduct.Weight || ssProduct.PieceWeight) || 0;
    const weightInOz = weightInLbs * 16;

    const productName = ssProduct.name || ssProduct.styleName || 'Unnamed Product';
    const brandName = ssProduct.brandName || '';
    const styleName = ssProduct.style || ssProduct.styleName || '';

    const fullProductName = brandName && styleName ? `${brandName} Style ${styleName}` : (brandName ? `${brandName} ${productName}` : productName);

    const styleNameForSku = styleName || productName.replace(/\s+/g, '-');
    const brandNameForSku = brandName ? brandName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 2).toUpperCase() : '';
    const skuString = brandNameForSku ? `${brandNameForSku}-${styleNameForSku}-base` : `${styleNameForSku}-base`;

    return {
      name: fullProductName,
      type: 'physical',
      sku: skuString,
      description: this.buildDescription(ssProduct),
      weight: weightInOz,
      price: lowestPrice,
      categories: [],
      is_visible: false,
      inventory_tracking: 'variant',
      availability: 'available',
      page_title: this.buildSEOTitle(productName, brandName, styleName),
      meta_description: this.buildSEODescription(ssProduct),
      brand_name: brandName
    };
  }

  buildDescription(ssProduct) {
    const parts = [];
    const brandName = ssProduct.brandName || '';
    const styleName = ssProduct.style || ssProduct.styleName || '';
    const styleId = ssProduct.styleID || '';
    const productName = ssProduct.name || ssProduct.styleName || 'Product';

    if (brandName && styleName) {
      parts.push(`<h2>${brandName} Collection | Style ${styleName}</h2>`);
    } else if (productName) {
      parts.push(`<h2>${productName}</h2>`);
    }

    if (ssProduct.description) {
      parts.push(ssProduct.description);
    } else {
      const fallback = `Discover the perfect combination of quality, comfort, and style with ${styleName} from the ${brandName} collection. Designed with premium materials and attention to detail, this versatile piece is ideal for everyday wear, team outfitting, or custom branding. ${brandName} delivers reliable performance and modern design that fits your lifestyle.`;
      parts.push(`<p>${fallback}</p>`);
    }

    return parts.join('\n\n');
  }

  normalizeProductOptions(ssProductGroup) {
    const colorMap = new Map();
    const sizes = new Set();

    ssProductGroup.forEach(variant => {
      if (variant.colorName) {
        if (!colorMap.has(variant.colorName)) {
          const hexCode = variant.Color1 || variant.color1 || null;
          const swatchUrl = variant.swatchUrl || null;

          logger.info(`Color data for ${variant.colorName}:`, {
            Color1: variant.Color1,
            color1: variant.color1,
            hexCode,
            swatchUrl,
            variantKeys: Object.keys(variant).filter(k => k.toLowerCase().includes('color'))
          });

          colorMap.set(variant.colorName, {
            hexCode,
            swatchUrl
          });
        }
      }
      if (variant.sizeName) sizes.add(variant.sizeName);
    });

    const options = [];

    if (colorMap.size > 0) {
      options.push({
        display_name: 'Color',
        type: 'swatch',
        option_values: Array.from(colorMap.entries()).map(([color, data], index) => {
          const optionValue = {
            label: color,
            is_default: index === 0
          };

          if (data.hexCode) {
            optionValue.value_data = {
              colors: [data.hexCode]
            };
          } else if (data.swatchUrl) {
            optionValue.value_data = {
              image_url: data.swatchUrl
            };
          } else {
            logger.warn(`No color data available for ${color}, using default gray`);
            optionValue.value_data = {
              colors: ['#808080']
            };
          }

          return optionValue;
        })
      });
    }

    if (sizes.size > 0) {
      options.push({
        display_name: 'Size',
        type: 'rectangles',
        option_values: Array.from(sizes).map((size, index) => ({ label: size, is_default: index === 0 }))
      });
    }

    return options;
  }

  buildSEOTitle(productName, brandName, styleName) {
    let title = '';
    if (brandName && styleName) {
      title = `${brandName} Style ${styleName} | HTW`;
    } else if (brandName) {
      title = `${brandName} ${productName}`;
    } else {
      title = productName;
    }
    return title.length > 70 ? title.substring(0, 67) + '...' : title;
  }

  buildSEODescription(ssProduct) {
    const brandName = ssProduct.brandName || '';
    const styleName = ssProduct.style || ssProduct.styleName || '';
    const styleId = ssProduct.styleID || '';

    const description = `Shop ${brandName} style ${styleName} at Heat Transfer Warehouse for quality apparel and accessories, ideal for custom branding, team uniforms, and promotional products.`;

    return description.length > 160 ? description.substring(0, 157) + '...' : description;
  }

  getFinalImageUrl(imageUrl) {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://cdn.ssactivewear.com/${imageUrl}`;
  }
}

module.exports = new SSActivewearService();
