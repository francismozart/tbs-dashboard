# Airtable — Setup & Integração com n8n

A base já foi **criada via API** por este projeto. Referência do schema e de como o n8n
deve gravar os posts.

## Base

| Item | Valor |
|---|---|
| Base | `TheBrevioSync` |
| Base ID | `appwqSePqOYGUYEob` |
| Tabela | `Posts` (`tblBykBiUhq5HcURF`) |

## Campos da tabela `Posts`

| Campo | Tipo | Observação |
|---|---|---|
| `Title` | Single line text | Título/edição |
| `Date` | Date (ISO) | Data de publicação — usada para agrupar no dashboard |
| `Platform` | Single select | `Instagram` · `LinkedIn` · `X` · `Newsletter` |
| `Format` | Single select | `Carousel` · `Text-motion Reel` · `Screen Reel` · `Stories` · `LinkedIn Post` · `X Thread` · `Newsletter` |
| `Hooks` | Long text | **1 hook por linha** (o dashboard quebra por `\n`) |
| `Content` | Long text | Copy/legenda/roteiro pronto para copiar |
| `Status` | Single select | `Draft` · `Ready` · `Scheduled` · `Posted` |
| `Link` | URL | Post publicado ou asset (Canva/CapCut) |
| `Notes` | Long text | Observações livres |
| `Posted At` | Date (ISO) | Carimbado pelo dashboard quando você marca "feito" |

## Token

Personal Access Token (PAT) com escopos:
- `data.records:read`
- `data.records:write`
- acesso à base `TheBrevioSync`

Guarde o token **apenas** em `.env.local` (local) e nas Environment Variables da Vercel —
nunca commitado.

## Como o n8n grava (nó Airtable → Create/Upsert record)

No fim dos workflows W1/W2/W3, adicione um nó **Airtable → Create a record** (ou
*Upsert* usando `Title`+`Date` como chave) apontando para a base/tabela acima e mapeando:

| Campo Airtable | Origem no n8n |
|---|---|
| `Title` | título gerado pelo Claude |
| `Date` | data de publicação agendada |
| `Platform` | canal do post |
| `Format` | formato do post |
| `Hooks` | as 3 opções de hook unidas por `\n` |
| `Content` | a copy final |
| `Status` | `Ready` ao gerar; `Scheduled` após agendar no Postiz |

> Fluxo de status: n8n cria como `Ready` → ao agendar vira `Scheduled` → você marca
> `Posted` no dashboard (ou um webhook de confirmação de publicação grava `Posted`).
> O dashboard é só leitura/escrita de status; o Airtable é a fonte única.

## Teste rápido (PowerShell)

```powershell
$h=@{Authorization="Bearer SEU_TOKEN"}
Invoke-RestMethod -Uri "https://api.airtable.com/v0/appwqSePqOYGUYEob/Posts" -Headers $h
```
