import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableContainer,
  TableHeader,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "../../Table/Table";
import { twMerge } from "tailwind-merge";
import TableHeaderContainer from "./tableHeader";
import Image from "./image";
import {
  Pagination,
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
} from "../../ui/pagination";
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from "../../ui/dropdown";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import DeleteModal from "../../modals/deleteModal";

export default function ProductsMissingAlts() {
  const dispatch = useDispatch();

  const [view, setView] = useState("htw");

  useEffect(() => {
    dispatch({ type: "FETCH_HTW_IMAGE_PRODUCTS" });
    dispatch({
      type: "FETCH_HTW_IMAGE_SYNC_DATA",
      payload: {
        query: true,
      },
    });
    dispatch({ type: "FETCH_HTW_IMAGES_SYNC_STATUS" });
    dispatch({ type: "FETCH_SFF_IMAGE_PRODUCTS" });
    dispatch({
      type: "FETCH_SFF_IMAGE_SYNC_DATA",
      payload: {
        query: true,
      },
    });
    dispatch({ type: "FETCH_SFF_IMAGES_SYNC_STATUS" });
  }, [dispatch, view]);

  const storage = useSelector((store) => store.productsReducer);

  const { htw, sff } = storage;

  const htwCount = htw.imageProducts.count;
  const sffCount = sff.imageProducts.count;

  const { imageProducts, imageSyncData, imagesSyncStatus } = storage[view];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [issueFilter, setIssueFilter] = useState("all");

  const setViewPath = (view) => {
    setView(view);
  };

  const filteredProducts = useMemo(() => {
    if (!imageProducts.data) return [];

    return imageProducts.data.filter((product) => {
      const matchesSearchQuery = product.product_name
        ?.toLowerCase()
        .includes(productSearchQuery.toLowerCase());

      const matchesCategoryFilters =
        selectedCategoryFilters.length === 0 ||
        selectedCategoryFilters.some((filter) =>
          product.categories?.includes(filter)
        );

      const matchesIssueFilter =
        issueFilter === "all" ||
        (issueFilter === "missing" &&
          product.issue.toLowerCase().includes("missing")) ||
        (issueFilter === "duplicate" &&
          product.issue.toLowerCase().includes("duplicate"));

      return matchesSearchQuery && matchesCategoryFilters && matchesIssueFilter;
    });
  }, [imageProducts, productSearchQuery, selectedCategoryFilters, issueFilter]);

  const uniqueCategories = useMemo(() => {
    if (!imageProducts.data) return [];

    const counts = {};

    imageProducts.data.forEach((product) => {
      const categories = product.categories || [];
      categories.forEach((category) => {
        counts[category] = (counts[category] || 0) + 1;
      });
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [imageProducts]);

  const filteredCategories = useMemo(() => {
    return uniqueCategories.filter(({ name }) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueCategories, searchQuery]);

  // // Pagination for filtered products
  const paginatedProducts = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page, rowsPerPage]);

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

  const syncCatalog = () => {
    if (view === "sff") {
      dispatch({ type: "SYNC_SFF_IMAGE_PRODUCTS" });
      dispatch({ type: "FETCH_SFF_IMAGES_SYNC_STATUS" });
    } else {
      dispatch({ type: "SYNC_HTW_IMAGE_PRODUCTS" });
      dispatch({ type: "FETCH_HTW_IMAGES_SYNC_STATUS" });
    }
  };

  const handleCategoryFilterChange = (category) => {
    setSelectedCategoryFilters((prevFilters) =>
      prevFilters.includes(category)
        ? prevFilters.filter((cat) => cat !== category)
        : [...prevFilters, category]
    );
  };

  const handleDelete = (e) => {
    e.preventDefault();
    dispatch({ type: "DELETE_HTW_IMAGE_PRODUCT", payload: activeItemId });
    setDeleteModalActive(false);
    setActiveItemId(null);
  };

  const headerProps = {
    syncCatalog,
    lastSync: imageSyncData,
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
    productSearchQuery,
    setProductSearchQuery,
    isMobile,
    activeSyncStatus: imagesSyncStatus,
    setIssueFilter,
    issueFilter,
    allProducts: imageProducts.data,
  };

  return (
    <>
      <h1>Products Missing Alt Tags on Images</h1>
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
            HTW ({htwCount})
          </button>
          <button
            onClick={() => setViewPath("sff")}
            className={twMerge(
              view === "sff"
                ? "bg-secondary text-white"
                : "bg-white text-secondary hover:bg-secondary/10",
              "rounded-md font-semibold border-none transition p-2"
            )}>
            SFF ({sffCount})
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
                    <div
                      key={product.id}
                      className="border-b p-2 grid grid-cols-productsListMobile gap-x-4 border-solid border-gray-200">
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
                          href={`https://store-${
                            view === "sff" ? "q6y5gcujza" : "et4qthkygq"
                          }.mybigcommerce.com/manage/products/edit/${
                            product.product_id
                          }`}>
                          {product.product_name}
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
                <TableHeader
                  className={"pl-2 py-2"}
                  tableFor={"productsListImages"}>
                  <TableHeadCell>Product Name</TableHeadCell>
                  <TableHeadCell>Categories</TableHeadCell>
                  <TableHeadCell>Images</TableHeadCell>
                  <TableHeadCell>Issue</TableHeadCell>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow
                      className={"last:border-b"}
                      tableFor={"productsListImages"}
                      key={product.product_id}>
                      <TableCell>
                        <a
                          className="hover:text-secondary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://store-${
                            view === "sff" ? "q6y5gcujza" : "et4qthkygq"
                          }.mybigcommerce.com/manage/products/edit/${
                            product.product_id
                          }`}>
                          {product.product_name}
                        </a>
                      </TableCell>
                      <TableCell>
                        {(product.categories || []).join(", ")}
                      </TableCell>
                      <TableCell className={"pr-4 pl-2 grid grid-cols-5 gap-1"}>
                        {product.images.map((image, index) => (
                          <Image
                            key={`${image.id}-${index}`}
                            url={image.image_url}
                          />
                        ))}
                      </TableCell>
                      <TableCell className={"!p-2"}>
                        <span
                          className={twMerge(
                            product.issue === "Missing Alt"
                              ? "bg-red-200"
                              : "bg-blue-200",
                            "text-black rounded-md px-4 py-2 font-medium"
                          )}>
                          {product.issue}
                        </span>
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
      <DeleteModal
        props={{
          open: deleteModalActive,
          setOpen: setDeleteModalActive,
          deleteFunction: handleDelete,
        }}
      />
    </>
  );
}
