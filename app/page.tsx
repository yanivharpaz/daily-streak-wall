import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Daily Streak Wall</h1>
        <p className="text-muted-foreground">
          Mark today as done. Build a streak. Watch your wall fill up.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/login">Get started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
