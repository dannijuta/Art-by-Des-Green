/** Money is always stored and passed around as integer cents. Never floats. */

export function formatZAR(cents: number): string {
  const rand = Math.round(cents) / 100;
  const formatted = rand.toLocaleString('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `R ${formatted}`;
}

export function randToCents(rand: number): number {
  return Math.round(rand * 100);
}

export function centsToRandString(cents: number): string {
  return (cents / 100).toFixed(2);
}
