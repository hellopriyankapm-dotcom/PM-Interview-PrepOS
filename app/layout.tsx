import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepOS",
  description: "Adaptive PM interview prep for target-level readiness."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
