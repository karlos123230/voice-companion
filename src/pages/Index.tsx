import { useRef, useCallback } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

const Index = () => {
  const { state, startListening, stopListening } = useVoiceAssistant();
  const isListeningRef = useRef(false);

  const handleOrbPress = useCallback(() => {
    if (state === "idle") {
      isListeningRef.current = true;
      startListening();
      
      // Simulate stopping after 3 seconds of listening
      setTimeout(() => {
        if (isListeningRef.current) {
          isListeningRef.current = false;
          stopListening();
        }
      }, 3000);
    } else if (state === "listening") {
      isListeningRef.current = false;
      stopListening();
    }
  }, [state, startListening, stopListening]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden relative">
      {/* Background ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, hsl(var(--jarvis-glow) / 0.05) 0%, transparent 60%)",
        }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Top label */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-primary/60 text-xs md:text-sm tracking-[0.3em] uppercase">
            Assistente de Voz
          </h1>
        </div>

        {/* Voice Orb */}
        <VoiceOrb 
          state={state} 
          onPress={handleOrbPress}
          assistantName="JARVIS"
        />

        {/* Bottom instructions */}
        <div className="mt-12 md:mt-16 text-center max-w-xs">
          <p className="text-muted-foreground/60 text-xs md:text-sm">
            {state === "listening" 
              ? "Fale agora ou toque novamente para parar"
              : state === "processing"
              ? "Analisando sua solicitação..."
              : state === "responding"
              ? "Reproduzindo resposta..."
              : "Pressione o círculo para começar"
            }
          </p>
        </div>
      </main>

      {/* Corner decorations - HUD style */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30" />
    </div>
  );
};

export default Index;
