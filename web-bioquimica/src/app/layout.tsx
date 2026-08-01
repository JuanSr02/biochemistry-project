import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/core/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioTools | Suite para Bioquímica",
  description: "Herramientas de laboratorio y estudio",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BioTools",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}