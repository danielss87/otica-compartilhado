import { getConfig } from './config'

// ─── Autenticado (painel) ───────────────────────────────────────────────────

function base() {
  return `${getConfig().apiUrl.replace(/\/$/, '')}/landing-pages`
}

function headers(extra = {}) {
  return { ...getConfig().getHeaders(), ...extra }
}

function req(url, opcoes = {}) {
  return getConfig().fetch(url, opcoes)
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || 'Erro na requisição')
  }
  if (res.status === 204) return null
  return res.json()
}

export async function listarTemplates() {
  return handle(await req(`${base()}/templates`, { headers: headers() }))
}

export async function listarLandingPages() {
  return handle(await req(base(), { headers: headers() }))
}

export async function obterLandingPage(id) {
  return handle(await req(`${base()}/${id}`, { headers: headers() }))
}

export async function criarLandingPage(payload) {
  return handle(await req(base(), {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }))
}

export async function atualizarLandingPage(id, payload) {
  return handle(await req(`${base()}/${id}`, {
    method: 'PUT',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }))
}

export async function publicarLandingPage(id) {
  return handle(await req(`${base()}/${id}/publicar`, { method: 'POST', headers: headers() }))
}

export async function pausarLandingPage(id) {
  return handle(await req(`${base()}/${id}/pausar`, { method: 'POST', headers: headers() }))
}

export async function duplicarLandingPage(id) {
  return handle(await req(`${base()}/${id}/duplicar`, { method: 'POST', headers: headers() }))
}

export async function deletarLandingPage(id) {
  return handle(await req(`${base()}/${id}`, { method: 'DELETE', headers: headers() }))
}

export async function listarLeadsLandingPage(id) {
  return handle(await req(`${base()}/${id}/leads`, { headers: headers() }))
}

export async function uploadImagemLandingPage(file) {
  const formData = new FormData()
  formData.append('imagem', file)
  return handle(await req(`${base()}/upload-imagem`, {
    method: 'POST',
    headers: headers(),
    body: formData,
  }))
}

// ─── Público (sem token) — página servida pra visitante anônimo ─────────────

function basePublica() {
  return `${getConfig().apiUrl.replace(/\/$/, '')}/publico/landing-pages`
}

async function handlePublico(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.detail || 'Erro na requisição')
    err.status = res.status
    throw err
  }
  return res.json()
}

// Tenta de novo enquanto o servidor está fora do ar (v0.18.0): sem resposta (rede) ou 5xx, como na
// troca de versão do backend, que leva ~20–60 s no Render. Erro "de verdade" (404, 422...) não repete.
// Espera crescente (1 s, 2 s, 4 s, até 8 s) até `limiteMs`; depois, devolve o último erro.
const esperar = ms => new Promise(r => setTimeout(r, ms))
async function comRetentativa(tentar, limiteMs) {
  const inicio = Date.now()
  let espera = 1000
  for (;;) {
    try {
      return await tentar()
    } catch (e) {
      const temporario = !e.status || e.status >= 500
      if (!temporario || Date.now() - inicio + espera > limiteMs) throw e
      await esperar(espera)
      espera = Math.min(espera * 2, 8000)
    }
  }
}

export async function buscarLandingPagePublica(slug) {
  return comRetentativa(async () => handlePublico(await fetch(`${basePublica()}/${slug}`)), 90000)
}

// Raiz do domínio próprio: a página escolhida como inicial (traz `slug`).
export async function buscarPaginaInicialPublica() {
  return buscarLandingPagePublica('_inicio')
}

export async function registrarVisualizacao(slug) {
  try {
    await fetch(`${basePublica()}/${slug}/visualizacao`, { method: 'POST' })
  } catch {
    // best-effort, não bloqueia a renderização da página
  }
}

// Lead não pode se perder: repete enquanto o servidor estiver fora do ar (o botão fica em "enviando").
export async function enviarLeadLandingPage(slug, payload) {
  return comRetentativa(async () => handlePublico(await fetch(`${basePublica()}/${slug}/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })), 60000)
}

// ─── Configurações gerais (valem para todas as landing pages) ──────────────

export async function obterConfiguracoes() {
  return handle(await req(`${base()}/configuracoes`, { headers: headers() }))
}

export async function salvarConfiguracoes(payload) {
  return handle(await req(`${base()}/configuracoes`, {
    method: 'PUT',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }))
}

// ─── Avaliações do Google (v0.15.0) ─────────────────────────────────────────

// Público: avaliações já filtradas para a página ({ ativo, nota, total, url, avaliacoes }).
export async function buscarAvaliacoesGoogle() {
  return handlePublico(await fetch(`${basePublica()}/avaliacoes-google`))
}

// Painel: consulta o Google agora com a busca digitada no modal (antes de salvar).
export async function testarAvaliacoesGoogle(busca) {
  return handle(await req(`${base()}/avaliacoes-google/teste?busca=${encodeURIComponent(busca)}`, { headers: headers() }))
}
