export function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatPhoneNumber(phone) {
  const cleaned = ('' + phone).replace(/\D/g, '');

  let country = '';
  let number = cleaned;

  // Detect leading "1" for US country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    country = '+1 ';
    number = cleaned.slice(1);
  }

  const match = number.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${country}(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phone;
}

export function formatMoney(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export async function getLocalPrinters(dispatch) {
  try {
    const printersRes = await fetch('http://localhost:4577/printers');
    if (!printersRes.ok) throw new Error('Bad response from print server');

    return await printersRes.json();
  } catch (err) {
    console.warn('🛑 Local print server not running or unreachable.');
    dispatch({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Connecting to Print Server',
        message:
          err.message ||
          'An Error occurred when attempting to connect to print server. Please ensure the print server is running on your machine.',
      },
    });
    setTimeout(() => {
      dispatch({ type: 'CLEAR_ORDERS_ERROR' });
    }, 5000);
    return;
  }
}

export const ageToMinutes = (age) => {
  if (!age) return 0;
  const [value, unit] = age.split(' ');
  const num = parseInt(value, 10);
  if (isNaN(num)) return 0;

  switch (unit) {
    case 'min':
      return num;
    case 'hr':
      return num * 60;
    case 'day':
    case 'days':
      return num * 1440;
    default:
      return 0;
  }
};

export const getAgeColor = (minutes) => {
  const capped = Math.min(minutes, 2880);
  const ratio = capped / 2880;

  let r, g;

  if (ratio < 0.5) {
    // From green (0, 180, 0) to yellow (255, 180, 0)
    r = Math.floor(510 * ratio); // 0 to 255
    g = 180;
  } else {
    // From yellow (255, 180, 0) to red (255, 0, 0)
    r = 255;
    g = Math.floor(180 * (1 - (ratio - 0.5) * 2)); // 180 to 0
  }

  return `rgb(${r}, ${g}, 0)`;
};

export const shouldExcludeOption = (displayName) => {
  if (displayName.toLowerCase().includes('terms')) {
    return true;
  } else if (displayName.toLowerCase() === 'acknowledgement') {
    return true;
  }
  return false;
};

export const cleanDisplayName = (displayName) => {
  if (displayName.toLowerCase().includes('reorder')) {
    return 'Reorder #';
  } else if (displayName.toLowerCase().includes('stone colors')) {
    return 'Stone Colors';
  } else if (displayName.toLowerCase().includes('garment type')) {
    return 'Garment Type';
  } else if (displayName.toLowerCase().includes('printed size')) {
    return 'Printed Size (in.)';
  } else if (displayName.toLowerCase() === 'garment type & color') {
    return 'Garment Type/Color';
  }
  return displayName.split(':')[0].trim() || displayName;
};

export const optionCleaner = (displayName, displayValue) => {
  const lowerName = displayName.toLowerCase();

  if (lowerName.includes('length')) {
    // Keep everything before and including "Roll"
    const before = displayValue.split('Roll')[0];
    return before.trim() + ' Roll';
  }

  if (lowerName.includes('color')) {
    return displayValue
      .replace(/\s*\([^)]*\)/g, '') // remove "(...)" blocks
      .replace(/\*/g, '') // remove asterisks
      .replace(/\d+/g, '') // remove numbers
      .replace(/\s{2,}/g, ' ') // collapse extra spaces
      .trim();
  }

  return displayValue;
};

export const filterDropshipOrders = (orders) => {
  return orders.filter((order) => {
    const items = order.items || [];
    return items.some((item) => item.is_dropship);
  });
};

export const calculateOrderAges = (orders = []) => {
  const now = Date.now();
  return orders.map((order) => {
    const createdAt = new Date(order.created_at);
    const diffInMs = now - createdAt;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    let ageLabel = '';
    if (diffInMinutes < 60) ageLabel = `${diffInMinutes} min`;
    else if (diffInHours < 24) ageLabel = `${diffInHours} hr`;
    else ageLabel = `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;

    return { ...order, age: ageLabel };
  });
};

// utils/tableUtils.js
export const parseAgeToMinutes = (ageStr) => {
  if (!ageStr) return Infinity;
  const [value, unit] = ageStr.split(' ');
  const num = parseInt(value, 10);
  if (isNaN(num)) return Infinity;

  switch (unit) {
    case 'min':
      return num;
    case 'hr':
      return num * 60;
    case 'day':
    case 'days':
      return num * 1440;
    default:
      return Infinity;
  }
};

export function sortOrders(orders, sort) {
  if (!Array.isArray(orders)) return [];

  return [...orders].sort((a, b) => {
    const valA = a[sort.sort_by] ?? '';
    const valB = b[sort.sort_by] ?? '';

    if (sort.sort_by === 'age') {
      const ageA = parseAgeToMinutes(valA);
      const ageB = parseAgeToMinutes(valB);
      return sort.order === 'asc' ? ageA - ageB : ageB - ageA;
    }

    if (valA === null) return 1;
    if (valB === null) return -1;

    return sort.order === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });
}

export const getOrderKey = (order) => `${order.order_id}-${order.shipment_number || order.id}`;

export function toggleSelectAll(activeOrders, setActiveOrders, filteredData, allSelected) {
  if (allSelected) {
    // Deselect all
    setActiveOrders((prev) =>
      prev.filter((o) => !filteredData.some((p) => getOrderKey(p) === getOrderKey(o)))
    );
  } else if (activeOrders.length > 0) {
    // Deselect all
    setActiveOrders([]);
  } else {
    // Select all
    const newOrders = filteredData.filter(
      (o) => !activeOrders.some((a) => getOrderKey(a) === getOrderKey(o))
    );
    setActiveOrders((prev) => [...prev, ...newOrders]);
  }
}

export function toggleSelectOrder(activeOrders, setActiveOrders, order) {
  const orderKey = getOrderKey(order);
  if (activeOrders.some((o) => getOrderKey(o) === orderKey)) {
    setActiveOrders((prev) => prev.filter((o) => getOrderKey(o) !== orderKey));
  } else {
    setActiveOrders((prev) => [...prev, order]);
  }
}
