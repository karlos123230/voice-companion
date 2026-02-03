
# Plano: Transformar JARVIS em PWA

## Visão Geral

Vou transformar o JARVIS em um Progressive Web App (PWA) completo, permitindo que os usuários instalem o app diretamente do navegador no celular ou desktop, com funcionamento offline e experiência nativa.

## O que será feito

### 1. Instalar Plugin PWA para Vite
- Adicionar `vite-plugin-pwa` como dependência
- Configurar o plugin no `vite.config.ts`

### 2. Configurar o Manifest
O manifest define como o app aparece quando instalado:
- Nome: "JARVIS - Seu Assistente Virtual"
- Ícones em múltiplos tamanhos (192x192, 512x512)
- Cores da marca (fundo preto, tema cyan)
- Modo "standalone" (sem barra do navegador)
- Orientação vertical

### 3. Criar Ícones PWA
- Gerar ícones nos tamanhos necessários usando o favicon existente
- `pwa-192x192.png` - ícone padrão
- `pwa-512x512.png` - ícone para splash screen
- `pwa-maskable-192x192.png` - ícone adaptativo para Android

### 4. Configurar Service Worker
- Estratégia de cache para funcionamento offline
- Precache de assets estáticos (HTML, CSS, JS)
- Runtime caching para fontes e imagens

### 5. Atualizar Meta Tags
Adicionar no `index.html`:
- `apple-touch-icon` para iOS
- `theme-color` para a barra do navegador
- `apple-mobile-web-app-capable` para modo fullscreen no iOS

### 6. Criar Página de Instalação (Opcional)
- Página `/install` com instruções para instalar o app
- Botão que aciona o prompt de instalação nativo

---

## Detalhes Técnicos

### Configuração do vite.config.ts

```typescript
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
  manifest: {
    name: 'JARVIS - Seu Assistente Virtual',
    short_name: 'JARVIS',
    description: 'Seu amigo virtual inteligente',
    theme_color: '#00d4ff',
    background_color: '#000000',
    display: 'standalone',
    orientation: 'portrait',
    icons: [...]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}']
  }
})
```

### Arquivos que serão criados/editados

| Arquivo | Ação |
|---------|------|
| `package.json` | Adicionar vite-plugin-pwa |
| `vite.config.ts` | Configurar plugin PWA |
| `index.html` | Adicionar meta tags mobile |
| `public/pwa-192x192.png` | Criar ícone |
| `public/pwa-512x512.png` | Criar ícone |
| `public/pwa-maskable-192x192.png` | Criar ícone maskable |
| `src/hooks/usePWAInstall.ts` | Hook para gerenciar instalação |
| `src/pages/Install.tsx` | Página de instalação |
| `src/App.tsx` | Adicionar rota /install |

### Resultado Final

Após a implementação, os usuários poderão:
- Instalar o JARVIS na tela inicial do celular
- Usar o app em modo fullscreen (sem barra do navegador)
- Acessar mesmo offline (com funcionalidades limitadas)
- Receber atualizações automáticas do app
