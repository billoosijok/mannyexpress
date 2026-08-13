// Days are handled everywhere as "YYYY-MM-DD" strings — the format the native
// date input already produces — so a day never shifts because of a time zone.

/** Monday first: the French week, unlike Date#getDay() which starts on Sunday. */
export const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function toDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

/** Local midnight for a day key, or null if the key is missing or malformed. */
export function parseDateKey(key) {
  const [year, month, day] = String(key ?? "").split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(monthStart, delta) {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
}

/**
 * The cells of a month grid, padded with the neighbouring days so every row
 * holds seven of them. Only the rows the month actually needs are produced.
 */
export function monthGrid(monthStart) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;

  const cells = [];
  for (let index = 0; index < cellCount; index += 1) {
    const date = new Date(year, month, index - offset + 1);
    cells.push({
      key: toDateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    });
  }
  return cells;
}
