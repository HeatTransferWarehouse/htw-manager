import React from 'react';
import { formatMoney } from '../../utils/utils';

function PickListOrderSummary({ order }) {
  return (
    <div
      style={{
        marginLeft: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '200px',
        paddingTop: '0.5rem',
        marginTop: '1rem',
        fontSize: '12px',
        pageBreakInside: 'avoid', // ✅ key
        breakInside: 'avoid', // ✅ modern browsers
      }}
    >
      <div
        style={{
          display: 'flex',
          itemsAlign: 'center',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            margin: '0',
            padding: '0',
            fontWeight: '600',
          }}
        >
          Subtotal
        </p>
        <p style={{ margin: '0', padding: '0' }}>{formatMoney(Number(order.subtotal))}</p>
      </div>
      {order.coupon_name && (
        <div
          style={{
            display: 'flex',
            itemsAlign: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              margin: '0',
              padding: '0',
              fontWeight: '600',
            }}
          >
            Coupon{' '}
            <span
              style={{
                fontSize: '10px',
                fontWeight: '400',
                color: '#333',
              }}
            >
              ({order.coupon_name})
            </span>
          </p>
          <p style={{ margin: '0', padding: '0' }}>-{formatMoney(order.coupon_value)}</p>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          itemsAlign: 'center',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            margin: '0',
            padding: '0',
            fontWeight: '600',
          }}
        >
          Shipping
        </p>
        <p style={{ margin: '0', padding: '0' }}>{formatMoney(order.shipping.cost_inc_tax)}</p>
      </div>
      <div
        style={{
          display: 'flex',
          itemsAlign: 'center',
          width: '100%',
          justifyContent: 'space-between',
          borderBottom: '1px solid black',
          paddingBottom: '0.5rem',
        }}
      >
        <p
          style={{
            margin: '0',
            padding: '0',
            fontWeight: '600',
          }}
        >
          Tax
        </p>
        <p style={{ margin: '0', padding: '0' }}>{formatMoney(Number(order.tax))}</p>
      </div>
      <div
        style={{
          display: 'flex',
          itemsAlign: 'center',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            margin: '0',
            padding: '0',
            fontWeight: '600',
            fontSize: '18px',
          }}
        >
          Total
        </p>
        <p style={{ margin: '0', padding: '0', fontSize: '18px', fontWeight: '500' }}>
          {formatMoney(Number(order.grand_total))}
        </p>
      </div>
    </div>
  );
}

export default PickListOrderSummary;
