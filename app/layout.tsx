import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepOS",
  description: "Adaptive PM interview prep for target-level readiness.",
  icons: {
    icon: "favicon-48.png",
    shortcut: "favicon-48.png",
    apple: "favicon-48.png"
  }
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
