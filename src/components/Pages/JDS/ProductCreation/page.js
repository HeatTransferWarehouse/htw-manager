import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { BiLoaderAlt } from "react-icons/bi";
import { MdError } from "react-icons/md";
import CategoryPicker from "./category-folders";
import { FaCheck } from "react-icons/fa6";
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from "../../../ui/dropdown";
import { twMerge } from "tailwind-merge";
import Toast from "../../../ui/toast";

function JDSProductCreation() {
  const state = useSelector((state) => state.jdsReducer);
  const dispatch = useDispatch();
  const priceRefs = React.useRef({});
  const [importedProducts, setImportedProducts] = React.useState([]);
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

  const storeToUseMap = {
    htw: "Heat Transfer Warehouse",
    sff: "Shirts From Fargo",
    sandbox: "Sandbox Store",
  };

  const bundledSkus = (string) => {
    return string.split(",").map((sku) => sku);
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
          thumbnail: product.thumbnail || "",
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

  const removeProduct = (index) => {
    setImportedProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts.splice(index, 1);
      return updatedProducts;
    });
    dispatch({
      type: "REMOVE_JDS_PRODUCT",
      payload: importedProducts[index].sku,
    });
  };

  const addProductsToBC = () => {
    const allProductsValid = importedProducts.every(
      (product) =>
        product.name &&
        product.sku &&
        product.price &&
        product.categories.length > 0
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
        price: product.price * 1.5,
        categories: product.categories,
        images: [
          {
            image_url: product.thumbnail,
            is_thumbnail: true,
            sort_order: -2147483648,
          },
        ],
        description: product.description || "",
        type: "physical",
        is_visible: false,
        is_featured: false,
        is_free_shipping: false,
      };
    });
    dispatch({
      type: "ADD_JDS_PRODUCTS_TO_BC",
      payload: { products: cleanedProducts, store: storeToUse },
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
      {bcCategoriesErrors && (
        <div className="w-screen h-screen flex items-center justify-center bg-black/50 fixed top-0 left-0 z-50">
          <Card className="max-w-screen-md flex flex-col items-center justify-center gap-4 w-full p-6">
            <MdError className="text-6xl text-red-600" />
            <h2 className="text-xl font-semibold ">
              Error Fetching BigCommerce Categories
            </h2>
            <p className="text-base">{bcCategoriesErrors}</p>
            <Button
              className="mt-4 bg-secondary text-white"
              onClick={() => {
                dispatch({ type: "CLEAR_BIG_COMMERCE_CATEGORIES_ERROR" });
                setBcCategoriesErrors(null);
              }}>
              Okay
            </Button>
          </Card>
        </div>
      )}
      {BCError && (
        <div className="w-screen h-screen flex items-center justify-center bg-black/50 fixed top-0 left-0 z-50">
          <Card className="max-w-screen-md flex flex-col items-center justify-center gap-4 w-full p-6">
            <MdError className="text-6xl text-red-600" />
            <h2 className="text-xl font-semibold ">
              Error Adding Products to BigCommerce
            </h2>
            <p className="text-lg">{BCError}</p>
            <Button
              className="mt-4 bg-secondary text-white"
              onClick={() => {
                dispatch({ type: "CLEAR_BC_PRODUCT_ADD_ERROR" });
                setBcCategoriesErrors(null);
              }}>
              Okay
            </Button>
          </Card>
        </div>
      )}
      {error && (
        <div className="w-screen h-screen flex items-center justify-center bg-black/50 fixed top-0 left-0 z-50">
          <Card className="max-w-screen-md flex flex-col items-center justify-center gap-4 w-full p-6">
            <MdError className="text-6xl text-red-600" />
            <h2 className="text-xl font-semibold ">
              Error Fetching JDS Product Data
            </h2>
            <p className="text-base">{error}</p>
            <Button
              className="mt-4 bg-secondary text-white"
              onClick={() => {
                dispatch({ type: "CLEAR_JDS_ERROR" });
                setError(null);
              }}>
              Okay
            </Button>
          </Card>
        </div>
      )}
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">
        JDS Product Import
      </h1>
      <div className="flex justify-center gap-2 mt-8 items-center">
        <DropDownContainer type="click">
          <DropDownTrigger className="!bg-white text-nowrap hover:border-secondary !justify-between border w-[230px] border-gray-300">
            {storeToUseMap[storeToUse]}
          </DropDownTrigger>
          <DropDownContent>
            <DropDownItem
              className={twMerge(
                storeToUse === "htw" && "bg-secondary/10",
                "flex items-center justify-between"
              )}
              onClick={() => setStoreToUse("htw")}>
              Heat Transfer Warehouse
              {storeToUse === "htw" && (
                <FaCheck className="text-secondary w-4 h-4 ml-2" />
              )}
            </DropDownItem>
            <DropDownItem
              className={twMerge(
                storeToUse === "sff" && "bg-secondary/10",
                "flex items-center justify-between"
              )}
              onClick={() => setStoreToUse("sff")}>
              Shirts From Fargo
              {storeToUse === "sff" && (
                <FaCheck className="text-secondary w-4 h-4 ml-2" />
              )}
            </DropDownItem>
            <DropDownItem
              className={twMerge(
                storeToUse === "sandbox" && "bg-secondary/10",
                "flex items-center justify-between"
              )}
              onClick={() => setStoreToUse("sandbox")}>
              Sandbox Store
              {storeToUse === "sandbox" && (
                <FaCheck className="text-secondary w-4 h-4 ml-2" />
              )}
            </DropDownItem>
          </DropDownContent>
        </DropDownContainer>
        <input
          type="text"
          onChange={(e) => setSkuInput(e.target.value)}
          value={skuInput}
          placeholder="Enter SKU(s) separated by commas to import"
          className="border border-gray-300 p-2 rounded-md m-0 w-full max-w-md"
        />
        <Button
          className={
            "bg-secondary flex items-center justify-center w-[75px] h-[40px] text-white m-0"
          }
          disabled={loading || !skuInput}
          onClick={(e) => getJDSProductData()}>
          {loading ? (
            <BiLoaderAlt className="animate-spin z-10 block text-white w-6 h-6" />
          ) : (
            "Import"
          )}
        </Button>
        <Button
          className={
            "bg-secondary flex items-center justify-center w-[180px] h-[40px] text-white m-0"
          }
          disabled={bcLoading || !importedProducts.length}
          onClick={(e) => addProductsToBC()}>
          {bcLoading ? (
            <BiLoaderAlt className="animate-spin z-10 block text-white w-6 h-6" />
          ) : (
            "Add Products To BC"
          )}
        </Button>
      </div>
      {importedProducts.length > 0 && (
        <div className="flex w-full px-4 max-w-screen-xl mx-auto flex-col items-center my-4">
          {importedProducts.map((product, index) => {
            const totalCatCount = product.categories?.length || 0;
            return (
              <Card
                key={index}
                className="grid grid-cols-[250px_1fr_min-content] gap-8 p-4 my-2 rounded-md relative">
                <img src={product.thumbnail} className="w-full h-auto" alt="" />
                <div className="flex flex-col gap-3 w-full">
                  <div className="grid gap-4 grid-cols-5">
                    <fieldset className="flex w-full col-span-4 flex-col gap-1 items-start">
                      <label
                        className="font-medium"
                        htmlFor={`sku-${product.name + index}`}>
                        Product Name
                      </label>
                      <input
                        className="border border-gray-300 p-2 rounded-md m-0 w-full"
                        type="text"
                        id={`sku-${product.name + index}`}
                        value={product.name}
                        onChange={(e) => {
                          setImportedProducts((prevProducts) => {
                            const updatedProducts = [...prevProducts];
                            updatedProducts[index].name = e.target.value;
                            return updatedProducts;
                          });
                        }}
                      />
                    </fieldset>
                    <fieldset className="flex w-full flex-col col-span-1 gap-1 items-start">
                      <label
                        className="font-medium"
                        htmlFor={`sku-${product.sku + index}`}>
                        Sku
                      </label>
                      <input
                        className="border border-gray-300 p-2 rounded-md m-0 w-full "
                        type="text"
                        id={`sku-${product.sku + index}`}
                        value={product.sku}
                        onChange={(e) => {
                          setImportedProducts((prevProducts) => {
                            const updatedProducts = [...prevProducts];
                            updatedProducts[index].sku = e.target.value;
                            return updatedProducts;
                          });
                        }}
                      />
                    </fieldset>
                  </div>
                  <fieldset className="flex flex-col gap-1 items-start">
                    <label
                      className="font-medium"
                      htmlFor={`sku-${product.price + index}`}>
                      Price
                    </label>
                    <input
                      className="border border-gray-300 p-2 rounded-md m-0 w-full max-w-[100px]"
                      type="text"
                      inputMode="decimal"
                      ref={(el) =>
                        (priceRefs.current[`${product.sku}-${index}`] = el)
                      }
                      id={`sku-${product.sku}-${index}`}
                      value={`$ ${
                        priceInputs[`${product.sku}-${index}`] ??
                        (product.price * 1.5).toFixed(2)
                      }`}
                      onChange={(e) => {
                        // Strip everything except digits and decimal point
                        let raw = e.target.value.replace(/[^0-9.]/g, "");

                        // Allow only one decimal point
                        const parts = raw.split(".");
                        if (parts.length > 2) return;

                        // Set user input
                        setPriceInputs((prev) => ({
                          ...prev,
                          [`${product.sku}-${index}`]: raw,
                        }));

                        const parsed = parseFloat(raw);
                        if (!isNaN(parsed)) {
                          setImportedProducts((prevProducts) => {
                            const updated = [...prevProducts];
                            updated[index].twentyCases = parsed / 1.5;
                            return updated;
                          });
                        }
                      }}
                      onBlur={() => {
                        const key = `${product.sku}-${index}`;
                        const raw = priceInputs[key];

                        const parsed = parseFloat(raw);

                        if (!raw || isNaN(parsed)) {
                          // Reset to calculated value if input is empty or invalid
                          setPriceInputs((prev) => ({
                            ...prev,
                            [key]: (product.twentyCases * 1.5).toFixed(2),
                          }));
                        } else {
                          // Format to exactly 2 decimal places
                          setPriceInputs((prev) => ({
                            ...prev,
                            [key]: parsed.toFixed(2),
                          }));
                        }
                      }}
                    />
                  </fieldset>
                  <fieldset>
                    <label
                      className="font-medium"
                      htmlFor={`categories-${product.sku}-${index}`}>
                      Categories
                      <span className="text-sm ml-1 font-normal text-secondary">
                        ({totalCatCount})
                      </span>
                    </label>
                    <div className="w-full border border-gray-300 rounded mt-2 p-2 max-h-[400px] overflow-y-auto">
                      <CategoryPicker
                        props={{
                          bcCategoriesList,
                          setImportedProducts,
                          importedProducts,
                          sku: product.sku,
                        }}
                      />
                    </div>
                  </fieldset>
                </div>
                <Button
                  onClick={() => removeProduct(index)}
                  className="py-1 px-2 text-red-600 hover:bg-red-600/10 transition-colors text-sm font-medium">
                  Remove
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

export default JDSProductCreation;
