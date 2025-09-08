import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { formatMoney } from '../utils/utils';

const stateMap = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
};

function cleanStreetAddress(street, city, state, zip) {
  const regex = new RegExp(`,?\\s*${city}\\s*,?\\s*${state}\\s*${zip}.*$`, 'i');
  return street.replace(regex, '').trim();
}

function OrderDetails({ order, setActiveOrder }) {
  const ref = React.useRef(null);
  console.log(order);

  const close = () => {
    setActiveOrder(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return createPortal(
    <div
      ref={ref}
      className="bg-black/50 z-[2034958] fixed top-0 left-0 w-screen h-screen flex items-center justify-center"
    >
      <div className="bg-white rounded-md shadow-default overflow-hidden w-[calc(100%-2rem)] max-w-[1200px]">
        <div className="bg-gray-200 border-b flex items-center justify-between border-b-gray-300 p-2">
          <h2 className="text-xl font-normal">
            Order Details: <span className="font-semibold">{order.order_id}</span>
          </h2>
          <button className="w-6 h-6 flex items-center group justify-center" onClick={close}>
            <IoClose className="w-6 h-6 group-hover:text-red-600" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-6">Shipping Details</h3>
            <div className="flex flex-col gap-1">
              <h4 className="font-medium">Shipping Address</h4>
              <p>
                {order.customer.first_name} {order.customer.last_name}
              </p>
              {order.customer.company && <p>{order.customer.company}</p>}
              <p>
                {cleanStreetAddress(
                  order.shipping.street_1,
                  order.shipping.city,
                  stateMap[order.shipping.state] || order.shipping.state,
                  order.shipping.zip
                )}
              </p>
              {order.shipping.street_2 && (
                <p>
                  {cleanStreetAddress(
                    order.shipping.street_2,
                    order.shipping.city,
                    stateMap[order.shipping.state] || order.shipping.state,
                    order.shipping.zip
                  )}
                </p>
              )}
              <p>
                {order.shipping.city}, {stateMap[order.shipping.state] || order.shipping.state}{' '}
                {order.shipping.zip}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
            <div className="flex flex-col gap-1">
              <div className="w-full flex justify-between">
                <p className="">Products</p>
                <p>{formatMoney(Number(order.subtotal))}</p>
              </div>
              <div className="w-full flex justify-between">
                <p className="">
                  Coupons{' '}
                  {order.coupon_name && (
                    <span className="text-sm text-gray-500">({order.coupon_name})</span>
                  )}
                </p>
                {order.coupon_name ? (
                  <p>-{formatMoney(Number(order.coupon_value))}</p>
                ) : (
                  <p>$0.00</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default OrderDetails;
