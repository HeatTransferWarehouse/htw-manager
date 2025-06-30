export const useVariantUtils = () => {
  function parseNameForVariants(name) {
    // --- Find the size substring in the name ---
    let size = null;
    let sizeMatch =
      name.match(
        /(\d+\s*(?:\d+\/\d+)?("|”)?\s*x\s*\d+\s*(?:\d+\/\d+)?("|”)?)/i
      ) ||
      name.match(/(\d+\s*(?:\d+\/\d+)?("|”))/i) ||
      name.match(/(\d+\s*(?:\d+\/\d+)?\s*oz\.)/i);
    if (sizeMatch) size = sizeMatch[0].replace(/\s+/g, " ").trim();

    const skipWords = [
      "laserable",
      "leatherette",
      "patch",
      "with",
      "adhesive",
      "tumbler",
      "finish",
      "slider",
      "lid",
      "sublimatable",
      "soaring",
      "acrylic",
      "sample",
      "floating",
      "blank",
      "set",
      "polar",
      "camel",
      "water",
      "bottle",
      "stemless",
      "glass",
      "mug",
      "wine",
      "ringneck",
      "ion-plated",
      "skinny",
      "x",
      "-",
      "and",
      "kota",
      "pro",
      "and",
      "hex",
      "solid",
    ];

    // Remove size substring from name for easier processing
    let remainder = name;
    if (size) {
      remainder = remainder.replace(size, "");
    }

    // Now, split remainder into words, filter, and join back
    const materialWords = remainder.split(/\s+/).filter(
      (w) => w && !skipWords.includes(w.toLowerCase()) && !/^\d+$/.test(w) // remove pure numbers
    );

    const material = materialWords.join(" ").trim();

    if (!size && !material) return null;
    return {
      size: size ?? "",
      material: material,
    };
  }

  function upsertVariant(
    prevVariants,
    displayName,
    type,
    optionMap,
    optionLabelKey = "label"
  ) {
    const variantIdx = prevVariants.findIndex(
      (v) => v.display_name.trim().toLowerCase() === displayName.toLowerCase()
    );
    let existingOptionValues = [];
    const existingLabels = new Set();

    if (variantIdx !== -1) {
      existingOptionValues = prevVariants[variantIdx].option_values || [];
      existingOptionValues.forEach((opt) => {
        if (opt[optionLabelKey]) existingLabels.add(opt[optionLabelKey]);
      });
    }

    const newOptionValues = Array.from(optionMap.values())
      .filter((opt) => !existingLabels.has(opt[optionLabelKey]))
      .map((obj, i) => ({
        ...obj,
        is_default: false,
        sort_order: existingOptionValues.length + i,
      }));

    if (newOptionValues.length === 0 && variantIdx !== -1) return prevVariants;

    const updatedOptionValues = [
      ...existingOptionValues,
      ...newOptionValues,
    ].map((item, i) => ({
      ...item,
      sort_order: i,
      is_default: false,
    }));

    if (variantIdx !== -1) {
      return prevVariants.map((v, idx) =>
        idx === variantIdx ? { ...v, option_values: updatedOptionValues } : v
      );
    } else {
      return [
        ...prevVariants,
        {
          display_name: displayName,
          type: type,
          option_values: updatedOptionValues,
        },
      ];
    }
  }

  function getBaseProductName(productName, size, material) {
    let name = productName;
    if (size) {
      // Remove the first instance of the size substring
      name = name.replace(size, "");
    }
    if (material) {
      // Remove the first instance of the material substring (case-insensitive)
      // If "material" is a phrase, remove the phrase as a whole
      const materialRegex = new RegExp(
        material.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      name = name.replace(materialRegex, "");
    }
    // Remove leftover "with" or extra spaces/delimiters
    name = name.replace(/\bwith\b/gi, "");
    name = name.replace(/[-–—]+/g, " "); // remove dashes
    name = name.replace(/\s+/g, " ").trim(); // collapse multiple spaces
    return name;
  }

  const buildProductVariantsFromJDSData = (
    importedProducts,
    setActiveProduct
  ) => {
    const foundSizes = new Set();
    const materialMap = new Map();

    importedProducts.forEach((product) => {
      const parsed = parseNameForVariants(product.name);
      if (parsed) {
        foundSizes.add(parsed.size);
        // Build a map for unique materials/styles and their first matching sku/price
        if (!materialMap.has(parsed.material)) {
          materialMap.set(parsed.material, {
            sku: product.sku,
            price: parseFloat((product.price * 1.5).toFixed(2)),
          });
        }
      }
    });

    // Size options
    const sizeOptions = Array.from(foundSizes).map((size, i) => {
      const matchingProducts = importedProducts.filter((p) => {
        const parsed = parseNameForVariants(p.name);
        return parsed && parsed.size === size;
      });
      return {
        label: size,
        is_default: i === 0,
        sort_order: i,
        skus: matchingProducts.map((prod) => prod.sku),
      };
    });

    // Material options (now always correct, e.g. "Basketball", "Rustic")
    const materialOptions = Array.from(materialMap.entries()).map(
      ([mat, info], i) => ({
        label: mat,
        is_default: i === 0,
        sort_order: i,
        sku: info.sku,
        price: info.price,
      })
    );

    // Use label for dedupe (no more extractUniqueWordsWithProductInfo needed)
    const sizeOptionMap = new Map(sizeOptions.map((opt) => [opt.label, opt]));
    const materialOptionMap = new Map(
      materialOptions.map((opt) => [opt.label, opt])
    );

    const firstWithParsed = importedProducts.find((p) =>
      parseNameForVariants(p.name)
    );
    let basePrice = importedProducts[0]?.price;
    let baseProductName = firstWithParsed
      ? (() => {
          const parsed = parseNameForVariants(firstWithParsed.name);
          return getBaseProductName(
            firstWithParsed.name,
            parsed?.size,
            parsed?.material
          );
        })()
      : importedProducts[0]?.name || "";

    setActiveProduct((prev) => {
      let newVariants = prev.variants || [];
      if (sizeOptionMap.size > 0) {
        newVariants = upsertVariant(
          newVariants,
          "Size",
          "dropdown",
          sizeOptionMap,
          "label"
        );
      }
      if (materialOptionMap.size > 0) {
        newVariants = upsertVariant(
          newVariants,
          "Color",
          "dropdown",
          materialOptionMap,
          "label"
        );
      }
      return {
        ...prev,
        variants: newVariants,
        name: baseProductName,
        price: basePrice,
      };
    });
  };

  // Helper: cartesian product of an array of arrays
  function cartesianProduct(arrays) {
    return arrays.reduce(
      (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
      [[]]
    );
  }

  /**
   * Build variants for any number of option groups
   * @returns {Array} - Array of variant objects { sku, option_values }
   */
  function buildAllVariants(activeProduct) {
    if (!activeProduct?.variants?.length) return [];

    const optionGroups = activeProduct.variants.map((v) =>
      v.option_values.map((opt) => ({
        ...opt,
        type: v.type,
        option_display_name: v.display_name,
      }))
    );

    const combinations = cartesianProduct(optionGroups);

    return combinations.map((combo, index) => {
      const baseSku = combo[combo.length - 1].sku || "";

      return {
        sku: `WB-${baseSku ? baseSku : index}`,
        price: combo[combo.length - 1].price || combo[0].price || 0,
        option_values: combo.map((o) => ({
          label: o.label,
          type: o.type,
          option_display_name: o.option_display_name,
        })),
      };
    });
  }

  return {
    parseNameForVariants,
    upsertVariant,
    getBaseProductName,
    buildProductVariantsFromJDSData,
    buildAllVariants,
  };
};
