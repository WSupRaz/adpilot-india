import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AdPilot India — Your AI Marketing Employee",
    template: "%s | AdPilot India",
  },
  description:
    "AI-powered marketing for Indian businesses. Describe your business in Hindi or English and get professional ad campaigns instantly.",
  keywords: ["google ads india", "meta ads india", "digital marketing ai", "ai marketing tool"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
