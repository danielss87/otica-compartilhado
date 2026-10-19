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

export async function buscarLandingPagePublica(slug) {
  return handlePublico(await fetch(`${basePublica()}/${slug}`))
}

export async function registrarVisualizacao(slug) {
  try {
    await fetch(`${basePublica()}/${slug}/visualizacao`, { method: 'POST' })
  } catch {
    // best-effort, não bloqueia a renderização da página
  }
}

export async function enviarLeadLandingPage(slug, payload) {
  return handlePublico(await fetch(`${basePublica()}/${slug}/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }))
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
