/**
 * Formats a number according to the Indian numbering system
 * E.g. 1234567 -> "12,34,567"
 */
export function formatIndianNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const rounded = Math.round(num);
  const str = Math.abs(rounded).toString();
  
  if (str.length <= 3) {
    return (rounded < 0 ? '-' : '') + str;
  }
  
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const sign = rounded < 0 ? '-' : '';
  
  return sign + formattedOther + ',' + lastThree;
}

/**
 * Formats currency in Indian Rupees with Crores (Cr) and Lakhs (L)
 * e.g. 4550000 -> "₹45.5 Lakhs"
 *      12500000 -> "₹1.25 Crores"
 *      85000 -> "₹85,000"
 */
export function formatINR(amount: number, style: 'compact' | 'full' = 'compact'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (style === 'compact') {
    if (absAmount >= 10000000) {
      // 1 Crore = 10,000,000
      const crores = absAmount / 10000000;
      return `${sign}₹${crores.toFixed(crores >= 10 ? 1 : 2)} Crores`;
    } else if (absAmount >= 100000) {
      // 1 Lakh = 100,000
      const lakhs = absAmount / 100000;
      return `${sign}₹${lakhs.toFixed(lakhs >= 10 ? 1 : 2)} Lakhs`;
    } else if (absAmount >= 1000) {
      const thousands = absAmount / 1000;
      return `${sign}₹${thousands.toFixed(1)}k`;
    } else {
      return `${sign}₹${absAmount.toFixed(0)}`;
    }
  }

  // Full Indian currency format with Lakh/Crore grouping: ₹12,34,567
  return `${sign}₹${formatIndianNumber(absAmount)}`;
}

/**
 * Formats distance in km or meters
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return '0 m';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(2)} km`;
}

/**
 * Formats daily traffic volume
 */
export function formatTraffic(volume: number): string {
  if (!volume) return '0 /day';
  if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)} Lakh vehicles/day`;
  }
  return `${formatIndianNumber(volume)} vehicles/day`;
}

/**
 * Formats population density
 */
export function formatDensity(density: number): string {
  if (!density) return '0 /km²';
  return `${formatIndianNumber(density)} /km²`;
}
