export const formatCurrency = (amount, currency) => {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} ${currency}`;
  }
};

export const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$'
  };
  return symbols[currency] || currency;
}; 