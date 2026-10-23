import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/print.css";
import { ResumeProvider } from "@/store/resume-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Resume Maker",
  description: "Buat CV profesional 100% client-side",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ResumeProvider>{children}</ResumeProvider>
      </body>
    </html>
  );
}
