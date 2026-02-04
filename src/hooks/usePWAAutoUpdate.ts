import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

export const usePWAAutoUpdate = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log("[PWA] Service Worker registrado:", swUrl);
      
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          console.log("[PWA] Verificando atualizações...");
          registration.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("[PWA] Erro ao registrar SW:", error);
    },
  });

  // Auto-update when new version is available
  useEffect(() => {
    if (needRefresh) {
      console.log("[PWA] Nova versão disponível, atualizando...");
      
      toast.info("Atualizando JARVIS...", {
        duration: 2000,
      });
      
      // Small delay to show the toast, then update
      setTimeout(() => {
        updateServiceWorker(true);
      }, 1500);
    }
  }, [needRefresh, updateServiceWorker]);

  return { needRefresh };
};
