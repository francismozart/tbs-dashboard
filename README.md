# The Brevio Sync — Content Dashboard

Dashboard para acompanhar o conteúdo gerado pelo flywheel (newsletter → posts),
ler do **Airtable** agrupado por data, **copiar e colar** com 1 clique e **marcar como
publicado** (gravado de volta no Airtable). Status reflete o que o n8n atualizar.

- **Stack:** Next.js (App Router) + TypeScript + Tailwind
- **Backend:** API Routes (a chave do Airtable fica só no servidor)
- **Deploy:** Vercel

## Rodar localmente

```bash
cd dashboard
npm install
# copie .env.local.example -> .env.local e preencha (já há um .env.local com os valores)
npm run dev
```

Abra http://localhost:3000

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `AIRTABLE_API_KEY` | Personal Access Token (read + write) |
| `AIRTABLE_BASE_ID` | `appwqSePqOYGUYEob` |
| `AIRTABLE_TABLE_NAME` | `Posts` |

Veja o schema completo e a integração com n8n em [AIRTABLE_SETUP.md](./AIRTABLE_SETUP.md).

## Como funciona

- **Aba "Ativos":** posts com status ≠ `Posted`, agrupados por data (mais próximo no topo).
- **Aba "Arquivo":** posts já marcados como `Posted` (mais recente no topo).
- **Copiar:** botão por hook e botão "Copiar conteúdo" em cada card.
- **Marcar feito:** `Status → Posted` + `Posted At` = hoje, via `PATCH /api/posts/[id]`. "Reabrir" volta para `Ready`.
- **Sync:** botão "Atualizar" + auto-refresh a cada 60s relêem o Airtable (reflete o n8n).
- **Filtro:** por plataforma (Instagram / LinkedIn / X / Newsletter).

## Deploy na Vercel

1. Suba a pasta `dashboard/` para um repositório Git.
2. Na Vercel: **New Project** → importe o repo → **Root Directory = `dashboard`**.
3. Em **Settings → Environment Variables**, adicione `AIRTABLE_API_KEY`,
   `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`.
4. Deploy. (Recomendado: proteger com Vercel Authentication, pois não há login próprio.)

## Endpoints

- `GET /api/posts` → `{ posts: Post[] }` (ordenado por data)
- `PATCH /api/posts/[id]` body `{ "status": "Posted" | "Ready" | "Scheduled" | "Draft" }`
