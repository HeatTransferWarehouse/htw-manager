import React from 'react';
import {
  cleanDisplayName,
  formatMoney,
  optionCleaner,
  shouldExcludeOption,
} from '../../utils/utils';

function PickListItemsTable({ order }) {
  return (
    <table
      style={{
        marginTop: '2rem',
        width: '100%',
        borderCollapse: 'collapse', // ✅
      }}
    >
      <thead>
        <tr
          style={{
            borderBottom: '1px solid black',
            pageBreakInside: 'avoid', // Prevent breaking inside the header
          }}
        >
          <th
            style={{
              fontSize: '12px',
              paddingBlock: '0.5rem',
              textAlign: 'left',
              margin: '0',
              paddingRight: '0',
              paddingLeft: '0',
              fontWeight: '600',
            }}
          >
            Qty
          </th>
          <th
            style={{
              fontSize: '12px',
              paddingBlock: '0.5rem',
              textAlign: 'left',
              margin: '0',
              paddingRight: '0',
              paddingLeft: '0.5rem',
              fontWeight: '600',
            }}
          >
            Sku
          </th>
          <th
            style={{
              fontSize: '12px',
              paddingBlock: '0.5rem',
              textAlign: 'left',
              margin: '0',
              paddingRight: '0',
              paddingLeft: '0',
              fontWeight: '600',
            }}
          >
            Item
          </th>
          <th
            style={{
              fontSize: '12px',
              paddingBlock: '0.5rem',
              textAlign: 'right',
              margin: '0',
              paddingRight: '0',
              paddingLeft: '0',
              fontWeight: '600',
            }}
          >
            Price
          </th>
        </tr>
      </thead>
      <tbody>
        {order.line_items.map((product, idx) => (
          <tr
            style={{
              pageBreakInside: 'avoid',
              borderBottom: '1px solid lightgray',
            }}
            key={product.id + product.order_id}
          >
            <td
              style={{
                fontSize: '12px',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                textAlign: 'left',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '0',
                verticalAlign: 'top',
              }}
            >
              {product.quantity}
            </td>
            <td
              style={{
                fontSize: '12px',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                textAlign: 'left',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '0.5rem',
                verticalAlign: 'top',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {product.sku}
                {product.is_dropship ? (
                  <span
                    style={{
                      backgroundColor: '#404040',
                      width: 'fit-content',
                      borderRadius: '0.25rem',
                      fontWeight: '600',
                      color: 'white',
                      fontSize: '10px',
                      padding: '0.2rem',
                    }}
                  >
                    {product.name.toLowerCase().includes('supacolor') ? 'SC DROPSHIP' : 'DROPSHIP'}
                  </span>
                ) : product.is_clothing ? (
                  <span
                    style={{
                      backgroundColor: '#d6d6d6',
                      width: 'fit-content',
                      borderRadius: '0.25rem',
                      fontWeight: '600',
                      color: 'black',
                      fontSize: '10px',
                      padding: '0.2rem',
                    }}
                  >
                    CLOTHING
                  </span>
                ) : (
                  ''
                )}
              </span>
            </td>
            <td
              style={{
                fontSize: '12px',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                textAlign: 'left',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '0',
                verticalAlign: 'top',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <p
                  style={{
                    margin: '0',
                    padding: '0',
                  }}
                >
                  <span
                    style={{
                      fontWeight: '600',
                    }}
                  >
                    Name:
                  </span>{' '}
                  {product.name}
                </p>
                {product.options &&
                  product.options.length > 0 &&
                  product.options.map((opt, i) => {
                    if (shouldExcludeOption(opt.display_name)) {
                      return null;
                    }
                    return (
                      <p
                        style={{
                          margin: '0',
                          padding: '0',
                        }}
                        key={i + product.id + 'opt'}
                      >
                        <span
                          style={{
                            fontWeight: '600',
                          }}
                        >
                          {cleanDisplayName(opt.display_name)}:
                        </span>{' '}
                        {optionCleaner(opt.display_name, opt.display_value)}
                      </p>
                    );
                  })}
              </span>
            </td>
            <td
              style={{
                fontSize: '12px',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                textAlign: 'right',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '0',
                verticalAlign: 'top',
              }}
            >
              {formatMoney(product.price)}
            </td>
          </tr>
        ))}
        <tr
          style={{
            pageBreakInside: 'avoid',
            borderBottom: '1px solid lightgray',
          }}
        >
          <td
            style={{
              fontSize: '12px',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              textAlign: 'left',
              margin: '0',
              paddingInline: '0',
              verticalAlign: 'top',
            }}
          >
            1
          </td>
          <td
            style={{
              fontSize: '12px',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              textAlign: 'left',
              margin: '0',
              paddingRight: '0',
              paddingLeft: '0.5rem',
              verticalAlign: 'top',
            }}
          ></td>
          <td
            style={{
              fontSize: '12px',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              textAlign: 'left',
              margin: '0',
              paddingInline: '0',
              verticalAlign: 'top',
            }}
          >
            <p style={{ margin: '0', padding: '0' }}>
              <span
                style={{
                  fontWeight: '600',
                }}
              >
                Shipping Method:
              </span>{' '}
              {order.shipping.shipping_method}
            </p>
          </td>
          <td
            style={{
              fontSize: '12px',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              textAlign: 'right',
              margin: '0',
              paddingRight: '0',
              paddingLeft: '0',
              verticalAlign: 'top',
            }}
          >
            {formatMoney(order.shipping.cost_inc_tax)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default PickListItemsTable;
