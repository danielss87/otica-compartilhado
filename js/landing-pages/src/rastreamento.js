// Rastreamento da página pública (v0.20.0): GA4 + Google Ads (gtag.js), Hotjar e Microsoft Clarity,
// a partir dos IDs de Configurações → Rastreamento (validados por formato no backend, nunca script livre).
// Só a página pública (LandingPageView) chama isto — a pré-visualização do editor não, para não
// sujar as métricas.

let iniciado = false
let cfgAtual = {}

function injetarScript(src) {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

export function iniciarRastreamento(rastreamento) {
  const r = rastreamento || {}
  cfgAtual = r
  if (iniciado || typeof window === 'undefined') return
  iniciado = true

  if (r.ga4_id || r.ads_id) {
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
    injetarScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(r.ga4_id || r.ads_id)}`)
    window.gtag('js', new Date())
    if (r.ga4_id) window.gtag('config', r.ga4_id)
    if (r.ads_id) window.gtag('config', r.ads_id)
  }

  if (r.hotjar_id) {
    window.hj = window.hj || function hj() { (window.hj.q = window.hj.q || []).push(arguments) }
    window._hjSettings = { hjid: Number(r.hotjar_id), hjsv: 6 }
    injetarScript(`https://static.hotjar.com/c/hotjar-${encodeURIComponent(r.hotjar_id)}.js?sv=6`)
  }

  if (r.clarity_id) {
    window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments) }
    injetarScript(`https://www.clarity.ms/tag/${encodeURIComponent(r.clarity_id)}`)
  }
}

// Evento para GA4/GTM (dataLayer) e, com `rotuloAds`, a conversão correspondente no Google Ads.
export function registrarEvento(nome, params = {}, rotuloAds) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: nome, ...params })
  if (!window.gtag) return
  window.gtag('event', nome, params)
  const rotulo = cfgAtual[rotuloAds]
  if (rotulo && cfgAtual.ads_id) {
    window.gtag('event', 'conversion', { send_to: `${cfgAtual.ads_id}/${rotulo}` })
  }
}

// ─── Origem do visitante ────────────────────────────────────────────────────
// Guardada na sessão ao abrir a página (sobrevive a recarregar/trocar de página) e enviada com o lead.

const PARAMS_ORIGEM = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const CHAVE_SESSAO = 'lp_origem'

function daUrl() {
  const url = new URLSearchParams(window.location.search)
  const r = {}
  PARAMS_ORIGEM.forEach(p => {
    const v = url.get(p)
    if (v) r[p] = v.slice(0, 255)
  })
  return r
}

// Chamar ao abrir a página. Chegou por outro anúncio/campanha: a origem nova substitui a antiga
// inteira (não mistura gclid de um clique com utm de outro).
export function guardarOrigem() {
  const r = daUrl()
  if (!Object.keys(r).length) return
  try {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(r))
  } catch {
    // modo privado / storage bloqueado: segue só com a URL
  }
}

export function origemDoVisitante() {
  let sessao = {}
  try {
    sessao = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || '{}')
  } catch {
    // idem
  }
  const r = daUrl()
  return Object.keys(r).length ? r : sessao
}

// Link de WhatsApp (wa.me, api.whatsapp.com, whatsapp://) — de qualquer botão de qualquer template.
export function ehLinkWhatsApp(href) {
  return /^(https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\/|whatsapp:)/i.test(href || '')
}
