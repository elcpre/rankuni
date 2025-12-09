import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RankUni | Global Higher Education Analytics",
    template: "%s | RankUni"
  },
  description: "Compare universities worldwide. Analyze tuition, student satisfaction, and enrollment data for institutions in the US, UK, and France.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rankuni.app/',
    siteName: 'RankUni',
    images: [
      {
        url: '/og-image.png', // We don't have this yet, but good to have the tag ready
        width: 1200,
        height: 630,
        alt: 'RankUni Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RankUni | Global Higher Education Analytics',
    description: 'Compare universities worldwide. Analyze tuition, student satisfaction, and enrollment data.',
    creator: '@rankuni',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
