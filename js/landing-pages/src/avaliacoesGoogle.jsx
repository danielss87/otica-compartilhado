// Avaliações do Google (v0.15.0): peças reutilizáveis para a prova social de qualquer template.
// O backend busca na Places API, guarda em cache e filtra pela nota mínima das configurações
// gerais; aqui só se lê `/publico/landing-pages/avaliacoes-google`.
//
// Para usar num template: um campo `tipo: 'opcoes'` que liga a seção (ex: `prova_google`),
// `useAvaliacoesGoogle(ligado)` no Render e as peças abaixo no visual do próprio template.
// Sem avaliações (desligado, sem chave, Google fora do ar), o hook devolve null e o template
// mostra o que mostrava antes (ex: depoimentos escritos à mão).
import { useEffect, useState } from 'react'
import { buscarAvaliacoesGoogle } from './api'

// Uma busca por carregamento da página, compartilhada entre componentes (e entre as
// re-renderizações da pré-visualização do editor).
// A loja no Google é da empresa dona da página (v0.22.0), então a busca leva o slug. Quem abre a
// página (visualização pública ou editor) chama `definirPaginaDasAvaliacoes` antes de renderizar o template.
let slugAtual = ''
let promessa = null
export function definirPaginaDasAvaliacoes(slug) {
  if (slug !== slugAtual) { slugAtual = slug || ''; promessa = null }
}
function carregar() {
  if (!promessa) {
    promessa = buscarAvaliacoesGoogle(slugAtual)
      .then(d => (d?.ativo && d.avaliacoes?.length ? d : null))
      .catch(() => { promessa = null; return null })
  }
  return promessa
}

export function useAvaliacoesGoogle(ligado) {
  const [dados, setDados] = useState(null)
  useEffect(() => {
    if (!ligado) { setDados(null); return }
    let vivo = true
    carregar().then(d => { if (vivo) setDados(d) })
    return () => { vivo = false }
  }, [ligado])
  return ligado ? dados : null
}

// "4,8"
export function formatarNota(nota) {
  return Number(nota || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// "G" colorido do Google (atribuição exigida ao mostrar avaliações do Google).
export function LogoGoogle({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

// Foto do autor (vem do Google) ou a inicial do nome.
export function FotoAutor({ avaliacao, size = 40 }) {
  const [falhou, setFalhou] = useState(false)
  const estilo = { width: size, height: size, borderRadius: 999, flexShrink: 0 }
  if (avaliacao.foto_url && !falhou) {
    return <img src={avaliacao.foto_url} alt="" style={{ ...estilo, objectFit: 'cover' }} referrerPolicy="no-referrer" onError={() => setFalhou(true)} />
  }
  return (
    <span style={{ ...estilo, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#5F6368', color: '#fff', fontWeight: 700, fontSize: size * 0.45 }}>
      {(avaliacao.autor || '?').trim().charAt(0).toUpperCase()}
    </span>
  )
}
