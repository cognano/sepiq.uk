import "rotion/style.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Header from "./components/header";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEPIQ VHH-Epitope-Prediction Challenge 2026",
  description: "Call for Participation: SEPIQ VHH-Epitope-Prediction Challenge 2026",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <div className={styles.main}>
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
