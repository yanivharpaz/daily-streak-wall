"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayKey } from "@/lib/streaks";

export async function checkInToday() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("check_ins")
    .insert({ user_id: user.id, check_in_date: todayKey() });

  // 23505 = unique violation: already checked in today, treat as a no-op.
  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
