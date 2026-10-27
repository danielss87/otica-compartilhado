// Código invisível no texto do WhatsApp (v0.21.0) — liga a conversa que chega no WhatsApp da loja ao
// clique na landing page (e ao gclid/UTM de quem clicou).
//
// Ligado só com `configurarLandingPages({ rastreioWhatsApp: { url } })`; sem isso, nada muda.
// Formato: 6 dígitos hex (24 bits) → 12 caracteres zero-width (2 bits cada, nesta ordem) entre dois
// marcadores U+2063, logo depois da 1ª palavra do texto pré-preenchido. Quem decodifica é o app
// (no Ariel: backend/app/services/origem_site_service.py, o mesmo formato do popup.js do site).
// Mudar o formato aqui exige mudar o decodificador do app.

const SIMBOLOS = ['​', '‌', '‍', '⁠']
const MARCADOR = '⁣'

export function gerarCodigo() {
  const b = new Uint8Array(3)
  crypto.getRandomValues(b)
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('')
}

export function invisivel(codigo) {
  const bits = parseInt(codigo, 16)
  let s = MARCADOR
  for (let i = 11; i >= 0; i--) s += SIMBOLOS[(bits >> (2 * i)) & 3]
  return s + MARCADOR
}

// URL do WhatsApp com o código no parâmetro `text` (após a 1ª palavra; sem texto, "Olá!" + código).
// Monta a query na mão: URLSearchParams troca espaço por "+", que o WhatsApp pode mostrar literal.
// Devolve { url, texto } — `texto` é a mensagem original, sem o código (null se não havia).
export function marcarLinkWhatsApp(url, codigo) {
  const m = url.match(/([?&]text=)([^&#]*)/)
  const texto = m ? decodeURIComponent(m[2].replace(/\+/g, ' ')) : ''
  if (texto.includes(MARCADOR)) return { url, texto }
  const novo = texto ? texto.replace(/^(\s*\S+)/, `$1${invisivel(codigo)}`) : `Olá!${invisivel(codigo)}`
  const enc = encodeURIComponent(novo)
  const marcada = m
    ? url.replace(m[0], m[1] + enc)
    : url.replace(/(#.*)?$/, hash => `${url.includes('?') ? '&' : '?'}text=${enc}${hash || ''}`)
  return { url: marcada, texto: texto || null }
}

function lerCookieGA() {
  const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.([^;]+)/)
  return m ? m[1] : null
}

// Registra o clique no app. Corpo como string (text/plain): o navegador não faz preflight de CORS,
// então funciona mesmo com a API em outro domínio. Nunca atrapalha o clique.
export function registrarCodigoWhatsApp(url, codigo, mensagem, origem) {
  const dados = {
    codigo,
    pagina_url: window.location.href,
    pagina_titulo: document.title,
    pagina_entrada: window.location.href,
    referrer: document.referrer || null,
    mensagem,
    ga_client_id: lerCookieGA(),
    mobile: /Mobi|Android|iPhone/i.test(navigator.userAgent),
    ...origem,
  }
  const corpo = JSON.stringify(dados)
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, corpo)) return
  } catch {
    // segue para o fetch
  }
  try {
    fetch(url, { method: 'POST', body: corpo, mode: 'no-cors', keepalive: true }).catch(() => {})
  } catch {
    // best-effort
  }
}
