import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./collaboration.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | CollabDocs",
    default: "CollabDocs | Real-Time Collaborative Text Editor",
  },
  description: "A modern, high-performance collaborative text editor designed for speed, simplicity, and seamless teamwork. Built with Next.js, TipTap, and Yjs.",
  keywords: ["collaborative editor", "real-time editing", "nextjs", "tiptap", "yjs", "shared documents"],
  authors: [{ name: "CollabDocs Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://collabdocs.app",
    title: "CollabDocs | Real-Time Collaborative Text Editor",
    description: "Experience lightning fast synchronization of your changes across all devices.",
    siteName: "CollabDocs",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider delay={0}>
              {children}
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
