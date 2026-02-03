import { useCallback } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import ConversationHistory from "@/components/ConversationHistory";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

const Index = () => {
  const { state, transcript, response, error, isSupported, messages, startListening, stopListening, clearHistory } = useVoiceAssistant();

  const handleOrbPress = useCallback(() => {
    if (state === "idle") {
      startListening();
    } else if (state === "listening") {
      stopListening();
    }
  }, [state, startListening, stopListening]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Browser compatibility warning */}
      {!isSupported && (
        <div className="absolute top-4 left-4 right-4 bg-destructive/20 border border-destructive/40 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">
            Seu navegador não suporta reconhecimento de voz. Use Chrome, Safari ou Edge.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-destructive/20 border border-destructive/40 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Conversation History */}
      <ConversationHistory 
        messages={messages} 
        isVisible={messages.length > 0 && state === "idle"}
      />

      {/* Clear history button */}
      {messages.length > 0 && state === "idle" && (
        <button
          onClick={clearHistory}
          className="absolute top-20 right-4 z-20 px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground/60 hover:text-primary border border-muted/30 hover:border-primary/40 rounded-md transition-all duration-200 bg-black/50 backdrop-blur-sm"
        >
          Limpar
        </button>
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

        {/* Response display - what JARVIS is saying */}
        {state === "responding" && response && (
          <div 
            className="mb-8 max-w-md text-center animate-fade-in"
            style={{
              animation: "fadeIn 0.3s ease-in-out"
            }}
          >
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">JARVIS:</p>
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
          assistantName="JARVIS"
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
              ? "Processando..."
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
