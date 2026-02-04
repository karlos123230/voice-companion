

# Efeitos Robóticos para o Estado "Responding" do JARVIS

## Visão Geral

Quando o JARVIS estiver respondendo, a interface terá movimentos e efeitos futurísticos inspirados em interfaces de ficção científica como Iron Man e Tron. O objetivo é criar uma sensação de IA avançada processando e comunicando informações.

---

## Efeitos Visuais Planejados

### 1. Anéis Concêntricos em Movimento
- **Anel externo**: Rotação lenta no sentido horário
- **Anel 2**: Rotação no sentido anti-horário com velocidade diferente
- **Anel 3**: Pulsação + rotação alternada
- **Anel interno**: Efeito de "scanner" com linha de luz girando

### 2. Orbe Central Pulsante
- Pulsação sincronizada com a fala (simulando respiração)
- Glow intenso que pulsa com ritmo diferente dos anéis
- Efeito de "holograma" com leve distorção

### 3. Partículas de Dados
- Pequenos pontos de luz circulando os anéis (simulando transferência de dados)
- Aparecem e desaparecem gradualmente

### 4. Efeito de Onda de Energia
- Ondas que emanam do centro para fora
- Simulam a voz sendo transmitida

### 5. Linha de Scanner
- Uma linha brilhante que gira dentro do orbe
- Efeito "radar" tecnológico

---

## Implementação Técnica

### Arquivo: `src/index.css`
Novas animações a serem adicionadas:

```css
/* Rotação suave para responding */
@keyframes jarvis-respond-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pulsação do orbe durante resposta */
@keyframes jarvis-respond-pulse {
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.03);
    filter: brightness(1.2);
  }
}

/* Efeito scanner linha girando */
@keyframes jarvis-scanner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ondas de energia emanando */
@keyframes jarvis-energy-wave {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
    border-width: 2px;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
    border-width: 1px;
  }
}

/* Partículas de dados circulando */
@keyframes jarvis-data-particle {
  0% {
    transform: rotate(0deg) translateX(60px) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% {
    transform: rotate(360deg) translateX(60px) rotate(-360deg);
    opacity: 0;
  }
}

/* Glow pulsante intenso */
@keyframes jarvis-respond-glow {
  0%, 100% {
    box-shadow: 
      0 0 40px hsl(185 100% 50% / 0.6),
      0 0 80px hsl(185 100% 50% / 0.4),
      inset 0 0 30px hsl(185 100% 50% / 0.2);
  }
  50% {
    box-shadow: 
      0 0 60px hsl(185 100% 50% / 0.8),
      0 0 120px hsl(185 100% 50% / 0.5),
      inset 0 0 50px hsl(185 100% 50% / 0.3);
  }
}

/* Efeito holograma/glitch sutil */
@keyframes jarvis-hologram {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
  95% { opacity: 0.9; }
  96% { opacity: 1; }
}
```

### Arquivo: `src/components/VoiceOrb.tsx`
Modificações no componente:

1. **Adicionar animações aos anéis quando `state === "responding"`**:
   - Ring 1: rotação lenta + efeito holograma
   - Ring 2: rotação anti-horária
   - Ring 3: rotação + pulsação
   - Ring 4: efeito scanner

2. **Novo componente `ScannerLine`**:
   - Linha brilhante que gira dentro do orbe
   - Cria efeito de radar/scanner

3. **Novo componente `EnergyWaves`**:
   - Múltiplas ondas concêntricas emanando do centro
   - Com delays diferentes para efeito cascata

4. **Novo componente `DataParticles`**:
   - Pequenos pontos brilhantes orbitando o orbe
   - Simula transferência de dados

5. **Atualizar o `AudioWaveform`**:
   - Mais barras (7 ao invés de 5)
   - Variação de altura mais dinâmica
   - Glow individual em cada barra

6. **Glow pulsante no orbe central**:
   - BoxShadow animado durante responding
   - Intensidade maior que no estado idle

---

## Resultado Visual Esperado

Quando o JARVIS responder, o usuário verá:
1. Todos os anéis girando em velocidades e direções diferentes
2. O orbe central pulsando com brilho intenso
3. Uma linha de scanner girando dentro do orbe
4. Ondas de energia emanando do centro
5. Pequenas partículas de dados orbitando
6. O waveform de áudio mais elaborado no centro

Isso criará uma experiência visual muito mais rica e tecnológica, transmitindo a sensação de uma IA avançada em plena atividade.

