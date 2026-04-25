import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Daily Streak Wall</CardTitle>
          <CardDescription>Sign in to mark today as done.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            error={searchParams.error}
            message={searchParams.message}
          />
        </CardContent>
      </Card>
    </main>
  );
}
