import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoadingModal } from "../DecoQueue/Components/Modals";
// import { Card } from "../../ui/card";

export default function PromoDetails(props) {
  const promoId = props.id.split("/")[1];
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: "FETCH_PROMOTION", payload: { id: promoId } });
  }, [dispatch, promoId]);
  const data = useSelector((store) => store.promotionsReducer.promotionStorage);
  const loading = useSelector(
    (store) => store.promotionsReducer.promotionLoader
  );
  const error = useSelector((store) => store.promotionsReducer.promotionErrors);

  console.log(data);
  if (loading) {
    return <LoadingModal />;
  }

  if (error.length) {
    return <h1>Error: {error}</h1>;
  }

  //   const formatMoney = (x) => {
  //     var xParts = parseFloat(x).toFixed(2).toString().split(".");
  //     xParts[0] = xParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //     return xParts.length > 1 ? xParts.join(".") : xParts[0];
  //   };

  return (
    <>
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">
        {data.promoData?.data.name}
      </h1>
      {/* <div className="grid mt-8 grid-cols-3 max-w-screen-xl w-full mx-auto gap-8">
        <Card
          title="Total Revenue"
          className="flex flex-col justify-center gap-4">
          <p className="text-base">Total Revenue</p>
          <p className="font-semibold text-2xl">
            ${formatMoney(data.orderData?.totalRevenue || 0)}
          </p>
        </Card>
        <Card
          title="Total Orders"
          className="flex flex-col justify-center gap-4">
          <p className="text-base">Total Orders</p>
          <p className="font-semibold text-2xl">
            {data.orderData?.totalOrders}
          </p>
        </Card>
        <Card
          title="Total Revenue"
          className="flex flex-col justify-center gap-4">
          <p className="text-base">Average Order Value</p>
          <p className="font-semibold text-2xl">
            ${formatMoney(data.orderData?.averageOrderValue || 0)}
          </p>
        </Card>
      </div> */}
    </>
  );
}
