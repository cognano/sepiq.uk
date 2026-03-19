import "rotion/style.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingCircles from "./components/FloatingCircles";
import Footer from "./components/footer";
import Header from "./components/header";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "SEPIQ";
const title = "SEPIQ VHH-Epitope-Prediction Challenge 2026";
const description =
  "Call for Participation: SEPIQ VHH-Epitope-Prediction Challenge 2026";
const url = "https://sepiq.uk";
const image = `${url}/ogp-image.png`;

export const metadata: Metadata = {
  title,
  description,
  icons: [{ rel: "icon", url: "/favicon.svg" }],
  openGraph: {
    title,
    description,
    url,
    siteName,
    images: [{ url: image, width: 1200, height: 630, alt: siteName }],
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: "",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <FloatingCircles />
        <Header />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
