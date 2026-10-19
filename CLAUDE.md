# otica-compartilhado — Guia para Claude Code

Pacote com features **idênticas** em dois sistemas do Daniel, ambos do setor óptico:

| Sistema | Empresa | Repo local | Stack |
|---|---|---|---|
| **Ariel** | Armazém dos Óculos | `~/Desktop/ariel` | FastAPI + SQLAlchemy (SQLite em disco persistente no Render) · React 19 + Vite + Tailwind 3 |
| **4 Olhos gestão** | 4 Olhos | `~/Desktop/4 Olhos gestão App` | FastAPI + SQLAlchemy (Postgres no Render) · React 19 + Vite + Tailwind 4 |

Melhorou aqui → nova tag → cada sistema sobe a versão quando quiser. O código daqui **nunca** importa
nada de um sistema específico: tudo que muda entre eles entra por injeção (ver "Pontos de injeção").

## Estrutura

```
python/otica_shared/<feature>/   # pip: otica-shared   (backend)
js/<feature>/src/                # fonte React (JSX)
js/<feature>/dist/index.js       # bundle gerado — VERSIONADO no git (ver abaixo)
package.json                     # npm: otica-compartilhado (raiz do repo)
```

## Features

### Landing pages (`landing_pages` / `otica-compartilhado/landing-pages`) — v0.1.0, out/2026
Origem: 4 Olhos (ago/2026). Páginas de captura por template pronto com edição guiada (4 templates:
`simples`, `promocao`, `agendar_consulta`, `greats`), página pública `/lp/:slug`, contagem de
visualizações e captura de lead (nome + telefone + fbclid).

**Backend** — `criar_modelos(Base, tabela_usuarios=..., modelo_usuario=...)` e
`criar_routers(LandingPage, LandingPageLead, get_db=..., get_usuario_atual=..., upload_imagem=..., info_criador=None)`
→ `(router, router_publico)`. O app registra os dois com `prefix="/api"`, **o público antes**.

- Tabelas `landing_pages` e `landing_page_leads`: nomes e colunas **idênticos** ao que a 4 Olhos já tinha
  em produção. Nunca renomear/mudar tipo. Coluna nova = aditiva + `ALTER TABLE ADD COLUMN` em runtime
  em **cada** app (os dois têm migração runtime própria no startup).
- **Lead é dado permanente**: sem cascade no modelo; `DELETE` de página com lead → 422 ("pause em vez
  de excluir"). Regra herdada do Ariel (histórico de perda de dados), vale para os dois.
- Slug ASCII-only sem transliterar acento ("Promoção" → "promo-o") — mantido por compatibilidade com
  slugs já publicados.
- A definição visual dos templates mora **só no frontend**; o backend guarda `conteudo` como JSON solto.

**Frontend** — `configurarLandingPages({...})` uma vez no `main.jsx`, depois usar as páginas:
`LandingPagesLista` (painel), `LandingPageEditor` (rota `${rotaPainel}/:id`) e `LandingPageView`
(rota pública `${rotaPublica}/:slug`, fora do layout logado). Ver `js/landing-pages/src/config.js`
para todas as opções.

**Pontos de injeção**

| | 4 Olhos | Ariel |
|---|---|---|
| Auth backend | `auth.get_usuario_atual` | dependência JWT própria das landing pages |
| FK criador | `usuarios.id` / `Usuario` | `users.id` / `User` |
| Upload imagem | `storage_r2.upload_arquivo` | arquivo no disco persistente do Render, servido em `/uploads` |
| Nome/foto do criador | `info_criador` (foto do `Colaborador`) | padrão (`User.name` / `photo_url`) |
| `TelefoneInput` | o do sistema (react-phone-number-input) | input simples do pacote |
| `Avatar` | `ColaboradorAvatar` | iniciais do pacote |

## Regras de trabalho

1. **Rodar `npm run build` antes de todo commit que mexe em `js/`** e commitar o `dist/` junto.
   O `dist` é versionado de propósito: os apps instalam pelo tarball da tag no GitHub, sem passo de
   build na instalação, e o Tailwind de cada app escaneia as classes no `dist`.
2. Testes do backend: `npm test` (pytest em `python/tests`, app FastAPI mínimo com SQLite em memória).
   Primeira vez: `python3 -m venv .venv && .venv/bin/pip install -e python fastapi sqlalchemy pydantic httpx pytest python-multipart`.
3. **Sem dependências declaradas** no `pyproject.toml`: fastapi/sqlalchemy 2/pydantic 2 vêm do app,
   para o pip nunca mexer nas versões fixadas de cada sistema. No front, react/react-router-dom/
   lucide-react são `peerDependencies`.
4. Classes Tailwind: só utilitários padrão (nada de `brand-*`, `primary-*` ou cores de tema de um
   sistema) — o pacote roda com Tailwind 3 (Ariel) e 4 (4 Olhos). Cor de runtime → `style` inline.
5. **Versionar**: atualizar `version` no `package.json` e no `python/pyproject.toml` (+ `__version__`),
   registrar no Changelog abaixo, commitar, `git tag vX.Y.Z && git push origin main --tags`.
6. **Instalação nos apps** (sempre pelo tarball da tag — não exige git na imagem Docker):
   - `requirements.txt`: `otica-shared @ https://github.com/danielss87/otica-compartilhado/archive/refs/tags/vX.Y.Z.tar.gz#subdirectory=python`
   - `package.json`: `"otica-compartilhado": "https://github.com/danielss87/otica-compartilhado/archive/refs/tags/vX.Y.Z.tar.gz"`
   - Tailwind 3 (Ariel, `tailwind.config.js` → `content`): `"./node_modules/otica-compartilhado/js/**/dist/*.js"`
   - Tailwind 4 (4 Olhos, `index.css`): `@source "../node_modules/otica-compartilhado/js";`
7. Mudança de comportamento que afeta um dos sistemas → avisar no Changelog e atualizar a seção
   correspondente do CLAUDE.md de cada app ao subir a versão lá.
8. Repo **público**: nunca commitar segredo, credencial, URL interna, dado de cliente ou telefone real.

## Changelog

### v0.1.0 (19/10/2026)
- Landing pages extraídas da 4 Olhos. Diferenças em relação ao código original da 4 Olhos:
  - `DELETE` recusa (422) página que já tem lead; antes apagava a página e os leads em cascata.
  - `PUT` com `slug: ""` não apaga mais o slug (antes gravava vazio).
  - Placeholders de exemplo neutros (sem marca/telefone da 4 Olhos).
