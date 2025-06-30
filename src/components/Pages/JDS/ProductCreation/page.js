import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { BiLoaderAlt } from "react-icons/bi";
import { GoPlusCircle } from "react-icons/go";
import Toast from "../../../ui/toast";
import ProductCard from "./product-card";
import ErrorHandler from "../../../ErrorHandler/page";
import { useVariantUtils } from "./utilities/variant-utils";
import { useBCProductUtils } from "./utilities/bc-utils";
import VariantPopOver from "./variant-popover";

function JDSProductCreation() {
  const { buildProductVariantsFromJDSData, buildAllVariants } =
    useVariantUtils();
  const { addProductsToBC } = useBCProductUtils();
  const state = useSelector((state) => state.jdsReducer);
  const importComplete = state.importComplete;
  const dispatch = useDispatch();
  const priceRefs = React.useRef({});
  const [importedProducts, setImportedProducts] = React.useState([]);
  const [mainProducts, setMainProducts] = React.useState([]);
  const [priceInputs, setPriceInputs] = React.useState({});
  const [skuInput, setSkuInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [bcLoading, setBcLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [BCError, setBCError] = React.useState(null);
  const [bcCategoriesList, setBcCategoriesList] = React.useState([]);
  const [bcCategoriesErrors, setBcCategoriesErrors] = React.useState(null);
  const [storeToUse, setStoreToUse] = React.useState("htw");
  const [bcProductsAddSuccess, setBcProductsAddSuccess] = React.useState(false);
  const [activeProductIndex, setActiveProductIndex] = React.useState(null);
  const [activeProduct, setActiveProduct] = React.useState(null);

  const storeToUseMap = {
    htw: "Heat Transfer Warehouse",
    sff: "Shirts From Fargo",
    sandbox: "Sandbox Store",
  };

  const bundledSkus = (string) => {
    return string.split(",").map((sku) => sku);
  };

  const addVariantsToggle = (index) => {
    setActiveProductIndex(index);
    const copiedProduct = mainProducts[index];
    console.log("Adding variants for product at index:", index, copiedProduct);

    copiedProduct.variants = copiedProduct.originalVariants || [];

    console.log("Adding variants for product:", copiedProduct);

    setActiveProduct(JSON.parse(JSON.stringify(copiedProduct)));
  };

  useEffect(() => {
    setImportedProducts(
      state.productsToImport.map((product) => {
        return {
          name: product.name || "",
          sku: product.sku || "",
          price: product.oneCase || 0,
          weight: 1,
          categories: [],
          thumbnail: product.image || "",
          description: product.description || "",
        };
      })
    );
  }, [state.productsToImport]);

  useEffect(() => {
    dispatch({
      type: "GET_BIG_COMMERCE_CATEGORIES",
      payload: { store: storeToUse },
    });
  }, [dispatch, storeToUse]);

  useEffect(() => {
    setBcCategoriesList(state.bcCategoriesList?.data?.site?.categoryTree);
    setBcCategoriesErrors(state.bcCategoriesErrors);
    setBcLoading(state.bcLoading);
    setBCError(state.bcProductsAddError);
    setBcProductsAddSuccess(state.bcProductsAddSuccess);
  }, [
    state.bcCategoriesList,
    state.bcCategoriesErrors,
    state.bcLoading,
    state.bcProductsAddError,
    state.bcProductsAddSuccess,
  ]);

  useEffect(() => {
    setLoading(state.loading);
    setError(state.error);
  }, [state.loading, state.error]);

  const getJDSProductData = () => {
    const skus = bundledSkus(skuInput);

    dispatch({
      type: "GET_JDS_PRODUCT_DATA",
      payload: skus,
    });
  };

  const addNewProduct = () => {
    setMainProducts((prevProducts) => [
      ...prevProducts,
      {
        name: "",
        sku: "",
        price: 0,
        weight: 1,
        categories: [],
        thumbnail: "",
        description: "",
        variants: [],
        store: "htw",
      },
    ]);
  };

  // Add this effect:
  useEffect(() => {
    if (importComplete && importedProducts.length > 0) {
      buildProductVariantsFromJDSData(importedProducts, setActiveProduct);

      // Reset the flag!
      dispatch({ type: "CLEAR_JDS_IMPORT_COMPLETE" });
    }
    // eslint-disable-next-line
  }, [importComplete, importedProducts]);

  const saveVariants = () => {
    const finalVariants = buildAllVariants(activeProduct);
    const correspondingProduct = mainProducts[activeProductIndex];
    setMainProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[activeProductIndex] = {
        ...correspondingProduct,
        name: activeProduct.name,
        price: activeProduct.price,
        variants: finalVariants,
        originalVariants: activeProduct.variants,
        options: activeProduct.variants.map((v, index) => {
          return {
            display_name: v.display_name,
            type: v.type,
            sort_order: index,
            option_values: v.option_values.map((opt) => ({
              label: opt.label,
              is_default: opt.is_default,
              sort_order: opt.sort_order || 0,
            })),
          };
        }),
      };
      return updatedProducts;
    });
    setActiveProductIndex(null);
    setActiveProduct(null);
  };

  const removeProduct = (index) => {
    setMainProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts.splice(index, 1);
      return updatedProducts;
    });
  };

  return (
    <>
      <Toast
        onClose={() => dispatch({ type: "CLEAR_PRODUCT_ADD_SUCCESS" })}
        isOpen={bcProductsAddSuccess}
        title={"Products Added to BigCommerce"}
        variant={"success"}
      />
      <ErrorHandler
        shouldShow={bcCategoriesErrors}
        title="Error Fetching BigCommerce Categories"
        message={bcCategoriesErrors}
        onClose={() => {
          dispatch({ type: "CLEAR_BIG_COMMERCE_CATEGORIES_ERROR" });
          setBcCategoriesErrors(null);
        }}
      />
      <ErrorHandler
        shouldShow={BCError}
        title="Error Adding Products to BigCommerce"
        message={BCError}
        onClose={() => {
          dispatch({ type: "CLEAR_BC_PRODUCT_ADD_ERROR" });
          setBcCategoriesErrors(null);
        }}
      />
      <ErrorHandler
        shouldShow={error}
        title="Error Fetching JDS Product Data"
        message={error}
        onClose={() => {
          dispatch({ type: "CLEAR_JDS_ERROR" });
          setError(null);
        }}
      />

      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">
        JDS Product Import
      </h1>
      <div className="flex justify-center gap-2 mt-8 mb-4 items-center">
        <Button
          className={
            "bg-secondary flex items-center justify-center w-[180px] h-[40px] text-white m-0"
          }
          disabled={bcLoading || !mainProducts.length}
          onClick={(e) => addProductsToBC(mainProducts)}>
          {bcLoading ? (
            <BiLoaderAlt className="animate-spin z-10 block text-white w-6 h-6" />
          ) : (
            "Add Products To BC"
          )}
        </Button>
      </div>
      <ul className="list-none w-full flex flex-col gap-2 mb-8 max-w-screen-lg mx-auto">
        {mainProducts.length > 0 &&
          mainProducts.map((product, index) => {
            const totalCatCount = product.categories?.length || 0;
            return (
              <li key={index}>
                <ProductCard
                  product={product}
                  index={index}
                  totalCatCount={totalCatCount}
                  mainProducts={mainProducts}
                  setMainProducts={setMainProducts}
                  priceRefs={priceRefs}
                  priceInputs={priceInputs}
                  setPriceInputs={setPriceInputs}
                  removeProduct={removeProduct}
                  bcCategoriesList={bcCategoriesList}
                  storeToUseMap={storeToUseMap}
                  addVariantsToggle={addVariantsToggle}
                  setStoreToUse={setStoreToUse}
                />
              </li>
            );
          })}
        <li>
          <Card className="p-0">
            <button
              onClick={addNewProduct}
              className="flex w-full p-4 items-center justify-between">
              Add New Product
              <GoPlusCircle className="w-6 h-6" />
            </button>
          </Card>
        </li>
      </ul>
      <VariantPopOver
        activeProduct={activeProduct}
        setActiveProduct={setActiveProduct}
        activeProductIndex={activeProductIndex}
        setActiveProductIndex={setActiveProductIndex}
        saveVariants={saveVariants}
        skuInput={skuInput}
        setSkuInput={setSkuInput}
        loading={loading}
        getJDSProductData={getJDSProductData}
      />
    </>
  );
}

export default JDSProductCreation;
