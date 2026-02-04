

# Integração do Google Agenda com JARVIS

## Visão Geral

Vamos integrar o Google Calendar ao seu assistente JARVIS, permitindo que você:
- Consulte seus próximos compromissos por voz ("O que tenho hoje?")
- Crie novos eventos ("Marca uma reunião amanhã às 14h")
- Verifique sua agenda semanal

## Como Funciona

O JARVIS poderá entender comandos de agenda e responder com informações do seu calendário.

**Exemplos de comandos:**
- "Quais são meus compromissos de hoje?"
- "Agenda uma reunião para amanhã às 15h"
- "O que tenho marcado essa semana?"

---

## Etapas de Implementação

### Etapa 1: Conectar Google Calendar

Primeiro, precisamos conectar sua conta Google ao projeto usando o conector do Google Calendar.

### Etapa 2: Criar Edge Function para Google Calendar

**Arquivo: `supabase/functions/google-calendar/index.ts`**

Uma nova função que:
- Lista eventos do calendário
- Cria novos eventos
- Busca eventos por período

```text
+------------------+     +-------------------+     +------------------+
|    JARVIS AI     | --> | google-calendar   | --> | Google Calendar  |
|  (entende voz)   |     |  (edge function)  |     |     API          |
+------------------+     +-------------------+     +------------------+
```

### Etapa 3: Atualizar o JARVIS para Usar Calendário

**Arquivo: `supabase/functions/jarvis-chat/index.ts`**

Modificar o sistema para:
1. Detectar intenções de calendário nas mensagens do usuário
2. Chamar a função google-calendar quando necessário
3. Formatar a resposta para leitura em voz

**Nova lógica no system prompt:**
```
Você agora tem acesso ao Google Calendar do usuário.
Quando o usuário perguntar sobre agenda, compromissos, reuniões, eventos:
- Use as funções de calendário disponíveis
- Responda de forma natural e amigável
```

### Etapa 4: Atualizar config.toml

**Arquivo: `supabase/config.toml`**

Adicionar a nova função.

---

## Funcionalidades Detalhadas

### Listar Eventos
- Parâmetros: data inicial, data final, quantidade máxima
- Resposta: lista formatada de eventos com hora e título

### Criar Evento
- Parâmetros: título, data/hora início, data/hora fim (opcional), descrição
- Resposta: confirmação do evento criado

### Verificar Disponibilidade
- Parâmetros: período desejado
- Resposta: slots livres e ocupados

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/google-calendar/index.ts` | Criar | Edge function para API do Google Calendar |
| `supabase/functions/jarvis-chat/index.ts` | Modificar | Adicionar detecção de intenção de calendário |
| `supabase/config.toml` | Modificar | Registrar nova função |

---

## Pré-requisito

Antes de implementar, precisarei conectar o Google Calendar ao seu projeto. Isso abrirá um fluxo de autenticação para você fazer login com sua conta Google.

## Resultado Final

Após a implementação, você poderá falar com JARVIS:
- **Você:** "O que tenho hoje?"
- **JARVIS:** "Você tem 3 compromissos hoje: Reunião de equipe às 10h, Almoço com cliente às 12h30, e Review do projeto às 15h."

