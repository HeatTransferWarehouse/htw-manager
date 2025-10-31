import React, { useMemo } from 'react';
import { cleanDisplayName, optionCleaner } from '../../utils/utils';

const ConversionHTML = React.forwardRef(({ activeOrders }, ref) => {
  const result = useMemo(() => {
    const allLineItems = activeOrders.flatMap((order) =>
      (order.line_items || [])
        // ✅ filter for items with "htv" or "heat transfer vinyl" in the name
        .filter((item) => {
          const name = item.name?.toLowerCase() || '';
          return name.includes('htv') || name.includes('heat transfer vinyl');
        })
        .map((item) => ({
          ...item,
          order_id: order.order_id,
        }))
    );

    const lineItemSummary = allLineItems.reduce((acc, item) => {
      const key = item.sku;

      if (!acc[key]) {
        acc[key] = {
          sku: item.sku,
          name: item.name,
          totalQty: 0,
          orderIds: new Set(),
          options: item.options || [],
        };
      }

      acc[key].totalQty += item.quantity;
      acc[key].orderIds.add(item.order_id);

      return acc;
    }, {});

    return Object.values(lineItemSummary).map((item) => ({
      ...item,
      orderIds: Array.from(item.orderIds),
    }));
  }, [activeOrders]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }} ref={ref} id="print-section">
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
        <h1
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '24px',
          }}
        >
          Conversion Picklist
        </h1>
      </div>
      <table
        style={{
          marginTop: '20px',
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
                paddingBlock: '8px',
                textAlign: 'left',
                margin: '0',
                paddingRight: '8px',
                fontWeight: '600',
              }}
            >
              Orders
            </th>
            <th
              style={{
                fontSize: '12px',
                paddingBlock: '8px',
                textAlign: 'left',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '8px',
                fontWeight: '600',
              }}
            >
              Sku
            </th>
            <th
              style={{
                fontSize: '12px',
                paddingBlock: '8px',
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
                paddingBlock: '8px',
                textAlign: 'left',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '0',
                fontWeight: '600',
              }}
            >
              Variant
            </th>
            <th
              style={{
                fontSize: '12px',
                paddingBlock: '8px',
                textAlign: 'left',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '0',
                fontWeight: '600',
                width: '150px',
              }}
            >
              Notes
            </th>
            <th
              style={{
                fontSize: '12px',
                paddingBlock: '8px',
                textAlign: 'left',
                margin: '0',
                paddingRight: '0',
                paddingLeft: '0',
                fontWeight: '600',
              }}
            >
              Qty
            </th>
          </tr>
        </thead>
        <tbody>
          {result.map((item) => (
            <tr
              style={{
                pageBreakInside: 'avoid',
                borderBottom: '1px solid lightgray',
                position: 'relative',
              }}
              key={item.sku}
            >
              <td
                style={{
                  fontSize: '12px',
                  padding: '8px 8px 8px 0',
                  textAlign: 'left',
                  margin: '0',
                  verticalAlign: 'top',
                }}
              >
                <span style={{ minHeight: '50px' }}>
                  {item.orderIds.map((id, index) => (
                    <p style={{ margin: '2px 0' }} key={id + index + item.sku}>
                      {id}
                    </p>
                  ))}
                </span>
              </td>
              <td
                style={{
                  fontSize: '12px',
                  padding: '8px 4px',
                  textAlign: 'left',
                  margin: '0',
                  verticalAlign: 'top',
                }}
              >
                <span style={{ minHeight: '50px' }}>
                  <p style={{ margin: '1px 0' }}>{item.sku}</p>
                </span>
              </td>
              <td
                style={{
                  fontSize: '12px',
                  padding: '8px 2px 8px 0',
                  textAlign: 'left',
                  margin: '0',
                  verticalAlign: 'top',
                }}
              >
                <span style={{ minHeight: '50px' }}>
                  <p style={{ margin: '1px 0' }}>{item.name}</p>
                </span>
              </td>
              <td
                style={{
                  fontSize: '12px',
                  padding: '8px 4px 8px 0',
                  textAlign: 'left',
                  margin: '0',
                  verticalAlign: 'top',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    minHeight: '50px',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {item.options.map((opt, index) => (
                    <React.Fragment key={opt.display_name + opt.display_value + index}>
                      <p style={{ margin: '1px 0' }}>
                        <span>{cleanDisplayName(opt.display_name)}:</span>{' '}
                        <span
                          style={{
                            fontWeight: '600',
                          }}
                        >
                          {optionCleaner(opt.display_name, opt.display_value)}
                        </span>
                      </p>
                    </React.Fragment>
                  ))}
                </span>
              </td>
              <td
                style={{
                  fontSize: '12px',
                  padding: '8px 8px 8px 0',
                  textAlign: 'left',
                  margin: '0',
                  verticalAlign: 'top',
                  width: '150px',
                }}
              >
                <span style={{ minHeight: '50px' }} />
              </td>
              <td
                style={{
                  fontSize: '16px',
                  padding: '8px 8px 8px 0',
                  textAlign: 'right',
                  margin: '0',
                  verticalAlign: 'top',
                }}
              >
                <span style={{ minHeight: '50px' }}>
                  <p style={{ margin: '1px 0' }}>{item.totalQty}</p>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ConversionHTML;
