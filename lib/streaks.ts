import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfDay,
  subDays,
} from "date-fns";

/** YYYY-MM-DD in the viewer's local time. */
export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  // Parse as a local-time date so we don't drift across timezones.
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface StreakStats {
  current: number;
  longest: number;
  totalDays: number;
  hasCheckedInToday: boolean;
}

export function computeStreaks(dateKeys: string[]): StreakStats {
  if (dateKeys.length === 0) {
    return { current: 0, longest: 0, totalDays: 0, hasCheckedInToday: false };
  }

  const set = new Set(dateKeys);
  const sorted = [...set].sort();
  const today = startOfDay(new Date());
  const todayStr = toDateKey(today);
  const yesterdayStr = toDateKey(subDays(today, 1));
  const hasCheckedInToday = set.has(todayStr);

  // Current streak: walk back from today (or yesterday if no check-in today).
  let current = 0;
  let cursor = hasCheckedInToday
    ? today
    : set.has(yesterdayStr)
      ? subDays(today, 1)
      : null;

  while (cursor && set.has(toDateKey(cursor))) {
    current += 1;
    cursor = subDays(cursor, 1);
  }

  // Longest streak: single pass over sorted unique dates.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseDateKey(sorted[i - 1]);
    const curr = parseDateKey(sorted[i]);
    if (differenceInCalendarDays(curr, prev) === 1) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return {
    current,
    longest,
    totalDays: set.size,
    hasCheckedInToday,
  };
}

/**
 * Build a 7-row × N-column grid (Sun..Sat top→bottom) covering the last
 * `weeks` weeks ending on today. Cells before the start window are null.
 */
export function buildCalendarGrid(
  checkInSet: Set<string>,
  weeks = 53,
): { columns: Array<Array<{ key: string; checked: boolean } | null>>; monthLabels: Array<{ col: number; label: string }> } {
  const today = startOfDay(new Date());
  const todayDow = today.getDay(); // 0..6, Sun=0
  // End column ends on the Saturday of this week so the grid is rectangular.
  const endDate = addDays(today, 6 - todayDow);
  const totalDays = weeks * 7;
  const startDate = subDays(endDate, totalDays - 1);

  const columns: Array<Array<{ key: string; checked: boolean } | null>> = [];
  const monthLabels: Array<{ col: number; label: string }> = [];
  let lastMonth = -1;

  for (let w = 0; w < weeks; w++) {
    const col: Array<{ key: string; checked: boolean } | null> = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(startDate, w * 7 + d);
      if (date > today) {
        col.push(null);
      } else {
        const key = toDateKey(date);
        col.push({ key, checked: checkInSet.has(key) });
      }
      // Month label when first day of week crosses a new month.
      if (d === 0) {
        const m = date.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ col: w, label: format(date, "MMM") });
          lastMonth = m;
        }
      }
    }
    columns.push(col);
  }

  return { columns, monthLabels };
}
