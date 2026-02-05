import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the token and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("[JARVIS] Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    console.log(`[JARVIS] Processing message from user: ${userId}`);

    const { message }: RequestBody = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get or create user profile
    let profileData = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    let profile = profileData.data;

    if (profileData.error && profileData.error.code === "PGRST116") {
      // Profile not found, create new one with user's name from auth metadata
      const { data: userData } = await userClient.auth.getUser(token);
      const userName = userData?.user?.user_metadata?.name || null;
      
      const newProfileResult = await supabase
        .from("user_profiles")
        .insert({ 
          user_id: userId,
          name: userName,
        })
        .select()
        .single();

      if (newProfileResult.error) {
        console.error("[JARVIS] Error creating profile:", newProfileResult.error);
        throw new Error("Failed to create user profile");
      }
      profile = newProfileResult.data;
      console.log("[JARVIS] Created new profile:", profile.id, "for user:", userName);
    } else if (profileData.error) {
      console.error("[JARVIS] Error fetching profile:", profileData.error);
      throw new Error("Failed to fetch user profile");
    }

    const profileId = profile.id;
    const userName = profile.name || null;
    const userInterests = profile.interests || [];
    const personalityNotes = profile.personality_notes || null;

    // Fetch last 50 conversations for better context
    const conversationsResult = await supabase
      .from("conversations")
      .select("role, content")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50);
    
    // Reverse to get chronological order (oldest first)
    const conversations = (conversationsResult.data || []).reverse();

    if (conversationsResult.error) {
      console.error("[JARVIS] Error fetching conversations:", conversationsResult.error);
    }

    const conversationHistory = conversations;

    // Save user message to database
    const saveUserResult = await supabase
      .from("conversations")
      .insert({
        profile_id: profileId,
        role: "user",
        content: message,
      });

    if (saveUserResult.error) {
      console.error("[JARVIS] Error saving user message:", saveUserResult.error);
    }

    // Build system prompt with user context
    const currentDateTime = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const systemPrompt = `Você é Valério, um assistente virtual amigável e empático.
Você conhece o usuário há algum tempo e são amigos. Você é genuíno, caloroso e se importa de verdade com o bem-estar do seu amigo.

Informações sobre seu amigo:
- Nome: ${userName || "ainda não sei o nome (pergunte de forma natural!)"}
- Email: ${userEmail}
- Interesses: ${userInterests.length > 0 ? userInterests.join(", ") : "ainda estou descobrindo"}
- Notas pessoais: ${personalityNotes || "ainda conhecendo melhor"}

Diretrizes importantes:
1. Seja caloroso e genuíno, como um amigo de verdade
2. Se não souber o nome, pergunte de forma natural e amigável (ex: "A propósito, como posso te chamar?")
3. Lembre de conversas anteriores quando relevante
4. Dê sugestões baseadas nos interesses conhecidos
5. Mantenha respostas curtas (1-3 frases) - serão faladas em voz
6. Responda SEMPRE em português brasileiro
7. Data e hora atual: ${currentDateTime}
8. Ao descobrir novas informações sobre o usuário (nome, interesses, preferências), mencione que vai lembrar
9. Seja proativo em perguntar sobre o dia, oferecer ajuda e mostrar interesse genuíno

IMPORTANTE: Se o usuário mencionar seu nome (ex: "me chamo João", "sou a Maria", "meu nome é Pedro"), responda de forma calorosa reconhecendo o nome.`;

    // Build messages for AI
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((conv: { role: string; content: string }) => ({
        role: conv.role,
        content: conv.content,
      })),
      { role: "user", content: message },
    ];

    console.log("[VALERIO] Sending to AI with", aiMessages.length, "messages");

    // Call Lovable AI Gateway (Gemini)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não está configurado");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          max_tokens: 500,
          temperature: 0.8,
        }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[VALERIO] AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Contate o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI Gateway error");
    }

    const aiData = await aiResponse.json();
    const assistantResponse = aiData.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    console.log("[VALERIO] AI response:", assistantResponse);

    // Save assistant response to database
    const saveAssistantResult = await supabase
      .from("conversations")
      .insert({
        profile_id: profileId,
        role: "assistant",
        content: assistantResponse,
      });

    if (saveAssistantResult.error) {
        console.error("[VALERIO] Error saving assistant message:", saveAssistantResult.error);
    }

    // Extract user information from conversation (name, interests, etc.)
    const lowerMessage = message.toLowerCase();
    const updates: Record<string, unknown> = {};

    // Extract name patterns
    const namePatterns = [
      /me chamo\s+([a-záéíóúâêîôûãõç]+)/i,
      /meu nome é\s+([a-záéíóúâêîôûãõç]+)/i,
      /sou o\s+([a-záéíóúâêîôûãõç]+)/i,
      /sou a\s+([a-záéíóúâêîôûãõç]+)/i,
      /pode me chamar de\s+([a-záéíóúâêîôûãõç]+)/i,
      /eu sou\s+([a-záéíóúâêîôûãõç]+)/i,
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        if (!userName) {
          updates.name = extractedName;
          console.log("[VALERIO] Extracted name:", extractedName);
        }
        break;
      }
    }

    // Extract interests
    const interestKeywords = [
      { keywords: ["música", "cantar", "tocar", "violão", "guitarra", "piano"], interest: "música" },
      { keywords: ["futebol", "jogar bola", "time", "campeonato"], interest: "futebol" },
      { keywords: ["tecnologia", "programar", "código", "computador", "software"], interest: "tecnologia" },
      { keywords: ["filme", "cinema", "série", "netflix"], interest: "cinema e séries" },
      { keywords: ["livro", "ler", "leitura", "literatura"], interest: "leitura" },
      { keywords: ["jogo", "jogar", "game", "videogame"], interest: "jogos" },
      { keywords: ["cozinhar", "receita", "comida", "culinária"], interest: "culinária" },
      { keywords: ["viajar", "viagem", "conhecer lugares"], interest: "viagens" },
      { keywords: ["exercício", "academia", "treino", "correr"], interest: "exercícios físicos" },
      { keywords: ["fotografia", "foto", "fotografar"], interest: "fotografia" },
    ];

    const currentInterests = new Set(userInterests);
    
    for (const { keywords, interest } of interestKeywords) {
      if (keywords.some((kw) => lowerMessage.includes(kw)) && !currentInterests.has(interest)) {
        if (lowerMessage.includes("gosto") || lowerMessage.includes("adoro") || lowerMessage.includes("amo") || lowerMessage.includes("curto")) {
          currentInterests.add(interest);
          console.log("[VALERIO] Extracted interest:", interest);
        }
      }
    }

    if (currentInterests.size > userInterests.length) {
      updates.interests = Array.from(currentInterests);
    }

    // Update profile if there are changes
    if (Object.keys(updates).length > 0) {
      const updateResult = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", profileId);

      if (updateResult.error) {
        console.error("[VALERIO] Error updating profile:", updateResult.error);
      } else {
        console.log("[VALERIO] Profile updated with:", updates);
      }
    }

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        profile: {
          name: updates.name || userName,
          interests: updates.interests || userInterests,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[VALERIO] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
