export function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatPhoneNumber(phone) {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
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

export async function getLocalPrinters() {
  try {
    const printersRes = await fetch('http://localhost:4577/printers');
    if (!printersRes.ok) throw new Error('Bad response from print server');

    return await printersRes.json();
  } catch (err) {
    console.warn('🛑 Local print server not running or unreachable.');
    alert('⚠️ Local Print Server not detected. Please ensure it is installed and running.');
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
  } else if (displayName.toLowerCase().includes('upload')) {
    return true;
  } else if (displayName.toLowerCase().includes('digital proof')) {
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
