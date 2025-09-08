import React from 'react';
import ShipStationBarcode from '../shipstation-barcode';

function PickListHeader({ order }) {
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
      }}
    >
      <img
        style={{
          width: '100px',
          height: 'auto',
          margin: '0',
          padding: '0',
        }}
        loading="eager"
        src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/heat-transfer-warehouse-logo-2024.png?t=1710348082"
        alt="Heat Transfer Warehouse Logo"
      ></img>
      <ShipStationBarcode orderInfo={order} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          gap: '0.25rem',
          margin: '0',
          padding: '0',
        }}
      >
        <p
          style={{
            margin: '0',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'right',
          }}
        >
          SHIPPING METHOD
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '18px',
          }}
        >
          {order.shipping.shipping_method}
        </p>
      </div>
    </div>
  );
}

export default PickListHeader;
