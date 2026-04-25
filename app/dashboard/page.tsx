import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { computeStreaks, toDateKey } from "@/lib/streaks";
import { signOut } from "@/app/login/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthCalendar } from "@/components/month-calendar";
import { StreakCalendar } from "@/components/streak-calendar";
import { CheckInButton } from "./check-in-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Pull last ~13 months so the calendar wall + streak math have full coverage.
  const since = toDateKey(subDays(new Date(), 400));
  const { data: rows, error } = await supabase
    .from("check_ins")
    .select("check_in_date")
    .gte("check_in_date", since)
    .order("check_in_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const dates = (rows ?? []).map((r) => r.check_in_date as string);
  const stats = computeStreaks(dates);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Daily Streak Wall</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
        </div>
        <form action={signOut}>
          <Button variant="ghost" type="submit">
            Sign out
          </Button>
        </form>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Current streak</CardDescription>
            <CardTitle className="text-4xl">{stats.current}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Longest streak</CardDescription>
            <CardTitle className="text-4xl">{stats.longest}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total days</CardDescription>
            <CardTitle className="text-4xl">{stats.totalDays}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Today</CardTitle>
            <CardDescription>
              {stats.hasCheckedInToday
                ? "Nice — you've already checked in today."
                : "Mark today to keep your streak alive."}
            </CardDescription>
          </div>
          <CheckInButton done={stats.hasCheckedInToday} />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your wall</CardTitle>
          <CardDescription>The last year of check-ins.</CardDescription>
        </CardHeader>
        <CardContent>
          <StreakCalendar checkInDates={dates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>This month</CardTitle>
          <CardDescription>
            A closer look at the current month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthCalendar checkInDates={dates} />
        </CardContent>
      </Card>
    </main>
  );
}
