import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "@objectifthunes/react-three-pop-up-book — API reference & live demo",
  description:
    "Live, source-paired reference for @objectifthunes/react-three-pop-up-book — React hooks for 3D pop-up books in React Three Fiber.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
