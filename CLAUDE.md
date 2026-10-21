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

### Landing pages (`landing_pages` / `otica-compartilhado/landing-pages`) — v0.12.0, out/2026
Origem: 4 Olhos (ago/2026). Páginas de captura por template pronto com edição guiada (4 templates:
`simples`, `promocao`, `agendar_consulta`, `greats`), página pública `/lp/:slug`, contagem de
visualizações e captura de lead (nome + telefone + fbclid). Quinto template, `leader` (v0.10.0), em
`templateLeader.jsx`.

**Template responsivo por container query** (`responsivoPorContainer: true`, hoje só o `leader`): o
layout muda pela largura da própria página, não da janela, então a pré-visualização do editor mostra
celular/tablet/desktop de verdade (seletor ao lado de "Pré-visualização"; renderiza em 390/820/1280px e
reduz com `zoom`). O CSS é próprio, com prefixo de classe e injetado num `<style>`, porque o Tailwind 3
(Ariel) não tem container query e o 4 (4 Olhos) usa outra sintaxe. Template novo de layout complexo:
preferir este modelo. Os templates antigos usam `sm:` (viewport) e não respondem ao seletor.

**Backend** — `criar_modelos(Base, tabela_usuarios=..., modelo_usuario=...)` e
`criar_modelo_config(Base)` e
`criar_routers(LandingPage, LandingPageLead, get_db=..., get_usuario_atual=..., upload_imagem=..., info_criador=None, LandingPagesConfig=...)`
→ `(router, router_publico)`. O app registra os dois com `prefix="/api"`, **o público antes**.

- Tabelas `landing_pages` e `landing_page_leads`: nomes e colunas **idênticos** ao que a 4 Olhos já tinha
  em produção. Nunca renomear/mudar tipo. Coluna nova = aditiva + `ALTER TABLE ADD COLUMN` em runtime
  em **cada** app (os dois têm migração runtime própria no startup).
- **Lead é dado permanente**: sem cascade no modelo; `DELETE` de página com lead → 422 ("pause em vez
  de excluir"). Regra herdada do Ariel (histórico de perda de dados), vale para os dois.
- Slug: sem acento, minúsculo, o resto vira "-" ("Promoção" → `promocao`, desde v0.2.0). Slug gravado
  nunca é recalculado. A regra existe em dois lugares: `_slug` (router.py) e `normalizarSlug`
  (LandingPageEditor.jsx).
- A definição visual dos templates mora **só no frontend**; o backend guarda `conteudo` como JSON solto.
- **Texto padrão de campo mora só no `padrao` do campo** (v0.11.0): nunca escrever `c.x || 'texto'` no
  `Render`. O `Render` recebe o conteúdo já mesclado (`aplicarPadroes`: vazio/nulo/"" → padrão) e o editor
  mostra o padrão dentro da caixa, pra achar no Ctrl+F. Vale para `texto_curto`, `texto_longo` e as chaves
  de `bloco` (`padrao: { titulo, ... }`); listas já usavam `padrao` (`listaOuPadrao`). Padrão que depende de
  outro campo: ler de `conteudoOriginal` e não declarar `padrao` no campo.
- **Configurações gerais** (v0.3.0, `landing_pages_config`, uma linha com JSON):
  - Configuração nova = chave nova em `config.PADRAO` (Python) + campo no `ModalConfiguracoes.jsx` +
    uso em `Moldura.jsx`. **Sem ALTER TABLE**: a leitura sempre mescla com o padrão.
  - Sempre nascer **desligada** por padrão, para não mudar páginas já publicadas de nenhum dos sistemas.
  - O que a página pública pode ver passa por `config.publica()`. Nunca devolver a config inteira na
    rota pública.
- Upload de logo/imagem: o Ariel recusa SVG (risco de script num SVG servido pelo próprio backend).
  Não sugerir SVG na interface.

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

### v0.12.0 (21/10/2026)
- **Menu no topo alinhado ao conteúdo**: logo e botão ficam numa faixa central de no máximo 1180px (a largura
  do conteúdo dos templates), em vez de presos aos cantos da tela. Em tela larga eles pareciam colados na
  borda direita. **Muda a posição do menu em páginas publicadas** em telas acima de ~1180px; abaixo disso, igual.
- **Botão flutuante de WhatsApp com mais respiro**: 32px do canto a partir de 640px (era 20px) e 24px no celular.
- Pré-visualização: com template `responsivoPorContainer`, o menu segue a largura simulada (no modo Celular o
  botão do menu some, como no celular de verdade); antes seguia a janela e aparecia espremido.
  `MolduraLandingPage` ganhou a prop `porContainer`. O CSS do menu é próprio (`ESTILO_MENU`, injetado).
- Regra: nunca pôr `container-type` num ancestral do botão flutuante (`fixed`): o container vira o bloco de
  contenção dele e o botão sai do canto da tela.

### v0.11.0 (21/10/2026)
- **Editor mostra os textos padrão dentro das caixas**: antes o campo ficava vazio enquanto a página mostrava
  o texto de exemplo, e não dava para achar no Ctrl+F qual campo editar. Agora o campo nunca editado vem com o
  mesmo texto que a página exibe; apagado, a página volta ao padrão e a caixa mostra o padrão como dica.
- Os textos padrão saíram do `Render` e foram para o `padrao` de cada campo, nos 5 templates (fonte única).
  Mescla em `aplicarPadroes` (templates.jsx), aplicada a todo `Render`.
- Nenhuma página publicada muda: o HTML de todos os templates foi comparado com a v0.10.0 (conteúdo vazio,
  parcial e com campos apagados) e saiu idêntico.
- Exceções sem `padrao`: `cta_texto` do Agendar consulta e o botão do formulário do Leader (padrão depende de
  ter WhatsApp ou não).

### v0.10.0 (21/10/2026)
- **Template novo "Leader"** (`leader`, `templateLeader.jsx`), réplica do layout de uma landing page de ótica
  de bairro (referência: oticaleader.com). Seções: topo, o problema, a solução, o que oferecemos (+ faixa
  escura), como funciona (linha do tempo), fotos da loja, prova social (+ depoimentos opcionais), dúvidas
  (sanfona), venha nos visitar (contato) e rodapé. Fontes Syne + DM Sans (só carregadas com o template).
- **Banners com degradê** (topo e "a solução"): cor sólida fundindo com a foto da loja, em CSS (na
  referência vinha pronto no PNG), então qualquer foto enviada ganha o efeito. Desktop/tablet: foto à
  direita, degradê da esquerda para a direita; celular: foto em cima, desbotando para a cor embaixo, com o
  texto centralizado. Largura do degradê editável (`degrade_largura`, 20–80%, padrão 50).
- Botões abrem o WhatsApp do próprio template (`whatsapp_numero`, normalizado como nas configurações
  gerais); sem número, rolam até a seção de contato, que mostra o formulário de lead.
- Editor: seletor **Celular / Tablet / Desktop** na pré-visualização para templates com
  `responsivoPorContainer`. `lista_features` aceita `placeholderTitulo`; `lista` e `lista_faq` passam a
  aceitar `padrao` (mesmo comportamento do `listaOuPadrao`). Templates existentes não mudam.

### v0.9.0 (20/10/2026)
- **Padrão "letrão" em todos os templates** (legibilidade para quem chega sem óculos ou com a pupila
  dilatada — público dos dois sistemas). **Muda o visual de páginas já publicadas** ao subir de versão.
  - Nenhum texto abaixo de 14px; texto corrido em 16px (celular) / 18px (desktop), `leading-relaxed`.
  - Texto corrido em cinza escuro (`gray-700`/`gray-800`; no Greats `GREATS_TEXTO = #374151`, ~10:1 no
    branco) em vez de `gray-500`/`#6B7280`; branco sobre a cor da página a 95%; rodapé `gray-600`.
  - Greats: corpo em `font-medium` (o 400 da Montserrat é fino); títulos e botões maiores, menos
    espaçamento entre letras; sombra de texto no título do hero; selos e depoimentos empilhados no
    celular (`grid-cols-1 sm:grid-cols-3/2`), faixa de CTA com a imagem embaixo no celular; ícones maiores.
  - Formulário: campos em 16px (também evita o zoom automático do iOS) e mais altos.
  - Sem hifenização automática (quebrava o título do hero); só `break-words` para palavra que não cabe.
- **Regra para template novo**: seguir o mesmo padrão (mínimo 14px, corpo 16–18px, nada de gray-400/500
  em texto).

### v0.8.0 (20/10/2026)
- **Animação "tilt" no botão do menu** (`menu.cta_tilt`, desligada por padrão): o CTA balança rápido
  (rotação ±4° com leve aumento, ~0,7s) e fica parado o resto de um ciclo de 4s, começando 1,5s depois de a
  página abrir. Keyframes próprios em `Moldura.jsx` (`ESTILO_TILT`, só injetados com a opção ligada); pausa
  no hover e fica sem animação com `prefers-reduced-motion`. Só vale com o menu ligado. Interruptor em
  Configurações → Menu no topo. Como o CTA só aparece no desktop, a animação também.

### v0.7.0 (20/10/2026)
- **Favicon geral** (`marca.favicon_url`, vazio por padrão): enviado em Configurações → Identidade de marca
  (mesmo `/upload-imagem`, PNG/WebP). Vai na config pública; o `LandingPageView` (`useFavicon`) tira os
  `<link rel="icon">` do app enquanto a página está aberta, põe o novo e devolve os originais ao sair.
- **Título da página** (`meta_titulo`, que já existia): saiu do bloco "SEO" no fim do formulário e foi para
  o bloco "Página", no topo do editor, com rótulo "Título da página (aba do navegador)". Em branco, a aba
  mostra o nome da página (placeholder mostra isso). A descrição (`meta_descricao`) foi junto.
- Título, descrição e favicon são aplicados por JavaScript: o Google lê, mas a prévia de link do
  WhatsApp/Facebook não (elas não rodam JS).

### v0.6.0 (20/10/2026)
- **Menu fixo no topo** (`menu.fixo`, desligado por padrão): o header do menu vira `sticky top-0 z-40`, na
  página pública (rola com a janela) e na pré-visualização do editor (rola com a área de preview). Só vale
  com o menu ligado (`config.publica` devolve `fixo: false` com o menu desligado). Com o menu fixo, a
  rolagem até a seção de contato desconta a altura do menu. Interruptor em Configurações → Menu no topo.
  Atenção: `sticky` não funciona se um ancestral tiver `overflow: hidden`.
- **Greats: ícone próprio em cada selo de confiança** (`features[i].icone_url`): no editor, clicar no
  ícone do selo envia um PNG (mesmo `/upload-imagem`); o "x" volta ao ícone padrão (`GREATS_ICONES`, por
  posição). Na página o PNG fica numa caixa fixa de 24px com `object-contain`, então qualquer tamanho de
  arquivo sai igual e sem distorcer. O PNG mantém as cores dele (não é tingido com a cor principal).
  O campo `lista_features` aceita `icones` (componentes do lucide) para mostrar o padrão no editor.
- Sem `ALTER TABLE`: `fixo` entra pelo `config.PADRAO` e `icone_url` mora no JSON de `conteudo`.
  Subir de versão não muda nenhuma página publicada.

### v0.5.1 (20/10/2026)
- **Correção (Greats):** os selos de confiança ("FEITOS À MÃO", "MATERIAIS PREMIUM", "TROCA GRÁTIS") e os
  depoimentos de exemplo apareciam na página, mas o editor mostrava a lista vazia, então não dava para
  editá-los. Agora o campo declara `padrao` com os mesmos itens que o `Render` usa, e o editor os mostra
  quando a lista está vazia (`listaOuPadrao`); a primeira edição grava a lista inteira. Páginas
  publicadas não mudam.
- Lista com texto de exemplo no `Render`: declarar o mesmo valor em `padrao` no campo.

### v0.5.0 (19/10/2026)
- **Botão do menu leva à seção de contato** (`menu.cta_destino = "contato"`): rola a página até a seção de
  contato com **transição suave** (`rolarSuaveAte` em `Moldura.jsx`: easeInOutCubic, ~0,9s, rola o
  ancestral rolável, que no editor é a pré-visualização; sem animação com `prefers-reduced-motion`).
- **Seção de contato por página**: cada template declara `secoes` (blocos marcados com `data-secao` no
  `Render`) e `secaoContatoPadrao`. No editor, o campo "Seção de contato" grava `conteudo.secao_contato`.
  Sem escolha, vale o padrão do template. Resolver com `secaoContatoDaPagina`.
- **Cor do botão do menu** (`menu.cta_cor`): `padrao` (verde se WhatsApp, escuro nos outros) | `principal`
  | `destaque`, com as cores da própria página via `cores(conteudo)` do template (`coresDaPagina`; template
  sem cor própria → escuro `#111827`).
- **Greats: película escura do hero editável** (`hero_escurecimento`, 0–80%, padrão 25 = o antigo
  `bg-black/25`, então páginas existentes não mudam). Campo novo do editor: `tipo: 'intensidade'`
  (controle deslizante com min/max/passo/padrão/unidade e "Voltar ao padrão"), reutilizável.
- **Template novo**: declarar `secoes` + `secaoContatoPadrao` (e `cores`, se tiver cor própria), e pôr
  `data-secao` nos blocos do `Render`.

### v0.4.0 (19/10/2026)
- **Menu no topo** (configuração `menu`): logo à esquerda e botão CTA à direita no desktop; só o logo,
  centralizado, no celular (o CTA é `hidden sm:inline-flex`). O destino do CTA é o WhatsApp configurado
  (funciona mesmo com o botão flutuante desligado) ou um link. O link final vem pronto na rota pública
  (`config.publica` → `menu.cta_url`); no editor, o `Moldura.jsx` monta a partir da config completa.
  Com o menu desligado, continua a faixa só com o logo centralizado.
- **Bolinha de notificação** no botão flutuante de WhatsApp: círculo vermelho-alaranjado com "1" e pulso
  suave (keyframes próprios em `Moldura.jsx`, sem animação com `prefers-reduced-motion`).
  `whatsapp.notificacao` é **ligada por padrão**, inclusive para config salva antes desta versão, e dá
  para desligar no modal.
- No modal, o número e a mensagem do WhatsApp ficam sempre visíveis, porque o CTA do menu também os usa.
  O interruptor controla só o botão flutuante.

### v0.3.0 (19/10/2026)
- **Configurações gerais** (valem para todas as landing pages): botão "Configurações" na listagem abre
  `ModalConfiguracoes.jsx`, com duas seções:
  - **Botão de WhatsApp:** ativar, número (normalizado para só dígitos com DDI; 10/11 dígitos ganham 55)
    e mensagem padrão.
  - **Identidade de marca:** upload do logo, que usa o mesmo `/upload-imagem`.
- Tabela nova `landing_pages_config` (uma linha, `dados` em JSON, formato em `python/.../config.py`).
  Rotas `GET`/`PUT /landing-pages/configuracoes`. A página pública recebe `configuracoes` (só a parte
  pública; o número só vai quando o botão está ativo).
- `Moldura.jsx` (`MolduraLandingPage`): logo no topo e botão verde flutuante, usado na página pública
  (`fixed`) e na pré-visualização do editor (`sticky`).
- **Apps precisam:** `LandingPagesConfig = criar_modelo_config(Base)` e passar
  `LandingPagesConfig=...` em `criar_routers`. Sem isso as rotas de configuração dão 404 e as páginas
  saem sem logo e sem botão. Tudo vem desligado por padrão: subir de versão não muda nenhuma página.

### v0.2.0 (19/10/2026)
- Editor: bloco "Página" no topo do formulário, com o **nome** (autosave) e o **endereço/slug** editáveis.
  O slug salva com botão/Enter, mostra o erro 409 ("endereço já em uso") e avisa quando a página já está
  publicada, porque o link antigo para de funcionar.
- Slug agora translitera acento ("Promoção" → `promocao`; antes `promo-o`). Isso vale para páginas novas e
  para slugs editados; slugs já gravados não mudam. Regra igual em `_slug` (router.py) e `normalizarSlug`
  (LandingPageEditor.jsx): mudar uma exige mudar a outra.

### v0.1.0 (19/10/2026)
- Landing pages extraídas da 4 Olhos. Diferenças em relação ao código original da 4 Olhos:
  - `DELETE` recusa (422) página que já tem lead; antes apagava a página e os leads em cascata.
  - `PUT` com `slug: ""` não apaga mais o slug (antes gravava vazio).
  - Placeholders de exemplo neutros (sem marca/telefone da 4 Olhos).
