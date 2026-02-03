import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download, Check, Share, Plus, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const { isInstallable, isInstalled, install, needsManualInstall } = usePWAInstall();
  const navigate = useNavigate();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/pwa-192x192.png"
            alt="JARVIS"
            className="w-24 h-24 rounded-2xl shadow-lg shadow-primary/30"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Instalar JARVIS</h1>
          <p className="text-muted-foreground">
            Tenha acesso rápido ao seu assistente virtual direto da tela inicial
          </p>
        </div>

        {isInstalled ? (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
            </div>
            <p className="text-lg font-medium text-foreground">
              JARVIS já está instalado!
            </p>
            <p className="text-sm text-muted-foreground">
              Você pode encontrar o app na sua tela inicial
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Abrir JARVIS
            </Button>
          </div>
        ) : needsManualInstall ? (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <p className="text-sm text-muted-foreground">
              No Safari/iOS, siga os passos abaixo:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">1. Toque em Compartilhar</p>
                  <p className="text-sm text-muted-foreground">
                    Encontre o ícone de compartilhar na barra do Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">2. Adicionar à Tela de Início</p>
                  <p className="text-sm text-muted-foreground">
                    Role para baixo e toque em "Adicionar à Tela de Início"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">3. Pronto!</p>
                  <p className="text-sm text-muted-foreground">
                    O JARVIS aparecerá na sua tela inicial
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : isInstallable ? (
          <div className="space-y-4">
            <Button
              onClick={handleInstall}
              size="lg"
              className="w-full gap-2 text-lg py-6"
            >
              <Download className="w-5 h-5" />
              Instalar Agora
            </Button>
            <p className="text-xs text-muted-foreground">
              Instalação rápida, sem necessidade de app store
            </p>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-xl p-6 space-y-4">
            <p className="text-muted-foreground">
              A instalação não está disponível neste momento.
            </p>
            <p className="text-sm text-muted-foreground">
              Tente abrir esta página no Chrome (Android) ou Safari (iOS)
            </p>
          </div>
        )}

        {/* Benefits */}
        <div className="pt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Benefícios do app:</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Acesso rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Tela cheia</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Modo offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Atualizações automáticas</span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-muted-foreground"
        >
          Continuar no navegador
        </Button>
      </div>
    </div>
  );
};

export default Install;
