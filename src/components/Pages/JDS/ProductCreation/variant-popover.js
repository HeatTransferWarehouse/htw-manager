import React from "react";
import Popover from "../../../ui/popover";
import { BiLoaderAlt, BiPlus } from "react-icons/bi";
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from "../../../ui/dropdown";
import { twMerge } from "tailwind-merge";
import { AiFillMinusCircle } from "react-icons/ai";
import { FaCheck } from "react-icons/fa6";

const variantTypeMap = {
  radio_buttons: "Radio Buttons",
  rectangles: "Rectangle List",
  dropdown: "Dropdown",
  swatch: "Swatch",
};

function VariantPopOver({
  activeProductIndex,
  setActiveProductIndex,
  activeProduct,
  setActiveProduct,
  getJDSProductData,
  saveVariants,
  skuInput,
  setSkuInput,
  loading,
}) {
  return (
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
                          variant.type === "radio_buttons" && "bg-secondary/10",
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
                            updatedProduct.variants[index].type = "rectangles";
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

                                  updatedProduct.variants[index].option_values[
                                    optionIndex
                                  ].is_default = !option.is_default;

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
  );
}

export default VariantPopOver;
