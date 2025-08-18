import React from 'react';
import ShipStationBarcode from './shipstation-barcode';
import { formatMoney, formatPhoneNumber, toTitleCase } from '../utils/utils';

const PrintHtml = React.forwardRef(({ activeOrders }, ref) => {
  return (
    <div ref={ref} id="print-section">
      {activeOrders.map((order, i) => (
        <div
          style={{
            pageBreakAfter: i < activeOrders.length - 1 ? 'always' : 'auto',
            paddingTop: '40px',
          }}
          key={order.order_id + 'print'}
          className="order-print-page"
        >
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
            }}
          >
            <img
              style={{
                width: '125px',
                height: 'auto',
                margin: '0',
                padding: '0',
              }}
              src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/heat-transfer-warehouse-logo-2024.png?t=1710348082"
              alt="Heat Transfer Warehouse Logo"
            ></img>
            <ShipStationBarcode orderId={order.order_id} />
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
                {toTitleCase(order.shipping.country)}
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
                    fontWeight: '500',
                  }}
                >
                  Order Number:
                </span>{' '}
                {order.order_id}
              </p>
              <p
                style={{
                  margin: '0',
                  fontSize: '12px',
                }}
              >
                <span
                  style={{
                    fontWeight: '500',
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
                    gap: '0.5rem',
                    fontSize: '12px',
                  }}
                >
                  Pick:{' '}
                  <span
                    style={{
                      width: '1.25rem',
                      border: '1px solid black',
                      height: '1.25rem',
                    }}
                  ></span>
                </span>
                <span
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '12px',
                  }}
                >
                  Check:{' '}
                  <span
                    style={{
                      width: '1.25rem',
                      border: '1px solid black',
                      height: '1.25rem',
                    }}
                  ></span>
                </span>
                <span
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '12px',
                  }}
                >
                  Shipped:{' '}
                  <span
                    style={{
                      width: '1.25rem',
                      border: '1px solid black',
                      height: '1.25rem',
                    }}
                  ></span>
                </span>
              </div>
            </div>
          </div>
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
                    fontWeight: '500',
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
                    fontWeight: '500',
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
                    fontWeight: '500',
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
                    fontWeight: '500',
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
                    {product.sku}
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
                          if (opt.display_name === 'Upload File') {
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
                                {opt.display_name}:
                              </span>{' '}
                              {opt.display_value}
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
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              width: '200px',
              marginTop: '0.5rem',
              fontSize: '12px',
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
                  fontWeight: '500',
                }}
              >
                Subtotal
              </p>
              <p style={{ margin: '0', padding: '0' }}>{formatMoney(Number(order.subtotal))}</p>
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
                  fontWeight: '500',
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
              <p style={{ margin: '0', padding: '0' }}>{formatMoney(Number(order.grand_total))}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default PrintHtml;
