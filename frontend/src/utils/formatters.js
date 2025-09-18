// Price formatting
export const formatPrice = (price, currency = 'USD', locale = 'en-US') => {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Date formatting
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// Date with time formatting
export const formatDateTime = (date, includeTime = true) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const dateOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };

    if (includeTime) {
      return `${dateObj.toLocaleDateString('en-US', dateOptions)} at ${dateObj.toLocaleTimeString('en-US', timeOptions)}`;
    }
    
    return dateObj.toLocaleDateString('en-US', dateOptions);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

// Relative time formatting
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

// Number formatting with abbreviations
export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(decimals) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(decimals) + 'M';
  return (num / 1000000000).toFixed(decimals) + 'B';
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 12 && cleaned.slice(0, 2) === '20') {
    return `+20 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  return phoneNumber;
};

// Credit card formatting
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  
  if (groups) {
    return groups.join(' ').substring(0, 19);
  }
  
  return cardNumber;
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

// Currency formatting without symbol
export const formatCurrency = (amount, locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Address formatting
export const formatAddress = (address) => {
  if (!address) return 'No address provided';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

// Name formatting
export const formatName = (firstName, lastName, fallback = 'User') => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  }
  
  return fallback;
};

// Truncate text
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + suffix;
};

// Capitalize first letter
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Title case formatting
export const toTitleCase = (text) => {
  if (!text) return '';
  
  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
