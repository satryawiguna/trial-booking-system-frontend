import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

import { AdminTabBar } from "./_components/AdminTabBar";
import { AppNavbar } from "./_components/AppNavbar";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Trial Booking System — Admin",
  description: "Manage trial classes and view booking rosters",
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
        <AdminTabBar />
        {children}
      </body>
    </html>
  );
}
