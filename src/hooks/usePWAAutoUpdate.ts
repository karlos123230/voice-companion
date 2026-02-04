import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

export const usePWAAutoUpdate = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log("[PWA] Service Worker registrado:", swUrl);
      
      if (registration) {
        // Verificar a cada 30 segundos
        setInterval(() => {
          console.log("[PWA] Verificando atualizacoes...");
          registration.update();
        }, 30 * 1000);

        // Verificar quando voltar para a aba
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            console.log("[PWA] Aba visivel, verificando atualizacoes...");
            registration.update();
          }
        });

        // Verificar quando reconectar na internet
        window.addEventListener("online", () => {
          console.log("[PWA] Online, verificando atualizacoes...");
          registration.update();
        });
      }
    },
    onRegisterError(error) {
      console.error("[PWA] Erro ao registrar SW:", error);
    },
  });

  // Auto-update imediato quando nova versao disponivel
  useEffect(() => {
    if (needRefresh) {
      console.log("[PWA] Nova versao disponivel, atualizando...");
      toast.info("Atualizando JARVIS...", { duration: 1500 });
      setTimeout(() => {
        updateServiceWorker(true);
      }, 1000);
    }
  }, [needRefresh, updateServiceWorker]);

  return { needRefresh };
};
