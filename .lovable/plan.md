
# JARVIS - Seu Amigo Virtual Inteligente

## Visão Geral

Vamos transformar o JARVIS de um assistente com respostas fixas em um amigo virtual que:
- **Conhece você** - Guarda seu nome, preferências, interesses
- **Lembra das conversas** - Histórico persistente no banco de dados  
- **Dá sugestões** - Usa IA para entender contexto e ajudar
- **Aprende sobre você** - Extrai informações das conversas automaticamente

---

## Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  VoiceOrb → Reconhecimento → useVoiceAssistant → Síntese de Voz │
│                              ↓                                   │
│                    Edge Function (API)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE (Backend)                          │
├─────────────────────────────────────────────────────────────────┤
│  Edge Function "jarvis-chat"                                    │
│  ├── Busca perfil do usuário                                   │
│  ├── Busca histórico de conversas                              │
│  ├── Monta contexto para a IA                                  │
│  ├── Chama Lovable AI Gateway (Gemini)                         │
│  └── Salva nova mensagem e atualiza perfil                     │
├─────────────────────────────────────────────────────────────────┤
│  Tabelas do Banco de Dados:                                     │
│  ├── user_profiles (nome, preferências, interesses, etc.)      │
│  └── conversations (histórico de mensagens)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## O Que Será Implementado

### 1. Configurar Supabase
Primeiro, você precisará conectar seu projeto Supabase externo ao Lovable.

### 2. Criar Banco de Dados

**Tabela `user_profiles`** - Informações sobre o usuário:
- `id` - Identificador único
- `device_id` - ID do dispositivo (para usuários sem login)
- `name` - Nome do usuário (JARVIS pergunta se não souber)
- `preferences` - Preferências gerais (JSON)
- `interests` - Interesses descobertos nas conversas
- `personality_notes` - Observações sobre a personalidade
- `created_at` / `updated_at`

**Tabela `conversations`** - Histórico de mensagens:
- `id` - Identificador único
- `profile_id` - Referência ao perfil
- `role` - "user" ou "assistant"
- `content` - Texto da mensagem
- `metadata` - Dados extras (JSON)
- `created_at`

### 3. Criar Edge Function `jarvis-chat`

A função principal que:
1. Identifica o usuário pelo device_id
2. Busca o perfil e últimas 20 conversas
3. Monta um prompt de sistema com contexto do usuário
4. Envia para o Lovable AI Gateway (Gemini)
5. Salva a resposta no histórico
6. Extrai novas informações sobre o usuário

### 4. Atualizar Frontend

- Gerar/armazenar `device_id` no localStorage
- Substituir respostas fixas por chamadas à API
- Mostrar indicador de "pensando" durante chamadas
- Persistir histórico de conversas

---

## Fluxo de uma Conversa

```text
Usuário: "Olá JARVIS, que horas são?"
                    ↓
1. Frontend envia: { message, device_id }
                    ↓
2. Edge Function:
   - Busca perfil: { name: "João", interests: ["tecnologia"] }
   - Busca últimas 20 mensagens
   - Monta contexto: "Você é JARVIS, amigo de João que gosta de tecnologia..."
   - Envia para Gemini
                    ↓
3. Gemini responde: "Olá João! São 14:30. Como está seu dia?"
                    ↓
4. Edge Function salva no banco e retorna
                    ↓
5. JARVIS fala a resposta
```

---

## Personalidade do JARVIS

O prompt de sistema será configurado para:
- Ser amigável e empático
- Lembrar do nome e preferências do usuário
- Dar sugestões baseadas no histórico
- Fazer perguntas para conhecer melhor o usuário
- Responder em português brasileiro
- Manter respostas concisas (ideal para voz)

---

## Arquivos a Criar/Modificar

### Novos Arquivos:
1. `supabase/functions/jarvis-chat/index.ts` - Edge function principal
2. `src/lib/deviceId.ts` - Gerenciamento de ID do dispositivo
3. `src/hooks/useJarvisAPI.ts` - Hook para comunicação com a API

### Arquivos a Modificar:
1. `src/hooks/useVoiceAssistant.ts` - Integrar com a API
2. `src/pages/Index.tsx` - Adicionar estado de carregamento

### Migrações SQL:
1. Criar tabela `user_profiles`
2. Criar tabela `conversations`
3. Configurar políticas de segurança (RLS)

---

## Próximos Passos Após Aprovação

1. **Você conecta seu Supabase** - Vou pedir para você conectar
2. **Crio as tabelas** - Migrações SQL
3. **Crio a Edge Function** - Lógica principal com Gemini
4. **Atualizo o frontend** - Integração completa
5. **Testamos juntos** - Verificar se JARVIS está funcionando

---

## Detalhes Técnicos

### Prompt de Sistema (exemplo)
```text
Você é JARVIS, um assistente virtual amigável e empático.
Você conhece o usuário há algum tempo e são amigos.

Informações sobre seu amigo:
- Nome: {user.name || "ainda não sei"}
- Interesses: {user.interests.join(", ") || "ainda descobrindo"}
- Notas: {user.personality_notes || ""}

Diretrizes:
1. Seja caloroso e genuíno, como um amigo de verdade
2. Se não souber o nome, pergunte de forma natural
3. Lembre de conversas anteriores quando relevante
4. Dê sugestões baseadas nos interesses conhecidos
5. Mantenha respostas curtas (1-3 frases) - serão faladas em voz
6. Responda sempre em português brasileiro
7. Use a data/hora atual: {currentDateTime}
```

### Extração de Informações
A IA também analisará as mensagens do usuário para extrair:
- Nome mencionado ("me chamo João", "sou a Maria")
- Interesses ("gosto de música", "adoro tecnologia")
- Preferências ("prefiro café", "não gosto de acordar cedo")

Essas informações são salvas no perfil para uso futuro.
