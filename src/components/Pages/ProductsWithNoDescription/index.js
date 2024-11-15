import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingOverlay from "../../LoadingOverlay";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeadCell,
  TableHeader,
  TableRow,
} from "../../Table/Table";
import TableHeaderContainer from "./tableHeader";
import { twMerge } from "tailwind-merge";
import {
  Pagination,
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
} from "../../ui/pagination";

export default function ProductsWithNoDesc() {
  const dispatch = useDispatch();

  const [view, setView] = useState("htw");

  // Redux state
  const productsStorage = useSelector((store) => store.productsReducer);
  const {
    productsNoDesc,
    sffProductsNoDesc,
    lastSffSync,
    lastSync,
    syncStatus,
    sffSyncStatus,
  } = productsStorage;

  // Determine the active products list based on the view
  const activeProducts = view === "sff" ? sffProductsNoDesc : productsNoDesc;
  const activeLastSync = view === "sff" ? lastSffSync : lastSync;
  const activeSyncStatus = view === "sff" ? sffSyncStatus : syncStatus;

  // Component states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Fetch products and sync status on mount
  useEffect(() => {
    dispatch({ type: "FETCH_PRODUCTS_NO_DESC" });
    dispatch({ type: "FETCH_SFF_PRODUCTS_NO_DESC" });
    dispatch({ type: "FETCH_LAST_SYNC" });
    dispatch({ type: "FETCH_SFF_LAST_SYNC" });
    dispatch({ type: "FETCH_SYNC_STATUS" });
    dispatch({ type: "FETCH_SFF_SYNC_STATUS" });
  }, [dispatch]);

  const setViewPath = (view) => {
    setView(view);
  };

  // Unique categories for filtering
  const uniqueCategories = useMemo(() => {
    if (!activeProducts) return [];

    const counts = {};

    activeProducts.forEach((product) => {
      const categories = product.categories || [];
      categories.forEach((category) => {
        counts[category] = (counts[category] || 0) + 1;
      });
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [activeProducts]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Filter products based on search and category filters
  const filteredProducts = useMemo(() => {
    if (!activeProducts) return [];
    return activeProducts.filter((product) => {
      const matchesSearchQuery = product.name
        ?.toLowerCase()
        .includes(productSearchQuery.toLowerCase());
      const matchesCategoryFilters =
        selectedCategoryFilters.length === 0 ||
        selectedCategoryFilters.some((filter) =>
          product.categories?.includes(filter)
        );
      return matchesSearchQuery && matchesCategoryFilters;
    });
  }, [activeProducts, productSearchQuery, selectedCategoryFilters]);

  // Filter categories based on search input
  const filteredCategories = useMemo(() => {
    return uniqueCategories.filter(({ name }) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueCategories, searchQuery]);

  // Pagination for filtered products
  const paginatedProducts = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page, rowsPerPage]);

  // Sync catalog function
  const syncCatalog = () => {
    if (view === "sff") {
      dispatch({ type: "SYNC_SFF_CATALOG" });
      dispatch({ type: "FETCH_SFF_SYNC_STATUS" });
    } else {
      dispatch({ type: "SYNC_CATALOG" });
      dispatch({ type: "FETCH_SYNC_STATUS" });
    }
  };

  const handleCategoryFilterChange = (category) => {
    setSelectedCategoryFilters((prevFilters) =>
      prevFilters.includes(category)
        ? prevFilters.filter((cat) => cat !== category)
        : [...prevFilters, category]
    );
  };

  // Props for TableHeaderContainer
  const headerProps = {
    syncCatalog,
    lastSync: activeLastSync,
    filteredProducts,
    rowsPerPage,
    setRowsPerPage,
    page,
    setPage,
    uniqueCategories,
    selectedCategoryFilters,
    setSelectedCategoryFilters,
    handleCategoryFilterChange,
    filteredCategories,
    searchQuery,
    setSearchQuery,
    setProductSearchQuery,
    productSearchQuery,
    isMobile,
    activeSyncStatus,
  };

  return (
    <>
      <h1>Products Missing a Description or Heading Tag</h1>
      <Table>
        <div className="flex py-4 items-center justify-center gap-4">
          <button
            onClick={() => setViewPath("htw")}
            className={twMerge(
              view === "htw"
                ? "bg-secondary text-white"
                : "bg-white text-secondary hover:bg-secondary/10",
              "rounded-md font-semibold border-none transition p-2"
            )}>
            HTW ({productsNoDesc.length})
          </button>
          <button
            onClick={() => setViewPath("sff")}
            className={twMerge(
              view === "sff"
                ? "bg-secondary text-white"
                : "bg-white text-secondary hover:bg-secondary/10",
              "rounded-md font-semibold border-none transition p-2"
            )}>
            SFF ({sffProductsNoDesc.length})
          </button>
        </div>
        <TableHeaderContainer props={headerProps} />
        {paginatedProducts.length === 0 ? (
          <h2 className="text-base text-center my-12">
            No products missing descriptions. Nice Job!
          </h2>
        ) : (
          <>
            {isMobile ? (
              <div>
                {paginatedProducts.map((product) => {
                  return (
                    <div className="border-b p-2 grid grid-cols-productsListMobile gap-x-4 border-solid border-gray-200">
                      <span className="py-1 col-span-1 col-start-1 row-start-1 font-semibold">
                        Name:
                      </span>
                      <span className="py-1 col-span-1 col-start-1 row-start-2 font-semibold">
                        Cats:
                      </span>
                      <span className="py-1 col-span-1 col-start-2 row-start-1">
                        <a
                          className="hover:text-secondary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://store-et4qthkygq.mybigcommerce.com/manage/products/edit/${product.product_id}`}>
                          {product.name}
                        </a>
                      </span>
                      <span className="py-1 col-span-1 col-start-2 row-start-2">
                        <ul className="list-none m-0 p-0">
                          {product.categories.map((category) => (
                            <li className="pb-2">{category}</li>
                          ))}
                        </ul>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <TableContainer>
                <TableHeader className={"pl-2 py-2"} tableFor={"productsList"}>
                  <TableHeadCell>Product Name</TableHeadCell>
                  <TableHeadCell>Categories</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow
                      className={"last:border-b"}
                      tableFor={"productsList"}
                      key={product.id}>
                      <TableCell className={"py-4"}>
                        <a
                          className="hover:text-secondary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://store-et4qthkygq.mybigcommerce.com/manage/products/edit/${product.product_id}`}>
                          {product.name}
                        </a>
                      </TableCell>
                      <TableCell>
                        {(product.categories || []).join(", ")}
                      </TableCell>
                      <TableCell className={"pr-4"}>
                        {product.description ? (
                          <span className="bg-secondary/30 w-full p-2 rounded-md">
                            No Heading Tags
                          </span>
                        ) : (
                          <span className="bg-red-600/30 w-full p-2 rounded-md">
                            No Description
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableContainer>
            )}
            <Pagination
              props={{
                items: filteredProducts,
                rowsPerPage: rowsPerPage,
                page: page,
                setPage: setPage,
                setRowsPerPage: setRowsPerPage,
              }}>
              <PaginationTrigger />
              <PaginationControls />
              <PaginationSheet sheetPosition="bottom">
                <PaginationOption value={10}>10</PaginationOption>
                <PaginationOption value={25}>25</PaginationOption>
                <PaginationOption value={50}>50</PaginationOption>
                <PaginationOption value={100}>100</PaginationOption>
              </PaginationSheet>
            </Pagination>
          </>
        )}
      </Table>
    </>
  );
}
