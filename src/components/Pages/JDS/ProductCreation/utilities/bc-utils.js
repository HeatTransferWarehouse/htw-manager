import { useDispatch } from "react-redux";

export const useBCProductUtils = () => {
  const dispatch = useDispatch();
  const addProductsToBC = (importedProducts) => {
    const allProductsValid = importedProducts.every(
      (product) =>
        product.name && product.price && product.categories.length > 0
    );
    if (!allProductsValid) {
      alert(
        "Please ensure all products have a name, SKU, price, and at least one category selected."
      );
      return;
    }
    const cleanedProducts = importedProducts.map((product) => {
      return {
        name: product.name,
        sku: product.sku,
        weight: 0,
        price: parseFloat((product.price * 1.5).toFixed(2)),
        categories: product.categories,
        images: [
          {
            image_url: product.thumbnail,
            is_thumbnail: true,
            sort_order: -2147483648,
          },
        ],
        variants: product.variants,
        options: product.options || [],
        description: product.description || "",
        type: "physical",
        is_visible: false,
        is_featured: false,
        is_free_shipping: false,
        store: product.store || "sandbox",
      };
    });

    dispatch({
      type: "ADD_JDS_PRODUCTS_TO_BC",
      payload: { products: cleanedProducts },
    });
  };

  return {
    addProductsToBC,
  };
};
