import React from 'react';
import Barcode from 'react-barcode';

const ShipStationBarcode = ({ splitInfo, orderInfo }) => {
  // Example ShipStation format (customize this depending on your needs)
  // Order ID must be in hex and wrapped in ^#^...^

  return (
    <div
      style={{
        margin: '0 auto',
      }}
    >
      <Barcode
        fontOptions="bold"
        font="Arial"
        value={orderInfo.order_id.toString()}
        format="CODE128"
        width={1.5} // thickness of each bar (default: 2)
        height={30} // height of the barcode (default: 100)
        fontSize={0} // font size for text under barcode
        margin={5} // margin around the barcode
      />
      <p style={{ textAlign: 'center', fontSize: '16px', marginTop: '4px', fontWeight: 600 }}>
        {orderInfo.order_id}{' '}
        {splitInfo.shipmentCount > 1
          ? `(${orderInfo.shipment_number} of ${splitInfo.shipmentCount})`
          : ''}
      </p>
    </div>
  );
};

export default ShipStationBarcode;
