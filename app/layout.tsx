import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Supabadge - Live Metrics Badges for Supabase",
  description: "Create beautiful, live-updating metrics badges for your Supabase projects. Display table counts and stats in READMEs, dashboards, and more.",
  keywords: ["supabase", "badge", "metrics", "database", "analytics", "readme", "github"],
  authors: [{ name: "Supabadge" }],
  openGraph: {
    title: "Supabadge - Live Metrics Badges for Supabase",
    description: "Create beautiful, live-updating metrics badges for your Supabase projects",
    type: "website",
    locale: "en_US",
    siteName: "Supabadge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supabadge - Live Metrics Badges for Supabase",
    description: "Create beautiful, live-updating metrics badges for your Supabase projects",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
