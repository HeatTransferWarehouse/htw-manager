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
