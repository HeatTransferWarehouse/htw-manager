const fetch = require("node-fetch");

let activeToken;

let noDescriptionSyncStatus = {
  isSyncing: false,
};

let noImageAltSyncStatus = {
  isSyncing: false,
};

const getNoDescriptionSyncStatus = async () => {
  return noDescriptionSyncStatus;
};

const getNoImageAltSyncStatus = async () => {
  return noImageAltSyncStatus;
};

const updateNoDescriptionSyncStatus = async (bool) => {
  noDescriptionSyncStatus.isSyncing = bool;
};

const updateNoImageAltSyncStatus = async (bool) => {
  noImageAltSyncStatus.isSyncing = bool;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createSFFStoreFrontToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  const oneHourLater = now + 60 * 60;

  const url = ` https://api.bigcommerce.com/stores/${process.env.SFF_STORE_HASH}/v3/storefront/api-token`;

  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.SFF_AUTH_TOKEN,
    },
    body: JSON.stringify({
      channel_id: 1,
      allowed_cors_origins: [],
      expires_at: oneHourLater,
    }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    activeToken = data.data.token;
    return data;
  } catch (error) {
    console.error("Error creating token:", error);
  }
};

const getProductsWithImages = async () => {
  if (!activeToken) {
    await createSFFStoreFrontToken();
  }

  const queryText = `query getProducts($pageSize: Int = 50, $cursor: String) {
      site {
        products(first: $pageSize, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              entityId
              name
              images {
                edges {
                  node {
                    url(width: 75, height: 75)
                    altText
                  }
                }
              }
              categories {
                edges {
                  node {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }`;

  const url = "https://shirtsfromfargo.com/graphql";

  const productsWithoutImageAltTags = [];
  let cursor = "";
  let hasNextPage = true; // Assume there's a next page initially

  try {
    while (hasNextPage) {
      // Update the options with the current cursor
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          query: queryText,
          variables: { cursor },
        }),
      };

      // Fetch data for the current page
      const response = await fetch(url, options);
      const data = await response.json();

      // Extract relevant data
      const products = data.data.site.products.edges;
      hasNextPage = data.data.site.products.pageInfo.hasNextPage;
      cursor = data.data.site.products.pageInfo.endCursor; // Update cursor for the next request

      // Process products
      products.forEach((product) => {
        const productImages = product.node.images.edges;
        const productCategories = product.node.categories.edges;
        const imagesMissingAltTags = [];
        const categories = [];

        productImages.forEach((image) => {
          if (!image.node.altText || image.node.altText === "") {
            imagesMissingAltTags.push({
              imageUrl: image.node.url,
              altText: image.node.altText,
            });
          }
        });

        productCategories.forEach((category) => {
          categories.push(category.node.name);
        });

        if (imagesMissingAltTags.length > 0) {
          productsWithoutImageAltTags.push({
            productId: product.node.entityId,
            name: product.node.name,
            images: imagesMissingAltTags,
            categories,
          });
        }
      });
    }

    return productsWithoutImageAltTags;
  } catch (error) {
    console.error("Error fetching products with images:", error);
    return [];
  }
};

const fetchAllSffCategories = async () => {
  const url = `https://api.bigcommerce.com/stores/${process.env.SFF_STORE_HASH}/v3/catalog/categories?limit=100`;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.SFF_AUTH_TOKEN,
    },
  };

  const categoryMap = new Map();
  let currentPage = 1;
  let totalPages;

  try {
    do {
      const response = await fetch(`${url}&page=${currentPage}`, options);
      const data = await response.json();

      data.data.forEach((category) => {
        categoryMap.set(category.id, category.name);
      });

      totalPages = data.meta.pagination.total_pages;
      currentPage++;
    } while (currentPage <= totalPages);

    return categoryMap;
  } catch (error) {
    console.error("Error fetching SFF categories:", error);
    return categoryMap;
  }
};

const getSffProducts = async () => {
  const url = `https://api.bigcommerce.com/stores/${process.env.SFF_STORE_HASH}/v3/catalog/products?include_fields=description,name,categories&limit=100&is_visible=true`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.SFF_AUTH_TOKEN,
    },
  };

  const productsWithNoDescription = [];

  try {
    // Fetch all categories once
    const categoryMap = await fetchAllSffCategories();

    // Fetch the first page to determine total pages
    const firstResponse = await fetch(url, options);
    const firstData = await firstResponse.json();
    const totalPages = firstData.meta.pagination.total_pages;

    for (let i = 1; i <= totalPages; i++) {
      const pageUrl = `${url}&page=${i}`;
      const response = await fetch(pageUrl, options);
      const data = await response.json();

      data.data.forEach((product) => {
        if (
          !product.description ||
          product.description.trim().length === 0 ||
          !/<\/h[1-6]>/i.test(product.description)
        ) {
          const categoryNames = (product.categories || []).map(
            (categoryId) => categoryMap.get(categoryId) || "Unknown Category"
          );

          productsWithNoDescription.push({
            productId: product.id,
            name: product.name,
            description: product.description,
            categories: categoryNames,
          });
        }
      });

      // Add delay between requests to avoid rate limits
      await sleep(200);
    }

    return productsWithNoDescription;
  } catch (error) {
    console.error("Error fetching SFF products:", error);
    return [];
  }
};

module.exports = {
  fetchAllSffCategories,
  getSffProducts,
  getNoDescriptionSyncStatus,
  getNoImageAltSyncStatus,
  updateNoDescriptionSyncStatus,
  updateNoImageAltSyncStatus,
  createSFFStoreFrontToken,
  getProductsWithImages,
};
