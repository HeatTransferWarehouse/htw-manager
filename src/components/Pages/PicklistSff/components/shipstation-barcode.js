import React from 'react';
import Barcode from 'react-barcode';

const ShipStationBarcode = ({ orderInfo }) => {
  // Example ShipStation format (customize this depending on your needs)
  // Order ID must be in hex and wrapped in ^#^...^

  return (
    <div
      style={{
        margin: '0',
        marginLeft: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Barcode
        fontOptions="bold"
        font="Arial"
        value={orderInfo.order_id.toString()}
        format="CODE128"
        width={2} // thickness of each bar (default: 2)
        height={40} // height of the barcode (default: 100)
        fontSize={0} // font size for text under barcode
        margin={4} // margin around the barcode
      />
      <p style={{ textAlign: 'center', fontSize: '12pt', margin: 0, fontWeight: 600 }}>
        Order #{orderInfo.order_id}{' '}
        {orderInfo.is_split && `(${orderInfo.shipment_number} of ${orderInfo.total_shipments})`}
      </p>
    </div>
  );
};

export default ShipStationBarcode;
