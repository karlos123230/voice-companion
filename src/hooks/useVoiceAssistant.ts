import { useState, useCallback, useEffect, useRef } from "react";
import type { VoiceState } from "@/components/VoiceOrb";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";

interface UseVoiceAssistantReturn {
  state: VoiceState;
  transcript: string;
  response: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

// Generate JARVIS response based on user input
// PRIORITY: Specific questions first, then greetings
const generateResponse = (input: string): string => {
  const text = input.toLowerCase().trim();
  
  if (!text) {
    return "Não consegui ouvir. Pode repetir, por favor?";
  }
  
  // PRIORITY 1: Time (most specific)
  if (text.includes("hora") || text.includes("horas") || text.includes("que horas")) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `São ${hours} horas e ${minutes} minutos.`;
  }
  
  // PRIORITY 2: Date (specific)
  if (text.includes("data") || text.includes("dia") || text.includes("que dia")) {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('pt-BR', options);
    return `Hoje é ${dateStr}.`;
  }
  
  // PRIORITY 3: Who are you (specific)
  if (text.includes("quem é você") || text.includes("quem e voce") || text.includes("seu nome") || text.includes("você é")) {
    return "Eu sou JARVIS, seu assistente virtual. Estou aqui para ajudar você!";
  }
  
  // PRIORITY 4: Help (specific)
  if (text.includes("ajuda") || text.includes("ajudar") || text.includes("o que você faz")) {
    return "Posso informar a hora, a data, responder a saudações e manter uma conversa básica. Em breve terei mais capacidades!";
  }
  
  // PRIORITY 5: Weather (placeholder)
  if (text.includes("tempo") || text.includes("clima") || text.includes("previsão")) {
    return "Desculpe, ainda não tenho acesso às informações meteorológicas. Mas posso ajudar com outras coisas!";
  }
  
  // PRIORITY 6: Greetings (generic - checked AFTER specific questions)
  if (text.includes("olá") || text.includes("ola") || text.includes("oi") || text.includes("bom dia") || text.includes("boa tarde") || text.includes("boa noite")) {
    return "Olá! Como posso ajudar você hoje?";
  }
  
  // PRIORITY 7: Thank you
  if (text.includes("obrigado") || text.includes("obrigada") || text.includes("valeu")) {
    return "Por nada! Estou sempre à disposição.";
  }
  
  // Default response
  return "Interessante! Ainda estou aprendendo. Pode me perguntar sobre a hora, data, ou apenas conversar comigo.";
};

export const useVoiceAssistant = (): UseVoiceAssistantReturn => {
  const [state, setState] = useState<VoiceState>("idle");
  const [response, setResponse] = useState("");
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef("");
  
  const {
    isListening,
    transcript,
    interimTranscript,
    error: recognitionError,
    isSupported: recognitionSupported,
    startListening: startRecognition,
    stopListening: stopRecognition,
  } = useSpeechRecognition();
  
  const {
    isSpeaking,
    isSupported: synthesisSupported,
    speak,
    activate: activateSynthesis,
  } = useSpeechSynthesis();

  const isSupported = recognitionSupported && synthesisSupported;

  // Handle speech synthesis completion
  useEffect(() => {
    if (state === "responding" && !isSpeaking) {
      setState("idle");
    }
  }, [isSpeaking, state]);

  // Process and respond to user input
  const processAndRespond = useCallback((text: string) => {
    if (!text.trim()) {
      setState("idle");
      return;
    }
    
    setState("processing");
    
    // Generate response immediately (no delay)
    const responseText = generateResponse(text);
    setResponse(responseText);
    setState("responding");
    
    console.log("[JARVIS] Calling speak with:", responseText);
    speak(responseText);
  }, [speak]);

  // Auto-detect silence and process speech
  useEffect(() => {
    if (!isListening) return;

    const currentText = transcript + interimTranscript;
    
    // Clear existing timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    // If we have text, set a timeout for silence detection
    if (currentText.length > 0) {
      lastTranscriptRef.current = currentText;
      
      silenceTimeoutRef.current = setTimeout(() => {
        // User stopped speaking - process the input
        stopRecognition();
        processAndRespond(lastTranscriptRef.current);
      }, 1500); // 1.5 seconds of silence
    }
    
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isListening, transcript, interimTranscript, stopRecognition, processAndRespond]);

  const startListening = useCallback(() => {
    // Activate speech synthesis on first interaction (iOS workaround)
    activateSynthesis();
    
    setResponse("");
    lastTranscriptRef.current = "";
    setState("listening");
    startRecognition();
  }, [startRecognition, activateSynthesis]);

  const stopListening = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    stopRecognition();
    
    const textToProcess = lastTranscriptRef.current || transcript;
    processAndRespond(textToProcess);
  }, [stopRecognition, transcript, processAndRespond]);

  return {
    state,
    transcript: transcript + interimTranscript,
    response,
    error: recognitionError,
    isSupported,
    startListening,
    stopListening,
  };
};
