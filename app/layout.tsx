import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Streak Wall",
  description: "Build daily habits with a GitHub-style streak wall.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
