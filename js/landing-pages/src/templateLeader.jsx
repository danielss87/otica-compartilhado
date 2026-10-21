// Template "Leader" (v0.10.0): réplica de layout de uma landing page de ótica de bairro
// (referência: oticaleader.com, out/2026). Marca registrada da referência fica de fora:
// só estrutura, proporções, tipografia (Syne + DM Sans) e o efeito dos banners.
//
// O efeito principal: os banners (topo e "a solução") fundem uma COR SÓLIDA com a FOTO
// DA LOJA por um degradê. No desktop/tablet a foto fica à direita e o degradê corre da
// esquerda (cor) para a direita (foto); no celular a foto vai para cima e desbota para a
// cor embaixo, com o texto centralizado logo abaixo. Na referência o degradê vinha
// "assado" no PNG; aqui é CSS, então qualquer foto enviada fica com o mesmo efeito.
//
// Responsivo por CONTAINER QUERY (não por breakpoint de viewport): o layout segue a
// largura da própria página, então a pré-visualização do editor mostra celular, tablet e
// desktop de verdade. O CSS é próprio (prefixo `olp-ld-`, injetado num <style>) porque o
// Tailwind 3 (Ariel) não tem container query e o 4 (4 Olhos) tem sintaxe diferente.
// Cores de runtime entram por variáveis CSS no elemento raiz.
import { useEffect, useState } from 'react'
import {
  Image as ImageIcon, Eye, Sun, CircleDot, Zap, User, Glasses, Wrench, CircleCheck, MapPin, Plus, Star,
} from 'lucide-react'
import { IconeWhatsApp, linkWhatsApp } from './Moldura'

export const LEADER_COR_ESCURA = '#020B26'
export const LEADER_COR_DESTAQUE = '#00B6D5'
const LEADER_DEGRADE_PADRAO = 50

export const LEADER_SERVICOS_PADRAO = [
  { titulo: 'Óculos de grau', descricao: 'Armações para todos os estilos e formatos de rosto, com a lente indicada para a sua receita.' },
  { titulo: 'Óculos de sol', descricao: 'Proteção de verdade para os olhos, com armações que combinam com o seu jeito.' },
  { titulo: 'Lentes de contato', descricao: 'Para quem prefere ficar sem óculos, com orientação sobre uso, adaptação e cuidados.' },
]
export const LEADER_SERVICOS_ICONES = [Eye, Sun, CircleDot, Zap]

export const LEADER_PASSOS_PADRAO = [
  { titulo: 'Atendimento consultivo', descricao: 'Entendemos sua rotina e o que você precisa enxergar melhor antes de mostrar qualquer produto.' },
  { titulo: 'Escolha da armação', descricao: 'Orientação sincera sobre o que valoriza o seu rosto, não só o que está em promoção.' },
  { titulo: 'Definição da lente', descricao: 'A lente certa para a sua receita: antirreflexo, fotossensível, multifocal e mais.' },
  { titulo: 'Montagem', descricao: 'Montamos e conferimos cada óculos com cuidado antes da entrega.' },
  { titulo: 'Entrega ajustada', descricao: 'Os óculos saem regulados no seu rosto, e o pós-venda acompanha a sua adaptação.' },
]
export const LEADER_PASSOS_ICONES = [User, Glasses, Eye, Wrench, CircleCheck]

export const LEADER_FAQ_PADRAO = [
  { pergunta: '"Vai ficar bom em mim?"', resposta: 'A gente ajuda você a escolher a armação pelo formato do rosto, pelo estilo e pela rotina. Você só leva quando estiver seguro.' },
  { pergunta: '"Será que vou me adaptar aos óculos?"', resposta: 'Explicamos como é a adaptação e acompanhamos você depois da entrega. Se algo incomodar, é só voltar.' },
  { pergunta: '"Vale o preço?"', resposta: 'Temos opções para vários orçamentos e mostramos a diferença entre as lentes, para você decidir com clareza.' },
  { pergunta: '"E se eu não tiver receita atualizada?"', resposta: 'Fale com a gente pelo WhatsApp: indicamos onde fazer o exame e ajudamos a ler a sua receita.' },
]

export const LEADER_RODAPE_ITENS_PADRAO = ['Atendimento consultivo', 'Óculos ajustados no rosto', 'Pós-venda garantido']

const FONTE_HREF = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap'
const FONTE_TITULO = "'Syne', ui-sans-serif, system-ui, sans-serif"
const FONTE_TEXTO = "'DM Sans', ui-sans-serif, system-ui, sans-serif"

function useFontesLeader() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTE_HREF}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONTE_HREF
    document.head.appendChild(link)
  }, [])
}

// ─── Cores ──────────────────────────────────────────────────────────────────

function hexParaRgb(hex) {
  let h = String(hex || '').replace('#', '').trim()
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  if (!/^[0-9a-f]{6}$/i.test(h)) return null
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
}

function rgba(hex, alfa) {
  const rgb = hexParaRgb(hex) || [0, 0, 0]
  return `rgba(${rgb.join(', ')}, ${alfa})`
}

// Mistura duas cores (t = 0 → a, 1 → b). Usada pros degradês dos botões e da caixa escura.
function misturar(a, b, t) {
  const x = hexParaRgb(a) || [0, 0, 0]
  const y = hexParaRgb(b) || [0, 0, 0]
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

// Normaliza o número de WhatsApp como as configurações gerais: só dígitos, 10/11 dígitos ganham 55.
function numeroWhatsApp(numero) {
  const d = String(numero || '').replace(/\D/g, '')
  return d.length === 10 || d.length === 11 ? `55${d}` : d
}

// ─── CSS próprio (container queries) ───────────────────────────────────────
// Celular < 640px ≤ tablet < 1024px ≤ desktop, medidos na largura da página.
// Padrão "letrão" (v0.9.0): nada abaixo de 14px; corpo 16–18px; texto em cinza escuro.
const CSS = `
.olp-ld { container: olp-ld / inline-size; font-family: ${FONTE_TEXTO}; color: var(--ld-texto); background: #fff; overflow-wrap: break-word; }
.olp-ld *, .olp-ld *::before, .olp-ld *::after { box-sizing: border-box; }
.olp-ld h1, .olp-ld h2, .olp-ld h3 { font-family: ${FONTE_TITULO}; font-weight: 800; margin: 0; letter-spacing: -0.01em; }
.olp-ld p { margin: 0; }
.olp-ld-wrap { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 20px; }
.olp-ld-sec { padding: 56px 0; }
.olp-ld-claro { background: #F4F7FC; }
.olp-ld-escuro { background: var(--ld-escura); color: rgba(255,255,255,.92); }
.olp-ld-selo { font-family: ${FONTE_TITULO}; font-weight: 700; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--ld-destaque-texto); margin-bottom: 12px; }
.olp-ld-escuro .olp-ld-selo, .olp-ld-hero .olp-ld-selo { color: var(--ld-destaque); }
.olp-ld-h1 { font-size: 32px; line-height: 1.08; color: #fff; }
.olp-ld-h2 { font-size: 28px; line-height: 1.12; color: var(--ld-escura); }
.olp-ld-escuro .olp-ld-h2 { color: #fff; }
.olp-ld-dest { color: var(--ld-destaque-texto); }
.olp-ld-hero .olp-ld-dest, .olp-ld-escuro .olp-ld-dest { color: var(--ld-destaque); }
.olp-ld-corpo { font-size: 16px; line-height: 1.65; font-weight: 500; white-space: pre-line; }
.olp-ld-centro { text-align: center; }
.olp-ld-centro .olp-ld-acoes { justify-content: center; }

/* Botões */
.olp-ld-acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 24px; margin-top: 28px; }
.olp-ld-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; padding: 14px 30px; border-radius: 999px; border: 0; cursor: pointer;
  font-family: ${FONTE_TITULO}; font-weight: 700; font-size: 16px; color: #fff; text-decoration: none; white-space: nowrap; background: var(--ld-btn); box-shadow: 0 8px 22px -10px var(--ld-destaque); transition: transform .15s, filter .15s; }
.olp-ld-btn:hover { transform: translateY(-1px); filter: brightness(1.06); }
.olp-ld-btn svg { width: 20px; height: 20px; flex-shrink: 0; }
.olp-ld-link { font-family: ${FONTE_TITULO}; font-weight: 700; font-size: 15px; color: #fff; text-decoration: underline; text-underline-offset: 4px; background: none; border: 0; cursor: pointer; padding: 6px 0; }

/* Banner com degradê (cor sólida ↔ foto). Celular: foto em cima, desbotando para baixo. */
.olp-ld-banner { position: relative; background: var(--ld-fundo); overflow: hidden; }
.olp-ld-banner-foto { position: relative; height: 320px; }
.olp-ld-banner-foto img, .olp-ld-banner-foto .olp-ld-vazio { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.olp-ld-banner-foto::after { content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, var(--ld-fundo-0) 0%, var(--ld-fundo-0) calc(100% - var(--ld-degrade-cel)), var(--ld-fundo) 100%); }
.olp-ld-banner-texto { position: relative; z-index: 1; margin-top: -72px; padding: 0 20px 52px; text-align: center; }
.olp-ld-banner-texto .olp-ld-acoes { justify-content: center; }
.olp-ld-logo { height: 40px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 22px; display: block; }

/* Problema / contato: imagem + texto */
.olp-ld-duo { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
.olp-ld-duo-img { width: 100%; border-radius: 24px; object-fit: cover; aspect-ratio: 1 / 1; }
.olp-ld-duo-texto { text-align: center; }
.olp-ld-duo-texto .olp-ld-acoes { justify-content: center; }
.olp-ld-caixa { display: inline-block; margin-top: 26px; padding: 16px 22px; border-radius: 12px; color: #fff; font-weight: 700; font-size: 17px; background: var(--ld-caixa); }
.olp-ld-form { margin: 28px auto 0; max-width: 440px; text-align: left; }
.olp-ld-contato-img { width: 100%; max-height: 420px; object-fit: contain; object-position: bottom; }

/* Serviços */
.olp-ld-cards { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 36px; }
.olp-ld-card { background: #fff; border-radius: 18px; padding: 26px 24px; box-shadow: 0 1px 2px rgba(2,11,38,.04); }
.olp-ld-icone { width: 48px; height: 48px; border-radius: 12px; background: var(--ld-escura); color: var(--ld-destaque); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.olp-ld-icone img { width: 26px; height: 26px; object-fit: contain; }
.olp-ld-card h3 { font-size: 19px; font-weight: 700; color: var(--ld-escura); margin-bottom: 8px; }
.olp-ld-card p { font-size: 16px; line-height: 1.6; font-weight: 500; }
.olp-ld-faixa { margin-top: 16px; border-radius: 18px; padding: 30px 24px; background: var(--ld-caixa); color: rgba(255,255,255,.92); display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; }
.olp-ld-faixa h3 { font-size: 21px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.olp-ld-faixa p { font-size: 16px; line-height: 1.6; }
.olp-ld-faixa .olp-ld-acoes { margin-top: 0; }

/* Passo a passo (linha do tempo) */
.olp-ld-passos { max-width: 760px; margin: 40px auto 0; }
.olp-ld-passo { display: grid; grid-template-columns: 48px 1fr; column-gap: 20px; }
.olp-ld-passo-marca { display: flex; flex-direction: column; align-items: center; }
.olp-ld-passo-bola { width: 48px; height: 48px; border-radius: 999px; background: var(--ld-escura); color: var(--ld-destaque); border: 2px solid var(--ld-destaque); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.olp-ld-passo-bola img { width: 24px; height: 24px; object-fit: contain; }
.olp-ld-passo-linha { width: 2px; flex: 1; min-height: 24px; background: linear-gradient(180deg, var(--ld-destaque), var(--ld-escura)); }
.olp-ld-passo-corpo { padding: 10px 0 34px; }
.olp-ld-passo:last-child .olp-ld-passo-corpo { padding-bottom: 8px; }
.olp-ld-passo h3 { font-size: 18px; font-weight: 700; color: var(--ld-escura); margin-bottom: 6px; }
.olp-ld-passo p { font-size: 16px; line-height: 1.6; font-weight: 500; }

/* Galeria: carrossel com rolagem no celular, grade no tablet/desktop */
.olp-ld-galeria { display: grid; grid-auto-flow: column; grid-auto-columns: 84%; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 0 20px 6px; scrollbar-width: none; }
.olp-ld-galeria::-webkit-scrollbar { display: none; }
.olp-ld-galeria > * { scroll-snap-align: center; width: 100%; aspect-ratio: 1 / 1; border-radius: 18px; object-fit: cover; }

/* Depoimentos (fundo escuro) */
.olp-ld-depos { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 36px; text-align: left; }
.olp-ld-depo { border-radius: 18px; padding: 24px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); }
.olp-ld-depo p { font-size: 16px; line-height: 1.6; }
.olp-ld-depo strong { display: block; margin-top: 12px; font-family: ${FONTE_TITULO}; font-size: 16px; color: var(--ld-destaque); }
.olp-ld-estrelas { display: flex; gap: 3px; color: #FBBF24; margin-bottom: 10px; }

/* FAQ */
.olp-ld-faq { max-width: 720px; margin: 36px auto 0; display: flex; flex-direction: column; gap: 12px; }
.olp-ld-faq-item { background: #fff; border-radius: 12px; box-shadow: 0 1px 2px rgba(2,11,38,.05); }
.olp-ld-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; background: none; border: 0; cursor: pointer; text-align: left;
  font-family: ${FONTE_TITULO}; font-weight: 700; font-size: 16px; color: var(--ld-escura); }
.olp-ld-faq-q svg { flex-shrink: 0; transition: transform .2s; }
.olp-ld-faq-item[data-aberto="1"] .olp-ld-faq-q svg { transform: rotate(45deg); }
.olp-ld-faq-r { padding: 0 20px 18px; font-size: 16px; line-height: 1.6; font-weight: 500; }

/* Endereço */
.olp-ld-endereco { display: inline-flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 16px; color: var(--ld-escura); text-decoration: none; }
.olp-ld-endereco strong { font-weight: 700; }
a.olp-ld-endereco:hover { text-decoration: underline; }

/* Rodapé */
.olp-ld-rodape { padding: 30px 0; text-align: center; }
.olp-ld-rodape h3 { font-size: 18px; font-weight: 700; color: #fff; }
.olp-ld-rodape ul { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 26px; font-size: 16px; }
.olp-ld-rodape li { display: inline-flex; align-items: center; gap: 8px; }
.olp-ld-rodape li::before { content: ''; width: 6px; height: 6px; border-radius: 999px; background: var(--ld-destaque); }
.olp-ld-copy { padding: 14px 20px; text-align: center; font-size: 14px; font-weight: 700; background: var(--ld-destaque); color: var(--ld-escura); }

.olp-ld-vazio { background: #E5E7EB; color: #9CA3AF; display: flex; align-items: center; justify-content: center; }

/* ── Tablet ── */
@container olp-ld (min-width: 640px) {
  .olp-ld-wrap { padding: 0 32px; }
  .olp-ld-sec { padding: 72px 0; }
  .olp-ld-h1 { font-size: 42px; }
  .olp-ld-h2 { font-size: 36px; }
  .olp-ld-corpo { font-size: 17px; }

  .olp-ld-banner { display: flex; align-items: center; min-height: var(--ld-banner-alt-tab); }
  .olp-ld-banner-foto { position: absolute; top: 0; right: 0; bottom: 0; width: var(--ld-foto-larg-tab); height: auto; }
  .olp-ld-banner-foto::after {
    background:
      linear-gradient(90deg, var(--ld-fundo) 0%, var(--ld-fundo-0) var(--ld-degrade)),
      linear-gradient(0deg, var(--ld-fundo-60) 0%, var(--ld-fundo-0) 22%);
  }
  .olp-ld-banner-texto { width: 100%; max-width: 1180px; margin: 0 auto; padding: 64px 32px; text-align: left; }
  .olp-ld-banner-texto > * { max-width: var(--ld-texto-larg-tab); }
  .olp-ld-banner-texto .olp-ld-acoes { justify-content: flex-start; }
  .olp-ld-logo { margin: 0 0 24px; }

  .olp-ld-duo { grid-template-columns: 1fr 1fr; gap: 40px; }
  .olp-ld-duo-texto { text-align: left; }
  .olp-ld-duo-texto .olp-ld-acoes { justify-content: flex-start; }
  .olp-ld-duo-img { aspect-ratio: 4 / 5; }
  .olp-ld-contato .olp-ld-duo-texto { order: 2; }
  .olp-ld-form { margin-left: 0; }

  .olp-ld-cards { grid-template-columns: repeat(3, 1fr); }
  .olp-ld-cards[data-n="4"] { grid-template-columns: repeat(2, 1fr); }
  .olp-ld-cards[data-n="2"] { grid-template-columns: repeat(2, 1fr); }
  .olp-ld-cards[data-n="1"] { grid-template-columns: 1fr; }
  .olp-ld-faixa { flex-direction: row; text-align: left; justify-content: space-between; padding: 30px 32px; }

  .olp-ld-galeria { grid-auto-flow: row; grid-auto-columns: auto; grid-template-columns: repeat(3, 1fr); overflow: visible; padding: 0 32px; }

  .olp-ld-depos { grid-template-columns: repeat(2, 1fr); }
}

/* ── Desktop ── */
@container olp-ld (min-width: 1024px) {
  .olp-ld-sec { padding: 96px 0; }
  .olp-ld-h1 { font-size: 58px; line-height: 1.04; }
  .olp-ld-h2 { font-size: 46px; line-height: 1.08; }
  .olp-ld-corpo { font-size: 18px; }
  .olp-ld-banner { min-height: var(--ld-banner-alt-desk); }
  .olp-ld-banner-foto { width: var(--ld-foto-larg-desk); }
  .olp-ld-banner-texto > * { max-width: var(--ld-texto-larg-desk); }
  .olp-ld-duo { gap: 64px; }
  .olp-ld-cards { gap: 20px; }
  .olp-ld-cards[data-n="4"] { grid-template-columns: repeat(4, 1fr); }
  .olp-ld-faixa { padding: 32px 40px; }
  .olp-ld-galeria { gap: 16px; }
  .olp-ld-depos { grid-template-columns: repeat(3, 1fr); }
  .olp-ld-depos[data-n="2"] { grid-template-columns: repeat(2, 1fr); }
  .olp-ld-depos[data-n="1"] { grid-template-columns: 1fr; max-width: 640px; margin-left: auto; margin-right: auto; }
}

@media (prefers-reduced-motion: reduce) { .olp-ld-btn, .olp-ld-faq-q svg { transition: none; } }
`

// ─── Peças ──────────────────────────────────────────────────────────────────

function Imagem({ src, className }) {
  if (src) return <img src={src} alt="" className={className} />
  return <div className={`${className} olp-ld-vazio`}><ImageIcon size={32} /></div>
}

function Titulo({ como: Tag = 'h2', className, texto, destaque, padrao }) {
  const principal = texto || (destaque ? '' : padrao)
  return (
    <Tag className={className}>
      {principal}
      {principal && destaque ? ' ' : ''}
      {destaque && <span className="olp-ld-dest">{destaque}</span>}
    </Tag>
  )
}

// Botão principal: abre o WhatsApp do template; sem número, rola até a seção de contato
// (onde fica o formulário de lead).
function BotaoAcao({ texto, wpp, irParaContato }) {
  if (wpp) {
    return (
      <a href={wpp} target="_blank" rel="noopener noreferrer" className="olp-ld-btn">
        <IconeWhatsApp />{texto}
      </a>
    )
  }
  return <button type="button" onClick={irParaContato} className="olp-ld-btn">{texto}</button>
}

// Banner com degradê cor sólida ↔ foto. `fundo` = cor sólida; `escuro` define a cor do texto.
function BannerDegrade({ secao, fundo, imagem, degrade, alturaDesk, alturaTab, larguraFotoDesk, larguraFotoTab, larguraTextoDesk, larguraTextoTab, className = '', children }) {
  const estilo = {
    '--ld-fundo': fundo,
    '--ld-fundo-0': rgba(fundo, 0),
    '--ld-fundo-60': rgba(fundo, 0.6),
    // Largura do degradê: no desktop/tablet, em % da largura da foto; no celular, da altura.
    '--ld-degrade': `${degrade}%`,
    '--ld-degrade-cel': `${Math.max(30, Math.min(85, degrade + 5))}%`,
    '--ld-banner-alt-desk': alturaDesk,
    '--ld-banner-alt-tab': alturaTab,
    '--ld-foto-larg-desk': larguraFotoDesk,
    '--ld-foto-larg-tab': larguraFotoTab,
    '--ld-texto-larg-desk': larguraTextoDesk,
    '--ld-texto-larg-tab': larguraTextoTab,
  }
  return (
    <section data-secao={secao} className={`olp-ld-banner ${className}`} style={estilo}>
      <div className="olp-ld-banner-foto"><Imagem src={imagem} /></div>
      <div className="olp-ld-banner-texto">{children}</div>
    </section>
  )
}

function ItemFaq({ item }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="olp-ld-faq-item" data-aberto={aberto ? '1' : '0'}>
      <button type="button" className="olp-ld-faq-q" aria-expanded={aberto} onClick={() => setAberto(a => !a)}>
        {item.pergunta}
        <Plus size={20} />
      </button>
      {aberto && item.resposta && <p className="olp-ld-faq-r">{item.resposta}</p>}
    </div>
  )
}

function IconeItem({ item, Padrao, size }) {
  if (item?.icone_url) return <img src={item.icone_url} alt="" />
  return Padrao ? <Padrao size={size} strokeWidth={1.75} /> : null
}

const lista = (valor, padrao) => (Array.isArray(valor) && valor.length > 0 ? valor : padrao)
const temTexto = v => typeof v === 'string' ? v.trim() !== '' : Boolean(v)

// ─── Página ─────────────────────────────────────────────────────────────────

export function LeaderRender({ conteudo, onLead, FormularioLead }) {
  useFontesLeader()
  const c = conteudo || {}
  const escura = hexParaRgb(c.cor_escura) ? c.cor_escura : LEADER_COR_ESCURA
  const destaque = hexParaRgb(c.cor_destaque) ? c.cor_destaque : LEADER_COR_DESTAQUE
  const degrade = Number.isFinite(Number(c.degrade_largura)) && c.degrade_largura !== '' && c.degrade_largura != null
    ? Number(c.degrade_largura) : LEADER_DEGRADE_PADRAO

  const numero = numeroWhatsApp(c.whatsapp_numero)
  const wpp = numero ? linkWhatsApp(numero, c.whatsapp_mensagem || 'Olá! Vim pela página e gostaria de mais informações.') : null
  const textoBotao = c.botao_texto || 'Falar pelo WhatsApp'

  const servicos = lista(c.servicos, LEADER_SERVICOS_PADRAO).slice(0, 4)
  const passos = lista(c.passos, LEADER_PASSOS_PADRAO)
  const faq = lista(c.faq, LEADER_FAQ_PADRAO).filter(f => temTexto(f?.pergunta))
  const depoimentos = (Array.isArray(c.depoimentos) ? c.depoimentos : []).filter(d => temTexto(d?.texto)).slice(0, 3)
  const rodapeItens = lista(c.rodape_itens, LEADER_RODAPE_ITENS_PADRAO).filter(temTexto)
  const galeria = [c.galeria_1, c.galeria_2, c.galeria_3]

  // Texto em cima do fundo claro: a cor de destaque pura (ciano) pode ficar fraca demais;
  // escurece um pouco só pra texto, mantendo o tom.
  const destaqueTexto = misturar(destaque, escura, 0.18)

  const estiloRaiz = {
    '--ld-escura': escura,
    '--ld-destaque': destaque,
    '--ld-destaque-texto': destaqueTexto,
    '--ld-texto': '#374151',
    '--ld-btn': `linear-gradient(90deg, ${destaque} 0%, ${misturar(destaque, '#000000', 0.48)} 100%)`,
    '--ld-caixa': `linear-gradient(90deg, ${escura} 0%, ${misturar(escura, '#1D3FD1', 0.35)} 100%)`,
  }

  function irParaContato(e) {
    const raiz = e.currentTarget.closest('.olp-ld')
    const alvo = raiz?.querySelector('[data-secao="contato"]')
    if (!alvo) return
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    alvo.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
  }

  const acaoPrincipal = <BotaoAcao texto={textoBotao} wpp={wpp} irParaContato={irParaContato} />

  return (
    <div lang="pt-BR" className="olp-ld" style={estiloRaiz}>
      <style>{CSS}</style>

      {/* Topo: cor escura → foto da loja */}
      <BannerDegrade
        secao="hero" className="olp-ld-hero" fundo={escura} imagem={c.hero_imagem} degrade={degrade}
        alturaDesk="660px" alturaTab="540px" larguraFotoDesk="62%" larguraFotoTab="58%" larguraTextoDesk="640px" larguraTextoTab="62%"
      >
        {c.hero_logo && <img src={c.hero_logo} alt="" className="olp-ld-logo" />}
        <p className="olp-ld-selo">{c.hero_selo || 'Ótica · óculos de grau, sol e lentes de contato'}</p>
        <Titulo como="h1" className="olp-ld-h1" texto={c.hero_titulo} destaque={c.hero_titulo_destaque} padrao="Enxergue melhor ainda hoje." />
        <p className="olp-ld-corpo" style={{ color: 'rgba(255,255,255,.92)', marginTop: 20, maxWidth: 520 }}>
          {c.hero_texto || 'Atendimento consultivo, armação certa para o seu rosto e lentes indicadas para a sua rotina.'}
        </p>
        <div className="olp-ld-acoes">
          {acaoPrincipal}
          {/* Link secundário: endereço/mapa, se tiver; senão rola até a seção de contato. */}
          {c.hero_link_url
            ? <a href={c.hero_link_url} target="_blank" rel="noopener noreferrer" className="olp-ld-link">{c.hero_link_texto || 'ou visitar a loja'}</a>
            : <button type="button" onClick={irParaContato} className="olp-ld-link">{c.hero_link_texto || 'ou visitar a loja'}</button>}
        </div>
      </BannerDegrade>

      {/* O problema: imagem + texto */}
      <section data-secao="problema" className="olp-ld-sec olp-ld-claro">
        <div className="olp-ld-wrap olp-ld-duo">
          <Imagem src={c.problema_imagem} className="olp-ld-duo-img" />
          <div className="olp-ld-duo-texto">
            <p className="olp-ld-selo">{c.problema_selo || 'O problema'}</p>
            <Titulo className="olp-ld-h2" texto={c.problema_titulo} destaque={c.problema_titulo_destaque} padrao="Enxergar mal afeta muito mais do que parece." />
            <p className="olp-ld-corpo" style={{ marginTop: 20 }}>
              {c.problema_texto || 'Dor de cabeça, vista cansada, dificuldade para ler ou enxergar longe. Muita gente convive com isso por tanto tempo que nem percebe o quanto está perdendo.'}
            </p>
            <p className="olp-ld-caixa">{c.problema_caixa || 'Aqui é diferente.'}</p>
          </div>
        </div>
      </section>

      {/* A solução: fundo branco → foto */}
      <BannerDegrade
        secao="solucao" fundo="#FFFFFF" imagem={c.solucao_imagem} degrade={degrade}
        alturaDesk="680px" alturaTab="560px" larguraFotoDesk="58%" larguraFotoTab="50%" larguraTextoDesk="470px" larguraTextoTab="48%"
      >
        <p className="olp-ld-selo">{c.solucao_selo || 'A solução'}</p>
        <Titulo className="olp-ld-h2" texto={c.solucao_titulo} destaque={c.solucao_titulo_destaque} padrao="A ótica que resolve o seu problema de visão." />
        <p className="olp-ld-corpo" style={{ marginTop: 20 }}>
          {c.solucao_texto || 'Não viemos só vender óculos. O atendimento começa entendendo a sua rotina e o que você precisa enxergar melhor; a partir daí, indicamos a armação e as lentes ideais para o seu caso.'}
        </p>
      </BannerDegrade>

      {/* O que oferecemos */}
      <section data-secao="servicos" className="olp-ld-sec olp-ld-claro">
        <div className="olp-ld-wrap">
          <div className="olp-ld-centro">
            <p className="olp-ld-selo">{c.servicos_selo || 'O que oferecemos'}</p>
            <Titulo className="olp-ld-h2" texto={c.servicos_titulo} destaque={c.servicos_titulo_destaque} padrao="Tudo que você precisa para enxergar melhor" />
          </div>
          <div className="olp-ld-cards" data-n={servicos.length}>
            {servicos.map((s, i) => (
              <div key={i} className="olp-ld-card">
                <div className="olp-ld-icone"><IconeItem item={s} Padrao={LEADER_SERVICOS_ICONES[i % LEADER_SERVICOS_ICONES.length]} size={24} /></div>
                <h3>{s.titulo}</h3>
                {s.descricao && <p>{s.descricao}</p>}
              </div>
            ))}
          </div>
          <div className="olp-ld-faixa">
            <div>
              <h3>{c.faixa_titulo || 'Atendimento sem pressa'}</h3>
              <p>{c.faixa_texto || 'Tire suas dúvidas antes de sair de casa: respondemos pelo WhatsApp.'}</p>
            </div>
            <div className="olp-ld-acoes">{acaoPrincipal}</div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section data-secao="como_funciona" className="olp-ld-sec">
        <div className="olp-ld-wrap">
          <div className="olp-ld-centro">
            <p className="olp-ld-selo">{c.passos_selo || 'Como funciona'}</p>
            <Titulo className="olp-ld-h2" texto={c.passos_titulo} destaque={c.passos_titulo_destaque} padrao="Do atendimento ao óculos no rosto" />
          </div>
          <div className="olp-ld-passos">
            {passos.map((p, i) => (
              <div key={i} className="olp-ld-passo">
                <div className="olp-ld-passo-marca">
                  <div className="olp-ld-passo-bola"><IconeItem item={p} Padrao={LEADER_PASSOS_ICONES[i % LEADER_PASSOS_ICONES.length]} size={22} /></div>
                  {i < passos.length - 1 && <div className="olp-ld-passo-linha" />}
                </div>
                <div className="olp-ld-passo-corpo">
                  <h3>{p.titulo}</h3>
                  {p.descricao && <p>{p.descricao}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="olp-ld-acoes" style={{ justifyContent: 'center' }}>{acaoPrincipal}</div>
        </div>
      </section>

      {/* Fotos da loja */}
      <section data-secao="galeria" className="olp-ld-sec olp-ld-claro">
        <div className="olp-ld-galeria" style={{ maxWidth: 1180, margin: '0 auto' }}>
          {galeria.map((src, i) => <Imagem key={i} src={src} />)}
        </div>
      </section>

      {/* Prova social */}
      <section data-secao="prova_social" className="olp-ld-sec olp-ld-escuro">
        <div className="olp-ld-wrap olp-ld-centro">
          <p className="olp-ld-selo">{c.prova_selo || 'Prova social'}</p>
          <Titulo className="olp-ld-h2" texto={c.prova_titulo} destaque={c.prova_titulo_destaque} padrao="Clientes que chegaram com dor de cabeça e saíram enxergando." />
          <p className="olp-ld-corpo" style={{ marginTop: 20, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>
            {c.prova_texto || 'Depois dos óculos certos: menos dor de cabeça, mais disposição e a autoestima lá em cima.'}
          </p>
          {depoimentos.length > 0 && (
            <div className="olp-ld-depos" data-n={depoimentos.length}>
              {depoimentos.map((d, i) => (
                <div key={i} className="olp-ld-depo">
                  <div className="olp-ld-estrelas">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={18} fill="currentColor" />)}</div>
                  <p>{d.texto}</p>
                  {d.nome && <strong>{d.nome}</strong>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dúvidas frequentes */}
      <section data-secao="faq" className="olp-ld-sec olp-ld-claro">
        <div className="olp-ld-wrap">
          <div className="olp-ld-centro">
            <p className="olp-ld-selo">{c.faq_selo || 'Dúvidas frequentes'}</p>
            <Titulo className="olp-ld-h2" texto={c.faq_titulo} destaque={c.faq_titulo_destaque} padrao="Dúvidas que aparecem antes de escolher uma ótica" />
          </div>
          <div className="olp-ld-faq">
            {faq.map((f, i) => <ItemFaq key={i} item={f} />)}
          </div>
        </div>
      </section>

      {/* Venha nos visitar (seção de contato) */}
      <section data-secao="contato" className="olp-ld-sec olp-ld-contato" style={{ paddingBottom: 0 }}>
        <div className="olp-ld-wrap olp-ld-duo" style={{ alignItems: 'end' }}>
          <div className="olp-ld-duo-texto" style={{ alignSelf: 'center', paddingBottom: 40 }}>
            <p className="olp-ld-selo">{c.contato_selo || 'Venha nos visitar'}</p>
            <Titulo className="olp-ld-h2" texto={c.contato_titulo} destaque={c.contato_titulo_destaque} padrao="Hoje você ainda pode sair enxergando melhor." />
            <p className="olp-ld-corpo" style={{ marginTop: 20 }}>
              {c.contato_texto || 'Venha até a loja ou fale pelo WhatsApp. A gente cuida do resto, do atendimento à entrega dos óculos ajustados no seu rosto.'}
            </p>
            {wpp ? (
              <div className="olp-ld-acoes">{acaoPrincipal}</div>
            ) : (
              <div className="olp-ld-form">
                <FormularioLead ctaTexto={c.botao_texto || 'Quero ser atendido'} onLead={onLead} />
              </div>
            )}
            {temTexto(c.endereco_texto) && (
              <div>
                {c.endereco_url ? (
                  <a href={c.endereco_url} target="_blank" rel="noopener noreferrer" className="olp-ld-endereco">
                    <MapPin size={20} /><span>{c.endereco_texto}</span>
                  </a>
                ) : (
                  <span className="olp-ld-endereco"><MapPin size={20} /><span>{c.endereco_texto}</span></span>
                )}
              </div>
            )}
          </div>
          <Imagem src={c.contato_imagem} className="olp-ld-contato-img" />
        </div>
      </section>

      {/* Rodapé */}
      <footer data-secao="rodape">
        <div className="olp-ld-escuro olp-ld-rodape">
          <div className="olp-ld-wrap">
            <h3>{c.rodape_titulo || 'Sua ótica — óculos de grau, sol e lentes de contato'}</h3>
            {rodapeItens.length > 0 && <ul>{rodapeItens.map((t, i) => <li key={i}>{t}</li>)}</ul>}
          </div>
        </div>
        <p className="olp-ld-copy">{c.rodape_texto || `© ${new Date().getFullYear()} Todos os direitos reservados.`}</p>
      </footer>
    </div>
  )
}

// Mockup do card na galeria de criação: faixa escura que desbota na "foto".
export function LeaderCardPreview() {
  return (
    <div className="w-full h-24 rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="relative h-12" style={{ background: LEADER_COR_ESCURA }}>
        <div className="absolute inset-y-0 right-0 w-3/5 bg-slate-400" />
        <div className="absolute inset-y-0 right-0 w-3/5" style={{ background: `linear-gradient(90deg, ${LEADER_COR_ESCURA}, rgba(2,11,38,0))` }} />
        <div className="absolute left-2 top-2.5 h-1.5 w-12 rounded" style={{ background: '#fff' }} />
        <div className="absolute left-2 top-5 h-1.5 w-9 rounded" style={{ background: LEADER_COR_DESTAQUE }} />
        <div className="absolute left-2 bottom-2 h-2 w-10 rounded-full" style={{ background: LEADER_COR_DESTAQUE }} />
      </div>
      <div className="flex-1 bg-slate-50 p-1.5 flex gap-1">
        <div className="flex-1 rounded bg-white border border-gray-200" />
        <div className="flex-1 rounded bg-white border border-gray-200" />
        <div className="flex-1 rounded bg-white border border-gray-200" />
      </div>
    </div>
  )
}
