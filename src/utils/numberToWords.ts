/**
 * Converts a numeric amount into Indian Currency Words (e.g. 1000 -> "Rupees One Thousand Only")
 */

const UNITS = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += UNITS[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
    if (n > 0) {
      str += 'and ';
    }
  }

  if (n > 0 && n < 20) {
    str += UNITS[n] + ' ';
  } else if (n >= 20) {
    str += TENS[Math.floor(n / 10)];
    if (n % 10 > 0) {
      str += '-' + UNITS[n % 10];
    }
    str += ' ';
  }

  return str.trim();
}

export function numberToWordsINR(amount: number): string {
  if (isNaN(amount)) return '';
  if (amount === 0) return 'Rupees Zero Only';

  const isNegative = amount < 0;
  amount = Math.abs(amount);

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Rupees Zero Only';
  }

  let crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundred = remainder;

  let result = '';

  if (crore > 0) {
    result += (crore < 1000 ? convertBelowThousand(crore) : numberToWordsINR(crore).replace('Rupees ', '').replace(' Only', '')) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertBelowThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertBelowThousand(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    result += convertBelowThousand(hundred) + ' ';
  }

  result = result.trim();

  let finalString = isNegative ? 'Minus Rupees ' : 'Rupees ';
  finalString += result;

  if (decimalPart > 0) {
    finalString += ' and ' + convertBelowThousand(decimalPart) + ' Paise';
  }

  finalString += ' Only';

  // Clean extra spaces
  return finalString.replace(/\s+/g, ' ').trim();
}

/**
 * Formats a number with Indian commas, e.g. 1000000 -> 10,00,000
 */
export function formatINR(val: number | string | undefined): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';

  return num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
}
