"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare, Download } from "lucide-react";

// Interfaz para el evento de instalación en Chrome
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Verificar si ya está instalada o en standalone mode
    const isStandAlone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandAlone);

    if (isStandAlone) return;

    // Verificar si el usuario ya lo cerró
    const hasDismissed = localStorage.getItem("installPromptDismissed");
    if (hasDismissed) return;

    // Detectar dispositivo y navegador
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isMobile = isIOSDevice || isAndroidDevice;

    // Si no es móvil, no mostramos el banner según el requerimiento
    if (!isMobile) return;

    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Para iOS mostramos las instrucciones manuales
      setShowPrompt(true);
    }

    // Para Android (Chrome, etc) esperamos el evento nativo
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("installPromptDismissed", "true");
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] sm:left-auto sm:right-4 sm:w-96 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
              Instalar Aplicación
            </h3>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {isIOS ? (
                <div className="flex flex-col gap-3 mt-3">
                  <p>Instala BioTools en tu dispositivo para una mejor experiencia y modo sin conexión.</p>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold">1</span>
                    <span className="flex items-center gap-1 text-sm">
                      Toca <Share className="mx-1 h-4 w-4 text-blue-500" /> en Safari.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold">2</span>
                    <span className="flex items-center gap-1 text-sm">
                      Selecciona &quot;Agregar a inicio&quot; <PlusSquare className="mx-1 h-4 w-4 text-slate-500" />.
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-relaxed">
                  Agrega BioTools a tu pantalla de inicio para acceder rápidamente y disfrutar del modo sin conexión.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Cerrar aviso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {!isIOS && deferredPrompt && (
          <div className="mt-4">
            <button
              onClick={handleInstallClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Instalar ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
