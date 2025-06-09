import React from "react";
import CategoryBranch from "./category-branch";

function CategoryPicker({ props }) {
  const { bcCategoriesList, importedProducts, setImportedProducts, sku } =
    props;

  const [expanded, setExpanded] = React.useState({});
  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const addCategoryToProduct = (entityId) => {
    setImportedProducts((prev) =>
      prev.map((product) =>
        product.sku === sku
          ? {
              ...product,
              categories: product.categories?.includes(entityId)
                ? product.categories.filter((cat) => cat !== entityId)
                : [...(product.categories || []), entityId],
            }
          : product
      )
    );
  };

  return (
    <>
      {bcCategoriesList?.map((cat, index) => (
        <CategoryBranch
          index={index}
          isLast={index === bcCategoriesList.length - 1}
          key={cat.entityId}
          category={cat}
          level={1}
          importedProducts={importedProducts}
          sku={sku}
          expanded={expanded}
          toggleExpanded={toggleExpanded}
          addCategoryToProduct={addCategoryToProduct}
        />
      ))}
    </>
  );
}

export default CategoryPicker;
