import React from 'react';
import PickListItemsTable from './print-components/picklist-items-table';
import PickListDetails from './print-components/picklist-details';
import PickListOrderSummary from './print-components/picklist-price-summary';
import PickListHeader from './print-components/picklist-header';

const PrintHtml = React.forwardRef(({ activeOrders, splitOrders }, ref) => {
  const getOrderKey = (order) => `${order.order_id}-${order.shipment_number || order.id}`;

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '8.5in',
        backgroundColor: 'white',
        minHeight: '11in',
        margin: '0 auto',
      }}
      ref={ref}
      id="print-section"
    >
      {activeOrders.map((order, i) => (
        <div
          style={{
            pageBreakAfter: i < activeOrders.length - 1 ? 'always' : 'auto',
            paddingTop: '10px',
          }}
          key={getOrderKey(order) + 'print'}
          className="order-print-page"
        >
          <PickListHeader order={order} />
          <PickListDetails order={order} />
          <PickListItemsTable order={order} />
          <PickListOrderSummary order={order} />
        </div>
      ))}
    </div>
  );
});

export default PrintHtml;
