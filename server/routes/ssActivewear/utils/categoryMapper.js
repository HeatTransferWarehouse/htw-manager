class CategoryMapper {
  constructor() {
    this.brandToCategoryMap = {
      'Richardson': 'Headwear',
      'LEGACY': 'Headwear',
      'Legacy': 'Headwear',
      '47 Brand': 'Headwear',
      '47 BRAND': 'Headwear',
      'Independent Trading Co.': 498,
      'Independent Trading': 498,
    };
  }

  findSubcategoryByKeywords(productName, productCategory = '') {
    const searchText = `${productName.toLowerCase()} ${productCategory.toLowerCase()}`;

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      for (const keyword of keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return null;
  }

  async mapToBigCommerceCategory(productName, productCategory, bcCategories, baseCategoryId = null, brandName = null) {
    const searchText = `${productName.toLowerCase()} ${productCategory.toLowerCase()}`;

    const CLOTHING_ID = 468;
    const HEADWEAR_ID = 503;

    for (const [brand, categoryName] of Object.entries(this.brandToCategoryMap)) {
      if (productName.includes(brand)) {
  
        if (typeof categoryName === 'number') {
          return categoryName;
        }

      
        if (categoryName.toLowerCase() === 'headwear') {
          return HEADWEAR_ID;
        } else if (categoryName.toLowerCase() === 'clothing') {
          return CLOTHING_ID;
        } else {
          const category = bcCategories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
          if (category) return category.id;
        }
      }
    }

    if (searchText.includes('hat') || searchText.includes('cap') || searchText.includes('beanie') ||
        searchText.includes('headwear') || searchText.includes('trucker') || searchText.includes('snapback') ||
        searchText.includes('visor')) {
      return HEADWEAR_ID;
    }

    if (searchText.includes('bag') || searchText.includes('backpack') || searchText.includes('tote') ||
        searchText.includes('duffel') || searchText.includes('cinch')) {
      const bags = bcCategories.find(cat => cat.name.toLowerCase() === 'bags');
      if (bags) return bags.id;
    }

    if (searchText.includes('jacket') || searchText.includes('hoodie') || searchText.includes('fleece') ||
        searchText.includes('pullover') || searchText.includes('sweatshirt')) {
      const outerwear = bcCategories.find(cat => cat.name.toLowerCase() === 'outerwear');
      if (outerwear) return outerwear.id;
    }

    if (searchText.includes('youth') || searchText.includes('kids') || searchText.includes('children')) {
      const youth = bcCategories.find(cat => cat.name.toLowerCase() === 'youth');
      if (youth) return youth.id;
    }

    if (searchText.includes('women') || searchText.includes('ladies')) {
      const womens = bcCategories.find(cat => cat.name.toLowerCase() === 'womens');
      if (womens) return womens.id;
    }

    const mens = bcCategories.find(cat => cat.name.toLowerCase() === 'mens clothing blanks');
    if (mens) return mens.id;

    return CLOTHING_ID;
  }

  getCategoryMapping() {
    return Object.keys(this.categoryKeywords);
  }
}

module.exports = new CategoryMapper();
