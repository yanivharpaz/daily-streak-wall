import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";

import { toDateKey } from "@/lib/streaks";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthCalendarProps {
  checkInDates: string[];
}

export function MonthCalendar({ checkInDates }: MonthCalendarProps) {
  const set = new Set(checkInDates);
  const today = startOfDay(new Date());
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });
  const leadingBlanks = getDay(start); // 0..6, Sun=0

  const checkedThisMonth = days.filter((d) => set.has(toDateKey(d))).length;

  return (
    <div className="space-y-3 max-w-md">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium">{format(today, "MMMM yyyy")}</div>
        <div className="text-xs text-muted-foreground">
          {checkedThisMonth} / {days.length} days
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[11px] text-muted-foreground">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`b${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const key = toDateKey(day);
          const checked = set.has(key);
          const isToday = isSameDay(day, today);
          const isFuture = day > today;

          return (
            <div
              key={key}
              title={`${key}${checked ? " ✓" : ""}`}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-sm font-medium",
                isFuture && "bg-streak-0 text-muted-foreground/40",
                !isFuture && !checked && "bg-streak-0 text-foreground",
                !isFuture && checked && "bg-streak-4 text-white",
                isToday &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
