"use client";

import { useTransition } from "react";
import { Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkInToday } from "./actions";

export function CheckInButton({ done }: { done: boolean }) {
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <Button disabled variant="secondary" size="lg">
        <Check className="h-4 w-4" />
        Done for today
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      disabled={pending}
      onClick={() => startTransition(() => checkInToday())}
    >
      <Flame className="h-4 w-4" />
      {pending ? "Saving..." : "Mark today as done"}
    </Button>
  );
}
