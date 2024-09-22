import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import DarkModeWrapper from "@/components/DarkModeWrapper";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Opensource Hub",
  description: "Find new opensource projects to contribute & add your own project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <html lang="en">
          <body className="relative border-zinc-950 bg-zinc-50 text-zinc-950 dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-100">
            <DarkModeWrapper>
              <div className={`absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#FAFAFA_40%,#14B8A6_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#09090B_50%,#14B8A6_100%)]`}></div>
              <Header />
              <main className="min-h-screen p-2">{children}</main>
              <Footer />
            </DarkModeWrapper>
          </body>
        </html>
      </NotificationProvider>
    </AuthProvider>
  );
}
