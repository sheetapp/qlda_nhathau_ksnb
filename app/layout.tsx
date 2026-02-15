import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Changed from Geist to Inter
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

// Initialize Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kiểm soát Nội bộ",
  description: "Hệ thống quản lý tài chính và kiểm soát nội bộ doanh nghiệp Xây dựng, Nội thất",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased font-sans`} // Applied Inter variable
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
