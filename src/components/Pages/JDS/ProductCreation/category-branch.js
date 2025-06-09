import { twMerge } from "tailwind-merge";
import { FaFolder } from "react-icons/fa";
import { FaChevronDown, FaCheck } from "react-icons/fa6";

function getSelectedCount(category, importedProducts) {
  const isDirectlySelected = importedProducts.some((product) =>
    product.categories?.includes(category.entityId)
  );

  const childrenCount =
    category.children?.reduce((sum, child) => {
      return sum + getSelectedCount(child, importedProducts);
    }, 0) || 0;

  return (isDirectlySelected ? 1 : 0) + childrenCount;
}

function CategoryBranch({
  category,
  level,
  importedProducts,
  sku,
  expanded,
  toggleExpanded,
  addCategoryToProduct,
  index,
  isLast,
}) {
  const isAddedToProduct = importedProducts.some(
    (product) =>
      product.sku === sku && product.categories?.includes(category.entityId)
  );

  const selectedCount = getSelectedCount(category, importedProducts);
  const hasChildren = category.children?.length > 0;

  const levelPaddingMap = {
    1: "pl-0",
    2: "pl-[1.75rem]",
    3: "pl-[3.5rem]",
    4: "pl-[5.25rem]", // manually defined if needed
    5: "pl-[7rem]", // manually defined if needed
  };

  const paddingClass = levelPaddingMap[level] || "pl-[7rem]";
  const isFirst = index === 0;
  return (
    <div
      className={twMerge(
        !isFirst && "border-t",
        isFirst && "-mt-2",
        isLast && "-mb-2"
      )}
      key={category.entityId}>
      <button
        onClick={() => toggleExpanded(category.entityId)}
        className={twMerge(
          "flex hover:bg-secondary/5 px-1 w-full items-center py-2 border-gray-400 gap-3",
          paddingClass
        )}>
        <FaChevronDown
          className={twMerge(
            "w-3 h-3 transition-transform",
            !hasChildren && "opacity-0",
            expanded[category.entityId] && "rotate-180"
          )}
        />
        <span
          onClick={(e) => {
            addCategoryToProduct(category.entityId);
            e.stopPropagation();
          }}
          className={twMerge(
            "w-4 h-4 rounded-sm z-10 relative hover:border-secondary border border-secondary/50 flex items-center justify-center",
            isAddedToProduct ? "bg-secondary" : "bg-white"
          )}>
          {isAddedToProduct && <FaCheck className="w-3 h-3 fill-white" />}
        </span>
        <FaFolder className="w-4 h-4 fill-secondary" />
        {category.name}
        {selectedCount > 0 && (
          <span className="-ml-2 text-sm text-secondary">
            ({selectedCount})
          </span>
        )}
      </button>

      {expanded[category.entityId] &&
        hasChildren &&
        category.children.map((child) => (
          <CategoryBranch
            key={child.entityId}
            category={child}
            level={level + 1}
            importedProducts={importedProducts}
            sku={sku}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            addCategoryToProduct={addCategoryToProduct}
          />
        ))}
    </div>
  );
}

export default CategoryBranch;
