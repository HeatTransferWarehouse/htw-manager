import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableComponent from "./components/table";
import { useLocation } from "react-router-dom";

export default function Promotions() {
  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("status") || "enabled";
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState("desc");
  const [sort, setSort] = useState("id");
  const promotions = useSelector(
    (store) => store.promotionsReducer.promotionsStorage
  );
  const loading = useSelector(
    (store) => store.promotionsReducer.promotionsLoader
  );
  const errors = useSelector(
    (store) => store.promotionsReducer.promotionsErrors
  );
  useEffect(() => {
    dispatch({
      type: "FETCH_PROMOTIONS",
      payload: {
        page: page + 1,
        limit: rowsPerPage,
        direction: direction,
        status: view,
        sort: sort,
      },
    });
  }, [dispatch, view, rowsPerPage, page, direction, sort]);

  if (errors.length) {
    return <h1>Error loading promos: {errors}</h1>;
  }

  return (
    <>
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">Promotions</h1>
      <TableComponent
        props={{
          promotions,
          view,
          rowsPerPage,
          setRowsPerPage,
          page,
          setPage,
          direction,
          setDirection,
          sort,
          setSort,
          loading,
        }}
      />
    </>
  );
}
