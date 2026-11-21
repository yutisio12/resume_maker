import type { Metadata } from "next";
import "./globals.css";
import "@/styles/print.css";
import { ResumeProvider } from "@/store/resume-context";
import { Toaster } from "@/components/ui/sonner";

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
      <body className="antialiased">
        <ResumeProvider>{children}<Toaster /></ResumeProvider>
      </body>
    </html>
  );
}
