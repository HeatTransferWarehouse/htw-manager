import React from 'react';
import ShipStationBarcode from './shipstation-barcode';
import {
  cleanDisplayName,
  formatMoney,
  formatPhoneNumber,
  optionCleaner,
  shouldExcludeOption,
  toTitleCase,
} from '../utils/utils';

const PrintHtml = React.forwardRef(({ activeOrders, splitOrders }, ref) => {
  const getOrderKey = (order) => `${order.order_id}-${order.shipment_number || order.id}`;
  const splitInfo = (order) =>
    splitOrders.find((o) => o.order_id === String(order.order_id)) || null;

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
      }}
      ref={ref}
      id="print-section"
    >
      {activeOrders.map((order, i) => (
        <div
          style={{
            pageBreakAfter: i < activeOrders.length - 1 ? 'always' : 'auto',
            paddingTop: '30pt', // 40px → 30pt
          }}
          key={getOrderKey(order) + 'print'}
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
                width: '94pt', // 125px → 94pt
                height: 'auto',
                margin: '0',
                padding: '0',
              }}
              loading="eager"
              src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/heat-transfer-warehouse-logo-2024.png?t=1710348082"
              alt="Heat Transfer Warehouse Logo"
            />
            <ShipStationBarcode splitInfo={splitInfo(order)} orderInfo={order} />
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
                  fontSize: '15pt', // 20px → 15pt
                  fontWeight: 'bold',
                  textAlign: 'right',
                }}
              >
                SHIPPING METHOD
              </p>
              <p
                style={{
                  margin: '0',
                  fontSize: '13.5pt', // 18px → 13.5pt
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
              marginTop: '1.5rem', // 2rem ≈ 32px → 24pt
              padding: '0',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p
                style={{
                  margin: '0',
                  fontSize: '13.5pt', // 18px → 13.5pt
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Customer
              </p>
              <p style={{ fontSize: '9pt', margin: '0' }}>
                {toTitleCase(order.customer.first_name)} {toTitleCase(order.customer.last_name)}
              </p>
              <p style={{ fontSize: '9pt', margin: '0' }}>{order.customer.email}</p>
              {order.customer.company && (
                <p style={{ fontSize: '9pt', margin: '0' }}>
                  {toTitleCase(order.customer.company)}
                </p>
              )}
              <p style={{ fontSize: '9pt', margin: '0' }}>
                {formatPhoneNumber(order.customer.phone)}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p
                style={{
                  margin: '0',
                  fontSize: '13.5pt', // 18px
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Shipping Info
              </p>
              <p style={{ fontSize: '9pt', margin: '0' }}>{toTitleCase(order.shipping.street_1)}</p>
              {order.shipping.street_2 && (
                <p style={{ fontSize: '9pt', margin: '0' }}>
                  {toTitleCase(order.shipping.street_2)}
                </p>
              )}
              <p style={{ fontSize: '9pt', margin: '0' }}>
                {toTitleCase(order.shipping.city)}, {toTitleCase(order.shipping.state)}{' '}
                {order.shipping.zip}
              </p>
              <p style={{ fontSize: '9pt', margin: '0' }}>{toTitleCase(order.shipping.country)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p
                style={{
                  margin: '0',
                  fontSize: '13.5pt', // 18px
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Order Info
              </p>
              <p style={{ fontSize: '9pt', margin: '0' }}>
                <span style={{ fontWeight: '600' }}>Order Number:</span> {order.order_id}{' '}
                {splitInfo(order).shipmentCount > 1
                  ? `(${order.shipment_number} of ${splitInfo(order).shipmentCount})`
                  : ''}
              </p>
              <p style={{ fontSize: '9pt', margin: '0' }}>
                <span style={{ fontWeight: '600' }}>Order Date:</span>{' '}
                {new Date(order.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
          </div>

          {/* --- Table --- */}
          <table
            style={{
              marginTop: '24pt', // 2rem ≈ 24pt
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid black', pageBreakInside: 'avoid' }}>
                <th
                  style={{
                    fontSize: '9pt',
                    fontWeight: '600',
                    padding: '6pt 0',
                    textAlign: 'left',
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    fontSize: '9pt',
                    fontWeight: '600',
                    padding: '6pt 0 6pt 4pt',
                    textAlign: 'left',
                  }}
                >
                  Sku
                </th>
                <th
                  style={{
                    fontSize: '9pt',
                    fontWeight: '600',
                    padding: '6pt 0',
                    textAlign: 'left',
                  }}
                >
                  Item
                </th>
                <th
                  style={{
                    fontSize: '9pt',
                    fontWeight: '600',
                    padding: '6pt 0',
                    textAlign: 'right',
                  }}
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {order.line_items.map((product) => (
                <tr
                  key={product.id + product.order_id}
                  style={{ borderBottom: '1px solid lightgray' }}
                >
                  <td style={{ fontSize: '9pt', padding: '6pt 0', verticalAlign: 'top' }}>
                    {product.quantity}
                  </td>
                  <td style={{ fontSize: '9pt', padding: '6pt 0 6pt 4pt', verticalAlign: 'top' }}>
                    <span>{product.sku}</span>
                  </td>
                  <td style={{ fontSize: '9pt', padding: '6pt 0', verticalAlign: 'top' }}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <p style={{ margin: '0', padding: '0' }}>
                        <span style={{ fontWeight: '600' }}> Name: </span> {product.name}{' '}
                      </p>
                      {product.options &&
                        product.options.length > 0 &&
                        product.options.map((opt, i) => {
                          if (shouldExcludeOption(opt.display_name)) {
                            return null;
                          }
                          return (
                            <p style={{ margin: '0', padding: '0' }} key={i + product.id + 'opt'}>
                              {' '}
                              <span style={{ fontWeight: '600' }}>
                                {' '}
                                {cleanDisplayName(opt.display_name)}:{' '}
                              </span>{' '}
                              {optionCleaner(opt.display_name, opt.display_value)}{' '}
                            </p>
                          );
                        })}
                    </span>
                  </td>
                  <td
                    style={{
                      fontSize: '9pt',
                      padding: '6pt 0',
                      verticalAlign: 'top',
                      textAlign: 'right',
                    }}
                  >
                    {formatMoney(product.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- Totals --- */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '9pt', // 12px → 9pt
              width: '150pt', // 200px → 150pt
              paddingTop: '3.5pt', // 0.5rem ≈ 3.5pt
              fontSize: '9pt',
              pageBreakInside: 'avoid',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ margin: '0', fontWeight: '600' }}>Subtotal</p>
              <p style={{ margin: '0' }}>{formatMoney(Number(order.subtotal))}</p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid black',
                paddingBottom: '3.5pt',
              }}
            >
              <p style={{ margin: '0', fontWeight: '600' }}>Tax</p>
              <p style={{ margin: '0' }}>{formatMoney(Number(order.tax))}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ margin: '0', fontWeight: '600', fontSize: '13.5pt' }}>Total</p>
              <p style={{ margin: '0' }}>{formatMoney(Number(order.grand_total))}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default PrintHtml;
