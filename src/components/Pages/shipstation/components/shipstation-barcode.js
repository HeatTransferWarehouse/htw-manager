import React from 'react';
import Barcode from 'react-barcode';

const ShipStationBarcode = ({ encoded, orderId }) => {
  // Example ShipStation format (customize this depending on your needs)
  // Order ID must be in hex and wrapped in ^#^...^

  return (
    <div
      style={{
        margin: '0 auto',
      }}
    >
      <Barcode
        value={orderId.toString()}
        format="CODE128"
        width={1.5} // thickness of each bar (default: 2)
        height={30} // height of the barcode (default: 100)
        fontSize={16} // font size for text under barcode
        margin={5} // margin around the barcode
      />
    </div>
  );
};

export default ShipStationBarcode;
