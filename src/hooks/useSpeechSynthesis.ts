import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  cancel: () => void;
  activate: () => void;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const hasActivatedRef = useRef(false);
  
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Find the best Portuguese voice
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      // Try to find a Portuguese Brazilian voice first
      let ptVoice = voices.find(
        (voice) => voice.lang === "pt-BR" && voice.localService
      );
      
      // Fall back to any Portuguese voice
      if (!ptVoice) {
        ptVoice = voices.find((voice) => voice.lang.startsWith("pt"));
      }
      
      // Fall back to any available voice
      if (!ptVoice && voices.length > 0) {
        ptVoice = voices[0];
      }
      
      voiceRef.current = ptVoice || null;
    };

    // Load voices immediately if available
    loadVoices();
    
    // Chrome loads voices asynchronously
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Activate speech synthesis on first user interaction (iOS workaround)
  const activateSpeechSynthesis = useCallback(() => {
    if (hasActivatedRef.current || !isSupported) return;
    
    // Create a silent utterance to "unlock" audio on iOS
    const silentUtterance = new SpeechSynthesisUtterance("");
    silentUtterance.volume = 0;
    speechSynthesis.speak(silentUtterance);
    speechSynthesis.cancel();
    hasActivatedRef.current = true;
    console.log("[JARVIS] Speech synthesis activated");
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) {
      console.log("[JARVIS] Speech synthesis not supported or empty text");
      return;
    }

    console.log("[JARVIS] Starting speech:", text);

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Small delay to ensure cancel is processed
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;

      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
        console.log("[JARVIS] Using voice:", voiceRef.current.name);
      } else {
        console.log("[JARVIS] No Portuguese voice found, using default");
      }

      // Safety timeout - reset isSpeaking if onend never fires (common on iOS)
      let safetyTimeout: NodeJS.Timeout | null = null;
      const estimatedDuration = Math.max(3000, text.length * 80);

      utterance.onstart = () => {
        console.log("[JARVIS] Speech started");
        setIsSpeaking(true);
        
        safetyTimeout = setTimeout(() => {
          console.log("[JARVIS] Safety timeout - forcing isSpeaking to false");
          setIsSpeaking(false);
        }, estimatedDuration);
      };

      utterance.onend = () => {
        console.log("[JARVIS] Speech ended");
        if (safetyTimeout) clearTimeout(safetyTimeout);
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error("[JARVIS] Speech error:", event.error);
        if (safetyTimeout) clearTimeout(safetyTimeout);
        setIsSpeaking(false);
      };

      // Workaround for Chrome bug - resume if paused
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }

      speechSynthesis.speak(utterance);
      
      // Force start on some browsers
      console.log("[JARVIS] Utterance queued, pending:", speechSynthesis.pending, "speaking:", speechSynthesis.speaking);
    }, 50);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    cancel,
    activate: activateSpeechSynthesis,
  };
};
