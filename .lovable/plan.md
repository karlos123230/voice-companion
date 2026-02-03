


# Implementacao de Audio com Web Speech API

Vou adicionar interacao de voz real ao JARVIS usando a Web Speech API nativa do navegador - reconhecimento de fala (Speech Recognition) e sintese de voz (Speech Synthesis).

---

## Como vai funcionar

1. **Usuario toca no orbe** - O app comeca a ouvir
2. **Usuario fala** - O texto e capturado em tempo real
3. **Usuario para de falar** - O app processa e responde
4. **JARVIS fala** - A resposta e lida em voz alta

---

## Arquivos a criar/modificar

### 1. Novo Hook: `useSpeechRecognition.ts`
Gerencia o reconhecimento de fala com a Web Speech API:
- Detecta automaticamente quando o usuario para de falar
- Suporta portugues brasileiro (pt-BR)
- Trata erros de permissao de microfone

### 2. Novo Hook: `useSpeechSynthesis.ts`
Gerencia a sintese de voz (text-to-speech):
- Seleciona voz em portugues automaticamente
- Controla volume, velocidade e tom
- Detecta quando termina de falar

### 3. Atualizar: `useVoiceAssistant.ts`
Integra os dois hooks e gerencia o fluxo completo:
- Inicia gravacao ao pressionar
- Processa o texto reconhecido
- Gera resposta (inicialmente simples, preparado para IA)
- Fala a resposta

### 4. Atualizar: `Index.tsx`
- Mostra o texto transcrito em tempo real
- Mostra a resposta do assistente
- Feedback visual de permissao de microfone

---

## Fluxo de Estados

```text
[idle] --> usuario clica --> [listening]
                                  |
                         usuario fala...
                                  |
                         para de falar
                                  |
                             [processing]
                                  |
                          gera resposta
                                  |
                            [responding]
                                  |
                         JARVIS fala resposta
                                  |
                         termina de falar
                                  |
                               [idle]
```

---

## Respostas do JARVIS

Inicialmente, o JARVIS vai responder com frases pre-definidas inteligentes baseadas em palavras-chave:
- "Ola" -> "Ola! Como posso ajudar?"
- "Hora" -> Diz a hora atual
- "Data" -> Diz a data atual
- Outras -> "Desculpe, ainda estou aprendendo. Pode repetir?"

Isso fica preparado para futura integracao com IA.

---

## Compatibilidade

A Web Speech API funciona em:
- Chrome (desktop e Android)
- Safari (macOS e iOS)
- Edge

Nota: Firefox tem suporte limitado. Vou adicionar deteccao e mensagem amigavel.

---

## Secao Tecnica

### Speech Recognition
```typescript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'pt-BR';
recognition.continuous = true;
recognition.interimResults = true;
```

### Speech Synthesis
```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'pt-BR';
utterance.rate = 1.0;
speechSynthesis.speak(utterance);
```

### Selecao de Voz Portuguesa
O sistema vai buscar vozes em portugues disponiveis e selecionar automaticamente a melhor opcao.
