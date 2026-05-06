import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono"
});

const siteUrl = "https://pmprepos.com";
const description =
  "Adaptive PM interview prep that tells you what to practice next, not just what question to answer. Calibrated for APM, PM, Senior, Staff, AI PM, and PM-T loops.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PrepOS — Adaptive PM Interview Prep",
    template: "%s · PrepOS"
  },
  description,
  applicationName: "PrepOS",
  keywords: [
    "PM interview prep",
    "product manager interview",
    "APM interview",
    "AI PM interview",
    "adaptive learning",
    "interview practice",
    "FAANG PM"
  ],
  authors: [{ name: "PrepOS" }],
  creator: "PrepOS",
  publisher: "PrepOS",
  category: "education",
  icons: {
    icon: "favicon-48.png",
    shortcut: "favicon-48.png",
    apple: "favicon-48.png"
  },
  openGraph: {
    type: "website",
    title: "PrepOS — Adaptive PM Interview Prep",
    description,
    siteName: "PrepOS",
    url: siteUrl,
    images: [{ url: "favicon-48.png", width: 48, height: 48, alt: "PrepOS" }]
  },
  twitter: {
    card: "summary",
    title: "PrepOS — Adaptive PM Interview Prep",
    description,
    images: ["favicon-48.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e0c" }
  ]
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('prepos-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`.trim();

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Analytics />
      </head>
      <body>{children}</body>
    </html>
  );
}
