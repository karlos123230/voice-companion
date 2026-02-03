import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface JarvisResponse {
  response: string;
  profile?: {
    name: string | null;
    interests: string[];
  };
}

interface UseJarvisAPIReturn {
  sendMessage: (message: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  userProfile: {
    name: string | null;
    interests: string[];
  } | null;
}

export const useJarvisAPI = (): UseJarvisAPIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string | null;
    interests: string[];
  } | null>(null);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar logado para conversar com o JARVIS");
      }

      console.log("[JARVIS API] Sending message:", message);
      
      const { data, error: functionError } = await supabase.functions.invoke<JarvisResponse>(
        "jarvis-chat",
        {
          body: { message },
        }
      );

      if (functionError) {
        console.error("[JARVIS API] Function error:", functionError);
        throw new Error(functionError.message || "Erro ao comunicar com JARVIS");
      }

      if (!data) {
        throw new Error("Resposta vazia do servidor");
      }

      // Update local profile cache
      if (data.profile) {
        setUserProfile(data.profile);
      }

      console.log("[JARVIS API] Response:", data.response);
      return data.response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("[JARVIS API] Error:", errorMessage);
      setError(errorMessage);
      
      // Return a fallback response
      return "Desculpe, estou tendo dificuldades para processar sua mensagem. Pode tentar novamente?";
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    userProfile,
  };
};
