import { useState, useCallback, useEffect, useRef } from "react";
import type { VoiceState } from "@/components/VoiceOrb";
import type { Message } from "@/components/ConversationHistory";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useJarvisAPI } from "./useJarvisAPI";
import { useSoundEffects } from "./useSoundEffects";

interface UseVoiceAssistantReturn {
  state: VoiceState;
  transcript: string;
  response: string;
  error: string | null;
  isSupported: boolean;
  messages: Message[];
  startListening: () => void;
  stopListening: () => void;
  clearHistory: () => void;
}

export const useVoiceAssistant = (): UseVoiceAssistantReturn => {
  const [state, setState] = useState<VoiceState>("idle");
  const [response, setResponse] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
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

  const { sendMessage, isLoading, error: apiError } = useJarvisAPI();
  const { playProcessingSound, playResponseSound, vibrateProcessing, vibrateResponse } = useSoundEffects();

  const isSupported = recognitionSupported && synthesisSupported;

  // Handle speech synthesis completion
  useEffect(() => {
    if (state === "responding" && !isSpeaking) {
      setState("idle");
    }
  }, [isSpeaking, state]);

  // Add message to history
  const addMessage = useCallback((type: "user" | "assistant", text: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  // Process and respond to user input using AI
  const processAndRespond = useCallback(async (text: string) => {
    if (!text.trim()) {
      setState("idle");
      return;
    }
    
    // Add user message to history
    addMessage("user", text.trim());
    
    setState("processing");
    playProcessingSound(); // Play sound when processing starts
    vibrateProcessing(); // Haptic feedback on mobile
    
    try {
      // Call the AI API
      const responseText = await sendMessage(text.trim());
      setResponse(responseText);
      
      // Add assistant message to history
      addMessage("assistant", responseText);
      
      setState("responding");
      playResponseSound(); // Play sound when response is ready
      vibrateResponse(); // Haptic feedback on mobile
      
      console.log("[JARVIS] Speaking response:", responseText);
      speak(responseText);
    } catch (error) {
      console.error("[JARVIS] Error processing message:", error);
      const fallbackResponse = "Desculpe, tive um problema. Pode repetir?";
      setResponse(fallbackResponse);
      addMessage("assistant", fallbackResponse);
      setState("responding");
      speak(fallbackResponse);
    }
  }, [sendMessage, speak, addMessage]);

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

  // Combine errors
  const error = recognitionError || apiError;

  return {
    state,
    transcript: transcript + interimTranscript,
    response,
    error,
    isSupported,
    messages,
    startListening,
    stopListening,
    clearHistory,
  };
};
