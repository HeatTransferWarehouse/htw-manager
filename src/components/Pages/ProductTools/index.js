import React, { useEffect } from "react";
import { Card } from "../../ui/card";
import { useDispatch, useSelector } from "react-redux";

export default function ProductTools() {
  const dispatch = useDispatch();
  const storage = useSelector((store) => store.productsReducer);

  const { htw, sff } = storage;

  const htwImagesCount = htw.imageProductsCount.data;
  const htwImages = htw.imageProducts;

  console.log(htwImages);

  useEffect(() => {
    dispatch({ type: "FETCH_HTW_IMAGE_PRODUCTS_COUNT" });
    dispatch({
      type: "FETCH_HTW_IMAGE_PRODUCTS",
      payload: {
        query: {
          limit: 5,
        },
      },
    });
  }, [dispatch]);
  return (
    <>
      <h1>Product Tools</h1>
      <div className="grid grid-cols-2 w-full mx-auto mt-12 gap-12 max-w-screen-xl">
        <Card>
          <h2 className="font-semibold text-center text-xl">
            Products Without Descriptions
          </h2>
        </Card>
        <Card>
          <h2 className="font-semibold text-center text-xl">
            Products Without Alts on Images
          </h2>
        </Card>
      </div>
    </>
  );
}
