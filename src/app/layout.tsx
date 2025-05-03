import type { Metadata } from "next";
import { Header } from "@/components/header"
import { Providers } from "./providers"
import "./globals.css";

export const metadata: Metadata = {
  title: "Urban Issue Tracker",
  description: "A website to track what's happening in the neighborhood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased dark">
                <Providers>
                    <div className="flex min-h-svh flex-col">
                        <Header />
                        {children}
                    </div>
                </Providers>
            </body>
    </html>
  );
}
