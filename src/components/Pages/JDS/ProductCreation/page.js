import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { BiLoaderAlt, BiPlus } from "react-icons/bi";
import { GoPlusCircle } from "react-icons/go";
import Toast from "../../../ui/toast";
import ProductCard from "./product-card";
import ErrorHandler from "../../../ErrorHandler/page";
import Popover from "../../../ui/popover";
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from "../../../ui/dropdown";
import { twMerge } from "tailwind-merge";
import { FaCheck, FaSpinner } from "react-icons/fa6";
import colorNameList from "color-name-list";
import { AiFillMinusCircle } from "react-icons/ai";
import { useVariantUtils } from "./utilities/variant-utils";
import { useBCProductUtils } from "./utilities/bc-utils";

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

  const variantTypeMap = {
    radio_buttons: "Radio Buttons",
    rectangles: "Rectangle List",
    dropdown: "Dropdown",
    swatch: "Swatch",
  };

  const bundledSkus = (string) => {
    return string.split(",").map((sku) => sku);
  };

  function extractOptionsFromVariants(variants) {
    const optionMap = new Map();

    for (const variant of variants) {
      for (const opt of variant.option_values) {
        const key = `${opt.option_display_name}|${opt.type}`;
        if (!optionMap.has(key)) {
          optionMap.set(key, {
            display_name: opt.option_display_name,
            type: opt.type,
            option_values: [],
          });
        }

        const existingValues = optionMap.get(key).option_values;
        const alreadyExists = existingValues.some((v) => v.label === opt.label);
        if (!alreadyExists) {
          existingValues.push({
            label: opt.label,
            is_default: false,
            sort_order: existingValues.length,
          });
        }
      }
    }

    return Array.from(optionMap.values());
  }

  const addVariantsToggle = (index) => {
    setActiveProductIndex(index);
    const copiedProduct = JSON.parse(JSON.stringify(mainProducts[index]));
    setActiveProduct((prev) => {
      return {
        ...prev,
        variants: copiedProduct.originalVariants || [],
      };
    });
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
                  props={{
                    product,
                    index,
                    totalCatCount,
                    mainProducts,
                    setMainProducts,
                    priceRefs,
                    priceInputs,
                    setPriceInputs,
                    removeProduct,
                    bcCategoriesList,
                    storeToUseMap,
                    addVariantsToggle: (index) => addVariantsToggle(index),
                    setStoreToUse,
                  }}
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
      <Popover
        open={activeProductIndex !== null}
        onOpenChange={() => setActiveProductIndex(null)}>
        <div className="h-20 flex items-center justify-between px-4 border-b border-neutral/20">
          <div className="flex items-center gap-1">
            <h2 className="font-medium text-xl">Variant Options</h2>
            <p className="text-neutral font-normal text-base">
              ({activeProduct?.variants.length || 0} options)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              onChange={(e) => setSkuInput(e.target.value)}
              value={skuInput}
              placeholder="Enter SKU(s) separated by commas to import"
              className="border border-gray-300 p-2 rounded-md m-0 w-[400px] max-w-md"
            />
            <button
              disabled={loading || !skuInput}
              onClick={(e) => getJDSProductData()}
              className="flex items-center text-nowrap justify-center w-[220px] h-[42px] gap-1 bg-white text-secondary rounded border-secondary border hover:bg-secondary/10 transition-colors">
              {loading ? (
                <BiLoaderAlt className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Import Variant Options <BiPlus className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                setActiveProduct((prev) => {
                  const updatedProduct = { ...prev };
                  updatedProduct.variants.push({
                    display_name: "",
                    type: "dropdown",
                    option_values: [
                      { label: "", is_default: false, sort_order: 0 },
                    ],
                  });
                  return updatedProduct;
                });
              }}
              className="flex items-center text-nowrap justify-center w-[220px] h-[42px] gap-1 bg-white text-secondary rounded border-secondary border hover:bg-secondary/10 transition-colors">
              Add New Variant Option <BiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-9rem)] overflow-auto">
          <div className="w-full flex flex-col gap-8 px-4 py-8">
            {activeProduct?.variants.map((variant, index) => {
              return (
                <div className="grid grid-cols-12 gap-8" key={index}>
                  <fieldset className="w-full col-span-3 flex flex-col gap-2">
                    <label htmlFor="">Name</label>
                    <input
                      type="text"
                      value={variant.display_name}
                      onChange={(e) => {
                        setActiveProduct((prev) => {
                          const updatedProduct = { ...prev };
                          updatedProduct.variants[index].display_name =
                            e.target.value;
                          return updatedProduct;
                        });
                      }}
                      placeholder="Color, Size, etc."
                      className="border border-gray-300 m-0 p-2 rounded-md w-full"
                    />
                    <button
                      onClick={() => {
                        setActiveProduct((prev) => {
                          const updatedProduct = { ...prev };
                          updatedProduct.variants.splice(index, 1);
                          return updatedProduct;
                        });
                      }}
                      className="col-start-1 row-start-2 text-red-600 w-fit">
                      Delete Option
                    </button>
                  </fieldset>
                  <fieldset className="w-full col-span-3 flex flex-col gap-2">
                    <label htmlFor="">Type</label>
                    <DropDownContainer
                      className="mb-0 p-0 top-0 w-full"
                      type="click">
                      <DropDownTrigger className="bg-white w-full text-nowrap hover:border-secondary top-0 justify-between border border-gray-300">
                        {variantTypeMap[variant.type] || "Select Type"}
                      </DropDownTrigger>
                      <DropDownContent>
                        <DropDownItem
                          className={twMerge(
                            variant.type === "radio_buttons" &&
                              "bg-secondary/10",
                            "flex items-center justify-between"
                          )}
                          onClick={() => {
                            setActiveProduct((prev) => {
                              const updatedProduct = { ...prev };
                              updatedProduct.variants[index].type =
                                "radio_buttons";
                              return updatedProduct;
                            });
                          }}>
                          Radio Buttons
                          {variant.type === "radio_buttons" && (
                            <FaCheck className="text-secondary w-4 h-4 ml-2" />
                          )}
                        </DropDownItem>
                        <DropDownItem
                          className={twMerge(
                            variant.type === "rectangles" && "bg-secondary/10",
                            "flex items-center justify-between"
                          )}
                          onClick={() => {
                            setActiveProduct((prev) => {
                              const updatedProduct = { ...prev };
                              updatedProduct.variants[index].type =
                                "rectangles";
                              return updatedProduct;
                            });
                          }}>
                          Rectangle List
                          {variant.type === "rectangles" && (
                            <FaCheck className="text-secondary w-4 h-4 ml-2" />
                          )}
                        </DropDownItem>
                        <DropDownItem
                          className={twMerge(
                            variant.type === "dropdown" && "bg-secondary/10",
                            "flex items-center justify-between"
                          )}
                          onClick={() => {
                            setActiveProduct((prev) => {
                              const updatedProduct = { ...prev };
                              updatedProduct.variants[index].type = "dropdown";
                              return updatedProduct;
                            });
                          }}>
                          Dropdown
                          {variant.type === "dropdown" && (
                            <FaCheck className="text-secondary w-4 h-4 ml-2" />
                          )}
                        </DropDownItem>
                        <DropDownItem
                          className={twMerge(
                            variant.type === "swatch" && "bg-secondary/10",
                            "flex items-center justify-between"
                          )}
                          onClick={() => {
                            setActiveProduct((prev) => {
                              const updatedProduct = { ...prev };
                              updatedProduct.variants[index].type = "swatch";
                              return updatedProduct;
                            });
                          }}>
                          Swatch
                          {variant.type === "swatch" && (
                            <FaCheck className="text-secondary w-4 h-4 ml-2" />
                          )}
                        </DropDownItem>
                      </DropDownContent>
                    </DropDownContainer>
                  </fieldset>
                  <fieldset className="w-full flex col-span-6 flex-col gap-2">
                    <label htmlFor="">Values</label>
                    <div className="flex flex-col w-full items-start gap-3">
                      {variant.option_values.map((option, optionIndex) => {
                        return (
                          <div
                            className="grid w-full grid-cols-[1fr_min-content] gap-4"
                            key={`optionValue-${optionIndex}`}>
                            <input
                              className="border border-gray-300 m-0 pl-2 py-2 rounded-md w-full"
                              onChange={(e) => {
                                setActiveProduct((prev) => {
                                  const updatedProduct = { ...prev };
                                  updatedProduct.variants[index].option_values[
                                    optionIndex
                                  ].label = e.target.value;

                                  return updatedProduct;
                                });
                              }}
                              value={option.label}
                              placeholder="Enter value here"
                              type="text"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setActiveProduct((prev) => {
                                    const updatedProduct = { ...prev };
                                    const currentOption =
                                      updatedProduct.variants[index]
                                        .option_values[optionIndex];
                                    if (!currentOption.is_default) {
                                      updatedProduct.variants[
                                        index
                                      ].option_values.forEach((val) => {
                                        val.is_default = false;
                                      });
                                    }

                                    updatedProduct.variants[
                                      index
                                    ].option_values[optionIndex].is_default =
                                      !option.is_default;

                                    return updatedProduct;
                                  });
                                }}
                                className="flex items-center test-sm gap-2">
                                <span
                                  className={twMerge(
                                    "w-5 h-5 flex items-center border justify-center rounded-full",
                                    option.is_default
                                      ? "border-secondary "
                                      : "border-neutral"
                                  )}>
                                  {option.is_default && (
                                    <span className="w-3 h-3 bg-secondary rounded-full" />
                                  )}
                                </span>
                                Default
                              </button>

                              <button
                                onClick={() => {
                                  setActiveProduct((prev) => {
                                    const updatedProduct = { ...prev };
                                    updatedProduct.variants[
                                      index
                                    ].option_values.splice(optionIndex, 1);
                                    return updatedProduct;
                                  });
                                }}
                                className={twMerge(
                                  "w-fit h-fit rounded-full",
                                  variant.option_values.length < 2 &&
                                    "opacity-0 pointer-events-none"
                                )}>
                                <AiFillMinusCircle className="w-[0.8rem] h-[0.8rem] fill-red-600" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        className="text-secondary text-sm h-fit w-fit"
                        onClick={() => {
                          setActiveProduct((prev) => {
                            const updatedProduct = { ...prev };
                            updatedProduct.variants[index].option_values.push({
                              label: "",
                              is_default: false,
                              sort_order:
                                updatedProduct.variants[index].option_values
                                  .length,
                            });
                            return updatedProduct;
                          });
                        }}>
                        Add Another Value
                      </button>
                    </div>
                  </fieldset>
                </div>
              );
            })}
          </div>
        </div>
        <div className="h-16 flex items-center justify-end gap-4 border-t border-neutral/20 px-4">
          <button
            className="text-secondary"
            onClick={() => {
              setActiveProductIndex(null);
              setActiveProduct(null);
            }}>
            Cancel
          </button>
          <button
            onClick={() => saveVariants()}
            className="p-2 bg-secondary text-white rounded">
            Save Variants
          </button>
        </div>
      </Popover>
    </>
  );
}

export default JDSProductCreation;
