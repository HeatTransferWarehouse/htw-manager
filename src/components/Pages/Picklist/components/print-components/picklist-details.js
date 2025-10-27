import React from 'react';
import { formatPhoneNumber, toTitleCase } from '../../utils/utils';

function PickListDetails({ order }) {
  const reasons = [];

  if (
    order.shipping.city.toLowerCase() === 'miami' &&
    ['fl', 'florida'].includes(order.shipping.state.toLowerCase())
  ) {
    reasons.push('Miami Shipping Address');
  }

  if (
    order.shipping.city.toLowerCase() === 'fort lauderdale' &&
    ['fl', 'florida'].includes(order.shipping.state.toLowerCase())
  ) {
    reasons.push('Fort Lauderdale Shipping Address');
  }

  if (order.customer.is_first_order) {
    reasons.push("Customer's first order");
  }

  const needsReview = reasons.length > 0;
  const reviewReason = reasons.join(', ');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginTop: '2rem',
        padding: '0',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          margin: '0',
          padding: '0',
        }}
      >
        <p
          style={{
            margin: '0',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          Customer
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          {toTitleCase(order.customer.first_name)} {toTitleCase(order.customer.last_name)}
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          {order.customer.email}
        </p>
        {order.customer.company && (
          <p
            style={{
              margin: '0',
              fontSize: '12px',
            }}
          >
            {toTitleCase(order.customer.company)}
          </p>
        )}
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          {formatPhoneNumber(order.customer.phone)}
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          margin: '0',
          padding: '0',
        }}
      >
        <p
          style={{
            margin: '0',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          Shipping Info
        </p>
        {(order.shipping.first_name || order.shipping.last_name) && (
          <p
            style={{
              margin: '0',
              fontSize: '12px',
            }}
          >
            {toTitleCase(order.shipping.first_name)} {toTitleCase(order.shipping.last_name)}
          </p>
        )}
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          {toTitleCase(order.shipping.street_1)}
        </p>
        {order.shipping.street_2 && (
          <p
            style={{
              fontSize: '12px',
            }}
          >
            {toTitleCase(order.shipping.street_2)}
          </p>
        )}
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          {toTitleCase(order.shipping.city)}, {toTitleCase(order.shipping.state)}{' '}
          {order.shipping.zip}
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          {order.shipping.country.toUpperCase()}
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          margin: '0',
          padding: '0',
        }}
      >
        <p
          style={{
            margin: '0',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          Order Info
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          <span
            style={{
              fontWeight: '600',
            }}
          >
            Order Number:
          </span>{' '}
          {order.order_id}{' '}
          {order.is_split && `(${order.shipment_number} of ${order.total_shipments})`}
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '12px',
          }}
        >
          <span
            style={{
              fontWeight: '600',
            }}
          >
            Order Date:
          </span>{' '}
          {new Date(order.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '0.25rem',
            margin: '0',
            padding: '0',
          }}
        >
          <span
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '0.25rem',
              fontSize: '12px',
            }}
          >
            Pick:{' '}
            <span
              style={{
                width: '1.5rem',
                border: '1px solid black',
                height: '1.5rem',
              }}
            ></span>
          </span>
          <span
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '-1.5rem',
              gap: '0.25rem',
              fontSize: '12px',
            }}
          >
            Check:{' '}
            <span
              style={{
                width: '1.5rem',
                border: '1px solid black',
                height: '1.5rem',
              }}
            ></span>
          </span>
          <span
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.25rem',
              fontSize: '12px',
            }}
          >
            Shipped:{' '}
            <span
              style={{
                width: '1.5rem',
                border: '1px solid black',
                height: '1.5rem',
              }}
            ></span>
          </span>
        </div>
        {needsReview && (
          <span
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '1rem',
              marginTop: '1rem',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            **NEEDS REVIEW**:{' '}
            <span
              style={{
                width: '1.5rem',
                border: '1px solid black',
                height: '1.5rem',
              }}
            ></span>
          </span>
        )}
      </div>
      {(order.customer_notes || order.staff_notes) && (
        <div
          style={{
            gridColumn: '1 / span 3',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '12px',
            }}
          >
            <span
              style={{
                fontWeight: '600',
              }}
            >
              Customer Notes:
            </span>{' '}
            {order.customer_notes || 'N/A'}
          </p>
          <p
            style={{
              margin: '0',
              fontSize: '12px',
            }}
          >
            <span
              style={{
                fontWeight: '600',
              }}
            >
              HTW Notes:
            </span>{' '}
            {order.staff_notes || 'N/A'}
          </p>
        </div>
      )}
      {needsReview && (
        <div
          style={{
            gridColumn: '1 / span 3',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '12px',
            }}
          >
            <span
              style={{
                fontWeight: '600',
              }}
            >
              Review Reason:
            </span>{' '}
            {reviewReason}
          </p>
        </div>
      )}
    </div>
  );
}

export default PickListDetails;
