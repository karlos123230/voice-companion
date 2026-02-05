import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VoiceOrb from "@/components/VoiceOrb";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useAuth } from "@/hooks/useAuth";
import { usePWAAutoUpdate } from "@/hooks/usePWAAutoUpdate";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { state, transcript, response, error, isSupported, startListening, stopListening } = useVoiceAssistant();
  
  // PWA auto-update
  usePWAAutoUpdate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleOrbPress = useCallback(() => {
    if (state === "idle") {
      startListening();
    } else if (state === "listening") {
      stopListening();
    }
  }, [state, startListening, stopListening]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário";

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div 
          className="text-primary text-xl"
          style={{
            textShadow: "0 0 20px hsl(185 100% 50% / 0.6)"
          }}
        >
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* User info and logout button */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-primary/30 rounded-md">
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">{userName}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground/60 hover:text-destructive border border-muted/30 hover:border-destructive/40 rounded-md transition-all duration-200 bg-black/50 backdrop-blur-sm"
        >
          <LogOut className="w-3 h-3" />
          Sair
        </button>
      </div>

      {/* Browser compatibility warning */}
      {!isSupported && (
        <div className="absolute top-16 left-4 right-4 bg-destructive/20 border border-destructive/40 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">
            Seu navegador não suporta reconhecimento de voz. Use Chrome, Safari ou Edge.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-16 left-4 right-4 bg-destructive/20 border border-destructive/40 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Transcript display - what user is saying */}
        {(state === "listening" || state === "processing") && transcript && (
          <div 
            className="mb-8 max-w-md text-center animate-fade-in"
            style={{
              animation: "fadeIn 0.3s ease-in-out"
            }}
          >
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Você disse:</p>
            <p 
              className="text-primary text-lg"
              style={{
                textShadow: "0 0 10px hsl(185 100% 50% / 0.4)"
              }}
            >
              "{transcript}"
            </p>
          </div>
        )}

        {/* Response display - what Valério is saying */}
        {state === "responding" && response && (
          <div 
            className="mb-8 max-w-md text-center animate-fade-in"
            style={{
              animation: "fadeIn 0.3s ease-in-out"
            }}
          >
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Valério:</p>
            <p 
              className="text-primary text-lg"
              style={{
                textShadow: "0 0 10px hsl(185 100% 50% / 0.4)"
              }}
            >
              "{response}"
            </p>
          </div>
        )}

        {/* Voice Orb */}
        <VoiceOrb 
          state={state} 
          onPress={handleOrbPress}
          assistantName="Valério"
        />

        {/* Bottom instruction - Stylized cyan text */}
        <div className="mt-20 md:mt-24 text-center">
          <p 
            className="text-primary text-xl md:text-2xl italic tracking-wide"
            style={{
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              textShadow: "0 0 20px hsl(185 100% 50% / 0.6), 0 0 40px hsl(185 100% 50% / 0.3)"
            }}
          >
            {state === "listening" 
              ? "Estou ouvindo..." 
              : state === "processing"
              ? "Pensando..."
              : state === "responding"
              ? "Respondendo..."
              : "Pressione o círculo para falar"}
          </p>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Index;
