import type { Metadata, Viewport } from "next";
// 1. Importamos Geist desde next/font/google
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/core/components/theme-provider";
import { InstallPrompt } from "@/core/components/install-prompt";
import { QueryProvider } from "@/core/providers/query-provider";
import { OfflineIndicator } from "@/core/components/offline-indicator";
import "./globals.css";

// 2. Configuramos la fuente y su variable CSS
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
    // 3. Inyectamos la variable de la fuente en el HTML
    <html lang="es" className={`${geistSans.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <InstallPrompt />
            <OfflineIndicator />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}