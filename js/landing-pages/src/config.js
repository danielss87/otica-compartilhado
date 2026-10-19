// Configuração do app hospedeiro — chamar `configurarLandingPages` uma vez,
// no boot do frontend (main.jsx), antes de renderizar as rotas.
//
// Tudo que difere entre Ariel e 4 Olhos entra por aqui; o resto do pacote é
// idêntico nos dois sistemas.

const padrao = {
  // Base da API, JÁ com o "/api" (ex: "https://backend.onrender.com/api").
  apiUrl: '',
  // Headers de auth do painel (ex: () => ({ Authorization: `Bearer ${token}` })).
  getHeaders: () => ({}),
  // fetch usado nas chamadas autenticadas (ex: um fetch com retry de cold start).
  fetch: (...args) => fetch(...args),
  // Rota do painel (listagem; o editor é `${rotaPainel}/:id`) e prefixo da rota pública.
  rotaPainel: '/marketing/landing-pages',
  rotaPublica: '/lp',
  // Campo de telefone do formulário de lead ({ value, onChange, placeholder }).
  // Sem isso, usa um <input type="tel"> simples.
  TelefoneInput: null,
  // Avatar de quem criou a página ({ nome, fotoUrl, size }). Sem isso, iniciais.
  Avatar: null,
  // Título da aba na página pública quando a LP não tem meta_titulo nem nome.
  tituloPadrao: '',
}

let config = { ...padrao }

export function configurarLandingPages(opcoes = {}) {
  config = { ...padrao, ...opcoes }
}

export function getConfig() {
  return config
}
