

# Limpeza de Cache para Manter o App Sempre Atualizado

## Problema Identificado

Atualmente, o PWA pode manter versoes antigas em cache, causando:
- Usuarios vendo versao desatualizada apos deploy
- Necessidade de limpar cache manualmente
- Confusao entre o que foi publicado e o que aparece na tela

## Solucao

Vamos implementar uma estrategia agressiva de atualizacao automatica que garante que o app sempre carregue a versao mais recente.

---

## Mudancas a Implementar

### 1. Configurar Vercel para Nao Cachear HTML e Assets Dinamicos

**Arquivo: `vercel.json`**

Adicionar headers para controlar cache:
- HTML: sem cache (sempre busca a versao nova)
- JS/CSS: cache curto com revalidacao
- Fontes e imagens estaticas: cache longo (ok manter)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*).html",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    },
    {
      "source": "/",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 2. Ajustar Workbox para Estrategia NetworkFirst nos Assets Principais

**Arquivo: `vite.config.ts`**

Modificar a configuracao do VitePWA para:
- Usar `skipWaiting: true` - ativa a nova versao imediatamente
- Usar `clientsClaim: true` - assume controle de todas as abas
- Reduzir cache de navigation requests
- Usar NetworkFirst para arquivos criticos

```typescript
VitePWA({
  registerType: "autoUpdate",
  // ... manifest existente ...
  workbox: {
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
    navigateFallback: "/index.html",
    navigateFallbackDenylist: [/^\/api/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api",
          expiration: { maxAgeSeconds: 60 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "gstatic-fonts-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
})
```

### 3. Melhorar o Hook de Auto-Update

**Arquivo: `src/hooks/usePWAAutoUpdate.ts`**

Adicionar:
- Verificacao de atualizacao ao voltar para a aba (visibilitychange)
- Verificacao ao reconectar na internet (online event)
- Intervalo mais curto (30s em vez de 60s)
- Atualizacao imediata sem delay quando critico

```typescript
import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

export const usePWAAutoUpdate = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log("[PWA] Service Worker registrado:", swUrl);
      
      if (registration) {
        // Verificar a cada 30 segundos
        setInterval(() => {
          console.log("[PWA] Verificando atualizacoes...");
          registration.update();
        }, 30 * 1000);

        // Verificar quando voltar para a aba
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            console.log("[PWA] Aba visivel, verificando atualizacoes...");
            registration.update();
          }
        });

        // Verificar quando reconectar na internet
        window.addEventListener("online", () => {
          console.log("[PWA] Online, verificando atualizacoes...");
          registration.update();
        });
      }
    },
    onRegisterError(error) {
      console.error("[PWA] Erro ao registrar SW:", error);
    },
  });

  // Auto-update imediato quando nova versao disponivel
  useEffect(() => {
    if (needRefresh) {
      console.log("[PWA] Nova versao disponivel, atualizando...");
      toast.info("Atualizando JARVIS...", { duration: 1500 });
      setTimeout(() => {
        updateServiceWorker(true);
      }, 1000);
    }
  }, [needRefresh, updateServiceWorker]);

  return { needRefresh };
};
```

### 4. Adicionar Meta Tags Anti-Cache no HTML

**Arquivo: `index.html`**

Adicionar no `<head>`:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

---

## Resumo das Mudancas

| Arquivo | Mudanca |
|---------|---------|
| `vercel.json` | Headers de cache para HTML e SW |
| `vite.config.ts` | skipWaiting, clientsClaim, cleanupOutdatedCaches |
| `src/hooks/usePWAAutoUpdate.ts` | Verificacao ao voltar aba, reconectar, intervalo 30s |
| `index.html` | Meta tags anti-cache |

## Resultado Esperado

Apos essas mudancas:
- Ao fazer deploy, usuarios verao a nova versao em no maximo 30 segundos
- Ao atualizar a pagina (F5), sempre carrega a versao mais recente
- Ao voltar para a aba do app, verifica e atualiza automaticamente
- PWA instalado atualiza assim que detectar nova versao

