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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Voice Orb */}
        <VoiceOrb 
          state={state} 
          onPress={handleOrbPress}
          assistantName="JARVIS"
        />

        {/* Bottom instruction - Large cyan text */}
        <div className="mt-16 md:mt-20 text-center">
          <p className="text-primary text-lg md:text-xl tracking-wide">
            Pressione o círculo para falar
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
