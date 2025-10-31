import React from 'react';
import ShipStationBarcode from '../shipstation-barcode';

function PickListHeader({ order }) {
  const isNDA = order.shipping.shipping_method.toLowerCase().includes('next day air');
  const isTwoDay = order.shipping.shipping_method.toLowerCase().includes('2 day air');
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <img
        style={{
          width: '150px',
          height: 'auto',
          margin: '0',
          padding: '0',
        }}
        loading="eager"
        src="https://cdn11.bigcommerce.com/s-q6y5gcujza/images/stencil/500x200/shirts-new-logo_1726752995__72460.original.png"
        alt="Shirts From Fargo Logo"
      ></img>
      <ShipStationBarcode orderInfo={order} />
    </div>
  );
}

export default PickListHeader;
