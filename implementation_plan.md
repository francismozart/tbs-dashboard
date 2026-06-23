# Implementation Plan — The Brevio Sync Dashboard

> Dashboard para acompanhar o conteúdo gerado pelo flywheel (newsletter → posts),
> ler/escrever no Airtable, copiar conteúdo manualmente e marcar como "feito".
> Stack: **Next.js (App Router) + API Routes**, deploy na **Vercel**. Fonte única: **Airtable**.

---

## 1. Schema do Airtable (eu projeto — você cria a base)

**Base:** `The Brevio Sync` · **Tabela:** `Posts`

| Campo | Tipo Airtable | Uso | Quem escreve |
|---|---|---|---|
| `Title` | Single line text | Título/edição do post | n8n |
| `Date` | Date | Data agendada de publicação (agrupamento) | n8n |
| `Platform` | Single select: `Instagram`, `LinkedIn`, `X`, `Newsletter` | Canal | n8n |
| `Format` | Single select: `Carousel`, `Text-motion Reel`, `Screen Reel`, `Stories`, `LinkedIn Post`, `X Thread`, `Newsletter` | Formato | n8n |
| `Hooks` | Long text | 3 opções de hook (1 por linha) | n8n |
| `Content` | Long text | Copy/legenda/roteiro pronto para copiar e colar | n8n |
| `Status` | Single select: `Draft`, `Ready`, `Scheduled`, `Posted` | Estado do post | n8n **e** dashboard |
| `Link` | URL | Link do post publicado ou do asset (Canva/CapCut) | n8n / você |
| `Notes` | Long text | Observações livres | você |
| `Posted At` | Date | Carimbo de quando foi marcado "feito" | dashboard |

> "Marcar como feito" = `Status` → `Posted` + `Posted At` = hoje.
> Quando o n8n atualizar `Status` (ex.: agendou via Postiz → `Scheduled`), o dashboard reflete no próximo refresh.

Entrego um arquivo **`AIRTABLE_SETUP.md`** com passo a passo: criar base, criar campos exatos, gerar Personal Access Token (PAT) com escopo `data.records:read` + `data.records:write`, e como o nó Airtable do n8n deve gravar (mapa de campos).

---

## 2. Arquitetura

```
Browser ──> Next.js (Vercel) ──> /api/posts        (GET  lista, agrupada por data)
                              └─> /api/posts/[id]   (PATCH status / posted)
                                       │
                                       └──> Airtable REST API (key só no servidor)
```

- A **API key nunca vai para o browser** — fica em env var server-side, usada só nas API Routes.
- n8n escreve direto no Airtable (fora do app). O dashboard só lê/atualiza.

---

## 3. Arquivos a criar

### Config / infra
- `[NEW] dashboard/package.json` — Next.js 15, React 19, TypeScript, Tailwind.
- `[NEW] dashboard/next.config.ts`
- `[NEW] dashboard/tsconfig.json`
- `[NEW] dashboard/tailwind.config.ts` — tema da marca (cores, Space Grotesk, radius/borda).
- `[NEW] dashboard/postcss.config.mjs`
- `[NEW] dashboard/.env.local.example` — `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`.
- `[NEW] dashboard/.gitignore`

### Backend (server-only)
- `[NEW] dashboard/src/lib/airtable.ts` — cliente REST: `listPosts()`, `updatePost(id, fields)`. Lê env, faz fetch, mapeia campos → tipo `Post`.
- `[NEW] dashboard/src/lib/types.ts` — tipo `Post`, enums `Platform`/`Format`/`Status`.
- `[NEW] dashboard/src/app/api/posts/route.ts` — `GET`: retorna posts ordenados por data.
- `[NEW] dashboard/src/app/api/posts/[id]/route.ts` — `PATCH`: atualiza `Status` (e `Posted At` quando vira `Posted`).

### Frontend
- `[NEW] dashboard/src/app/layout.tsx` — fonte Space Grotesk, base styles, metadata.
- `[NEW] dashboard/src/app/globals.css` — tokens CSS + Tailwind.
- `[NEW] dashboard/src/app/page.tsx` — página principal: busca posts, agrupa por data, render.
- `[NEW] dashboard/src/components/DateGroup.tsx` — seção por data (cabeçalho + lista).
- `[NEW] dashboard/src/components/PostCard.tsx` — card: plataforma/formato, hooks, conteúdo, botões copiar, toggle "feito", badge de status, link.
- `[NEW] dashboard/src/components/CopyButton.tsx` — copia texto p/ clipboard com feedback "Copiado!".
- `[NEW] dashboard/src/components/StatusBadge.tsx` — badge colorido por status.
- `[NEW] dashboard/src/components/Filters.tsx` — filtro por plataforma e por status (ex.: esconder "Posted").

### Docs
- `[NEW] dashboard/AIRTABLE_SETUP.md` — schema + PAT + ligação com n8n.
- `[NEW] dashboard/README.md` — rodar local, env vars, deploy na Vercel.

---

## 4. Comportamentos-chave (requisitos do usuário)

1. **Buscar conteúdo do Airtable separado por data** → `GET /api/posts` ordena por `Date`; UI agrupa em seções por dia (mais recente/próximo primeiro).
2. **Fácil copiar e colar** → botão "Copiar conteúdo" em cada card (copia `Content`) e botão por hook. Feedback visual.
3. **Marcar como "feito" e salvar no Airtable** → toggle no card → `PATCH /api/posts/[id]` com `Status=Posted` + `Posted At`. Atualização otimista na UI.
4. **Pegar status atualizado pelo n8n** → como Airtable é fonte única, todo refresh (e botão "Atualizar" + auto-refresh leve a cada 60s) relê os status atuais.
5. **Deploy Vercel** → projeto Next.js padrão; env vars no painel da Vercel; sem servidor próprio.

---

## 5. Estilo (identidade "The Pragmatist" do README)

- Fonte **Space Grotesk** (700 headlines / 500 UI / 400 corpo).
- Cores: `#0D0D0D` base · `#F5A623` âmbar (só acento) · `#FFFDF7` off-white · `#1A1A1A` grafite · `#555555` cinza.
- Bordas 0.5px, radius 6px (tags) / 12px (cards), letter-spacing negativo em headlines, ícones outline.
- Modo escuro por padrão (grafite/preto) com âmbar nos CTAs e badges de destaque.

---

## 6. Verificação (antes de declarar pronto)

- `npm run build` no `dashboard/` sem erros de tipo/compilação.
- `npm run dev` + checagem manual: lista agrupa por data, copiar funciona, toggle "feito" chama PATCH.
- Sem a key exposta no bundle do cliente (key só em código server-side).
- Documentar no README o passo de env vars + deploy Vercel.

---

## 7. Fora de escopo (confirmar depois)

- Alterar os JSONs do n8n para gravar no Airtable (entrego só as instruções em `AIRTABLE_SETUP.md`; posso editar os workflows num passo seguinte se quiser).
- Autenticação no dashboard (por ora, deploy privado/Vercel password ou link não divulgado).
