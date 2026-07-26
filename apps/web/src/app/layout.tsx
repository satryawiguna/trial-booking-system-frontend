import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

import { AppNavbar } from "./_components/AppNavbar";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Trial Booking System",
  description: "Book a trial class for your child",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-screen bg-background font-sans">
        <AppNavbar />
        {children}
      </body>
    </html>
  );
}
