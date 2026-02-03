import { useState, useCallback } from "react";
import type { VoiceState } from "@/components/VoiceOrb";

interface UseVoiceAssistantReturn {
  state: VoiceState;
  startListening: () => void;
  stopListening: () => void;
  simulateResponse: () => void;
}

export const useVoiceAssistant = (): UseVoiceAssistantReturn => {
  const [state, setState] = useState<VoiceState>("idle");

  const startListening = useCallback(() => {
    setState("listening");
  }, []);

  const stopListening = useCallback(() => {
    setState("processing");
    
    // Simulate processing time
    setTimeout(() => {
      setState("responding");
      
      // Simulate response time
      setTimeout(() => {
        setState("idle");
      }, 3000);
    }, 2000);
  }, []);

  const simulateResponse = useCallback(() => {
    setState("responding");
    
    setTimeout(() => {
      setState("idle");
    }, 3000);
  }, []);

  return {
    state,
    startListening,
    stopListening,
    simulateResponse,
  };
};
