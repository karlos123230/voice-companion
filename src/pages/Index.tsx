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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4">
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
            Pressione o círculo para falar
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
