import { buildCalendarGrid } from "@/lib/streaks";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  checkInDates: string[];
  weeks?: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StreakCalendar({
  checkInDates,
  weeks = 53,
}: StreakCalendarProps) {
  const set = new Set(checkInDates);
  const { columns, monthLabels } = buildCalendarGrid(set, weeks);

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-2 min-w-fit">
        {/* Month labels */}
        <div
          className="grid grid-flow-col auto-cols-[14px] gap-[3px] pl-8"
          aria-hidden
        >
          {Array.from({ length: weeks }).map((_, col) => {
            const label = monthLabels.find((m) => m.col === col)?.label;
            return (
              <div
                key={col}
                className="h-4 text-[10px] text-muted-foreground"
              >
                {label ?? ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          {/* Day-of-week labels */}
          <div className="grid grid-rows-7 gap-[3px] text-[10px] text-muted-foreground w-6">
            {DAY_LABELS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "h-[14px] leading-[14px]",
                  i % 2 === 0 ? "opacity-0" : "",
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Cell grid */}
          <div className="grid grid-flow-col auto-cols-[14px] gap-[3px]">
            {columns.map((col, ci) => (
              <div key={ci} className="grid grid-rows-7 gap-[3px]">
                {col.map((cell, ri) => (
                  <div
                    key={ri}
                    title={cell ? `${cell.key}${cell.checked ? " ✓" : ""}` : undefined}
                    className={cn(
                      "w-[14px] h-[14px] rounded-[3px]",
                      !cell && "bg-transparent",
                      cell && !cell.checked && "bg-streak-0",
                      cell && cell.checked && "bg-streak-4",
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-8">
          <span>Less</span>
          <span className="w-[14px] h-[14px] rounded-[3px] bg-streak-0" />
          <span className="w-[14px] h-[14px] rounded-[3px] bg-streak-1" />
          <span className="w-[14px] h-[14px] rounded-[3px] bg-streak-2" />
          <span className="w-[14px] h-[14px] rounded-[3px] bg-streak-3" />
          <span className="w-[14px] h-[14px] rounded-[3px] bg-streak-4" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
