import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../../../ui/card';
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from '../../../ui/dropdown';
import { FaCheck } from 'react-icons/fa';
import CategoryPicker from './category-folders';
import { twMerge } from 'tailwind-merge';
import { Button } from '../../../ui/button';
import { GoPlusCircle } from 'react-icons/go';
import SkuInput from './variant-sku-input';
import { HiMiniCog8Tooth } from 'react-icons/hi2';

function ProductCard({
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
  addVariantsToggle,
  setStoreToUse,
}) {
  const [priceMultiplier, setPriceMultiplier] = useState(1.5);
  const previousMultiplier = useRef(priceMultiplier);
  function groupOptionValuesByDisplayName() {
    const grouped = {};

    product.variants?.forEach((variant) => {
      variant.option_values.forEach((opt) => {
        if (!grouped[opt.option_display_name]) {
          grouped[opt.option_display_name] = {
            type: opt.type,
            valuesSet: new Set(),
          };
        }
        grouped[opt.option_display_name].valuesSet.add(opt.label);
      });
    });

    // Map to array format
    return Object.entries(grouped).map(([option_name, { type, valuesSet }]) => ({
      option_name,
      type,
      values: Array.from(valuesSet),
    }));
  }

  useEffect(() => {
    setMainProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        price: (prevProducts[index].price / previousMultiplier.current) * priceMultiplier,
        variants:
          product.variants?.map((variant, i) => ({
            ...variant,
            price: Number(
              ((prevProducts[index].variants?.[i]?.price || variant.price) /
                previousMultiplier.current) *
                priceMultiplier
            ).toFixed(2),
          })) || [],
      };
      return updatedProducts;
    });

    // Update previousMultiplier *after* adjusting prices
    previousMultiplier.current = priceMultiplier;
  }, [priceMultiplier]);

  const groupProductVariants = groupOptionValuesByDisplayName();

  return (
    <Card className="grid grid-cols-[1fr_min-content] gap-8 p-4 my-2 rounded-md relative">
      <div className="flex flex-col gap-3 w-full">
        <div className="grid gap-4 grid-cols-5">
          <fieldset className="flex w-full col-span-4 flex-col gap-1 items-start">
            <label className="font-medium" htmlFor={`sku-${product.name + index}`}>
              Product Name
            </label>
            <input
              className="border border-gray-300 p-2 rounded-md m-0 w-full"
              type="text"
              id={`sku-${product.name + index}`}
              value={product.name}
              onChange={(e) => {
                setMainProducts((prevProducts) => {
                  const updatedProducts = [...prevProducts];
                  updatedProducts[index].name = e.target.value;
                  return updatedProducts;
                });
              }}
            />
          </fieldset>
          <fieldset className="flex w-full flex-col col-span-1 gap-1 items-start">
            <label className="font-medium" htmlFor={`sku-${product.sku + index}`}>
              Sku
            </label>
            <input
              className="border border-gray-300 p-2 rounded-md m-0 w-full "
              type="text"
              id={`sku-${product.sku + index}`}
              value={product.sku}
              onChange={(e) => {
                setMainProducts((prevProducts) => {
                  const updatedProducts = [...prevProducts];
                  updatedProducts[index].sku = e.target.value;
                  return updatedProducts;
                });
              }}
            />
          </fieldset>
        </div>
        <div className="flex items-center gap-4">
          <fieldset className="flex flex-col gap-1 items-start">
            <label className="font-medium" htmlFor={`sku-${product.price + index}`}>
              Price
            </label>
            <input
              className="border border-gray-300 p-2 rounded-md m-0 w-full max-w-[100px]"
              type="text"
              inputMode="decimal"
              ref={(el) => (priceRefs.current[`${product.sku}-${index}`] = el)}
              id={`sku-${product.sku}-${index}`}
              value={`$ ${
                priceInputs[`${product.sku}-${index}`] ?? (product.price * 1.5).toFixed(2)
              }`}
              onChange={(e) => {
                // Strip everything except digits and decimal point
                let raw = e.target.value.replace(/[^0-9.]/g, '');

                // Allow only one decimal point
                const parts = raw.split('.');
                if (parts.length > 2) return;

                // Set user input
                setPriceInputs((prev) => ({
                  ...prev,
                  [`${product.sku}-${index}`]: raw,
                }));

                const parsed = parseFloat(raw);
                if (!isNaN(parsed)) {
                  setMainProducts((prevProducts) => {
                    const updated = [...prevProducts];
                    updated[index].price = parsed / priceMultiplier;
                    return updated;
                  });
                }
              }}
              onBlur={() => {
                const key = `${product.sku}-${index}`;
                const raw = priceInputs[key];

                const parsed = parseFloat(raw);

                if (!raw || isNaN(parsed)) {
                  const fallback =
                    product.price && !isNaN(product.price)
                      ? (product.price * priceMultiplier).toFixed(2)
                      : '0.00';
                  // Reset to calculated value if input is empty or invalid
                  setPriceInputs((prev) => ({
                    ...prev,
                    [key]: fallback,
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
          <fieldset className="flex flex-col gap-1 items-start">
            <label className="font-medium" htmlFor={`price-multiplier-${product.sku}-${index}`}>
              Price Multiplier
            </label>
            <input
              className="border border-gray-300 p-2 rounded-md m-0 w-full max-w-[100px]"
              type="number"
              step={0.1}
              value={priceMultiplier}
              onChange={(e) => {
                const newValue = e.target.value;

                // Save current multiplier before updating
                setPriceMultiplier(newValue);
              }}
              onBlur={(e) => {
                const rawValue = e.target.value;
                const parsed = parseFloat(rawValue);

                previousMultiplier.current = priceMultiplier;
                setPriceMultiplier(!rawValue || isNaN(parsed) ? 1.5 : parsed);
              }}
            />
          </fieldset>
          <fieldset className="flex flex-col gap-1 items-start">
            <label className="font-medium">Storefront</label>
            <DropDownContainer className="mb-0" type="click">
              <DropDownTrigger className="!bg-white text-nowrap hover:border-secondary !justify-between border w-[230px] border-gray-300">
                {storeToUseMap[product.store]}
              </DropDownTrigger>
              <DropDownContent>
                <DropDownItem
                  className={twMerge(
                    product.store === 'htw' && 'bg-secondary/10',
                    'flex items-center justify-between'
                  )}
                  onClick={() => {
                    setMainProducts((prev) => {
                      const updatedProducts = [...prev];
                      updatedProducts[index].store = 'htw';
                      return updatedProducts;
                    });
                    setStoreToUse('htw');
                  }}
                >
                  Heat Transfer Warehouse
                  {product.store === 'htw' && <FaCheck className="text-secondary w-4 h-4 ml-2" />}
                </DropDownItem>
                <DropDownItem
                  className={twMerge(
                    product.store === 'sff' && 'bg-secondary/10',
                    'flex items-center justify-between'
                  )}
                  onClick={() => {
                    setMainProducts((prev) => {
                      const updatedProducts = [...prev];
                      updatedProducts[index].store = 'sff';
                      return updatedProducts;
                    });
                    setStoreToUse('sff');
                  }}
                >
                  Shirts From Fargo
                  {product.store === 'sff' && <FaCheck className="text-secondary w-4 h-4 ml-2" />}
                </DropDownItem>
                <DropDownItem
                  className={twMerge(
                    product.store === 'sandbox' && 'bg-secondary/10',
                    'flex items-center justify-between'
                  )}
                  onClick={() => {
                    setMainProducts((prev) => {
                      const updatedProducts = [...prev];
                      updatedProducts[index].store = 'sandbox';
                      return updatedProducts;
                    });
                    setStoreToUse('sandbox');
                  }}
                >
                  Sandbox Store
                  {product.store === 'sandbox' && (
                    <FaCheck className="text-secondary w-4 h-4 ml-2" />
                  )}
                </DropDownItem>
              </DropDownContent>
            </DropDownContainer>
          </fieldset>
        </div>
        <fieldset>
          <label className="font-medium" htmlFor={`categories-${product.sku}-${index}`}>
            Categories
            <span className="text-sm ml-1 font-normal text-secondary">({totalCatCount})</span>
          </label>
          <div className="w-full border border-gray-300 rounded mt-2 p-2 max-h-[275px] overflow-y-auto">
            <CategoryPicker
              props={{
                bcCategoriesList,
                mainProducts,
                setMainProducts,
                sku: product.sku,
              }}
            />
          </div>
        </fieldset>
        <div>
          <h2 className="font-medium flex items-center justify-between mt-2">
            Variant Options
            {product.variants?.length > 0 && (
              <button
                onClick={() => addVariantsToggle(index)}
                className="font-normal text-sm flex items-center gap-1 hover:text-secondaryLight text-secondary"
              >
                <HiMiniCog8Tooth className="w-4 h-4" />
                Configure Options
              </button>
            )}
          </h2>
          {product.variants?.length < 1 ? (
            <div className="flex py-6 flex-col gap-4 items-center justify-center">
              <p className="text-sm text-neutral">No option has been added yet</p>
              <button
                className="mx-auto text-sm font-light hover:bg-secondary/5 border-secondary flex items-center justify-center gap-2 py-2 px-3 rounded border text-secondary"
                onClick={() => addVariantsToggle(index)}
              >
                <GoPlusCircle className="w-4 h-4" />
                Add Variant Option
              </button>
            </div>
          ) : (
            <div className="flex flex-col mt-2 mb-4">
              <div className="grid border-b text-sm font-medium border-stone-300 py-4 grid-cols-10 gap-8">
                <p className="w-full col-span-2">Option Name</p>
                <p className="w-full col-span-2">Type</p>
                <p className="w-full col-span-6">Values</p>
              </div>
              {groupProductVariants?.map((option, optIndex) => {
                return (
                  <div className="grid border-b border-stone-300 text-sm text-neutral py-4 grid-cols-10 gap-8">
                    <p className="w-full col-span-2">{option.option_name}</p>
                    <p className="w-full col-span-2">{option.type}</p>
                    <p className="w-full col-span-6">{option.values.join(', ')}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <fieldset className="flex flex-col">
          <label className="font-medium mb-3" htmlFor="">
            Variants
          </label>
          {product.variants?.length > 0 && (
            <div className="flex border-stone-400 overflow-hidden border rounded-md flex-col">
              <div className="grid border-b bg-stone-100 border-stone-400 grid-cols-10">
                <p className="w-full col-span-4 border-r border-stone-400 p-3">Variant</p>
                <p className="w-full col-span-4 border-r border-stone-400 p-3">SKU</p>
                <p className="w-full col-span-2 p-3">Price</p>
              </div>
              {product.variants?.map((variant, variantIndex) => {
                const createdName = variant.option_values.map((option) => option.label).join(' ');

                const allSkus = product.variants
                  .filter((v, i) => i !== variantIndex)
                  .map((v) => v.sku);

                return (
                  <div
                    key={`${variant.sku}-${variantIndex}`}
                    className={twMerge(
                      'grid grid-cols-10',
                      variantIndex !== product.variants.length - 1 && 'border-b border-stone-400'
                    )}
                  >
                    <p className="w-full text-nowrap overflow-hidden text-stone-500 cursor-not-allowed col-span-4 border-r border-stone-400 p-3">
                      {createdName}
                    </p>
                    <span className="w-full col-span-4 border-r border-stone-400 ">
                      <SkuInput
                        value={variant.sku}
                        allSkus={product.variants
                          .filter((v, i) => i !== variantIndex)
                          .map((v) => v.sku)}
                        onChange={(newSku) => {
                          // Only update if valid (no duplicate)
                          setMainProducts((prevProducts) => {
                            const updatedProducts = [...prevProducts];
                            updatedProducts[index].variants[variantIndex].sku = newSku;
                            return updatedProducts;
                          });
                        }}
                      />
                    </span>
                    <span className="w-full col-span-2">
                      <input
                        className="max-w-full m-0 p-3 h-full rounded-none border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none"
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value);
                          if (!isNaN(newPrice)) {
                            setMainProducts((prevProducts) => {
                              const updatedProducts = [...prevProducts];
                              updatedProducts[index].variants[variantIndex].price = newPrice;
                              return updatedProducts;
                            });
                          }
                        }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>
      </div>
      <Button
        onClick={() => removeProduct(index)}
        className="py-1 px-2 text-red-600 hover:bg-red-600/10 transition-colors text-sm font-medium"
      >
        Remove
      </Button>
    </Card>
  );
}

export default ProductCard;
