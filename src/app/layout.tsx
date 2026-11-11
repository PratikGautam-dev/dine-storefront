import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toast";
import { StorefrontProviders } from "@/components/storefront/StorefrontProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dine Connect — Order Online",
  description: "Browse menus, order food, and book a table at restaurants on Dine Connect.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Storefront icon font (src/app/order/storefront-tokens.css's
            .material-symbols-outlined rules) -- loaded here because nested App Router layouts
            can't inject into <head>. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        <StorefrontProviders>{children}</StorefrontProviders>
        <Toaster />
      </body>
    </html>
  );
}
