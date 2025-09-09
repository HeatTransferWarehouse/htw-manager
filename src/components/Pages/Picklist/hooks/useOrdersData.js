import { useMemo } from 'react';
import { sortOrders } from '../utils/utils';

export default function useOrdersData(ordersData, sort, view, searchTerm) {
  return useMemo(() => {
    if (!Array.isArray(ordersData)) return [];

    // sort + filter logic pulled in from utils
    let sorted = sortOrders(ordersData, sort);

    if (view === 'printed') sorted = sorted.filter((o) => o.is_printed);
    if (view === 'not-printed') sorted = sorted.filter((o) => !o.is_printed);
    if (view === 'dropship') sorted = sorted.filter((o) => o.line_items.some((i) => i.is_dropship));

    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      sorted = sorted.filter((order) => {
        return (
          order.order_id?.toString().includes(q) ||
          order.line_items?.some(
            (i) => i.sku?.toLowerCase().includes(q) || i.name?.toLowerCase().includes(q)
          )
        );
      });
    }

    return sorted;
  }, [ordersData, sort, view, searchTerm]);
}
