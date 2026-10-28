// Domínio próprio (v0.19.0): com `dominio.endereco` nas configurações gerais, os links que o
// painel mostra/copia viram `https://<endereco>/<slug>`; sem ele, continuam no próprio app
// (`${origin}${rotaPublica}/<slug>`). O endereço é lido uma vez e compartilhado entre telas.
import { useEffect, useState } from 'react'
import { listarEmpresas } from './api'
import { getConfig } from './config'

// Cada empresa (v0.22.0) tem o próprio domínio: `dominios` é id da empresa → endereço.
let dominios = null // null = ainda não carregado; {} = nenhuma empresa com domínio próprio
let carregando = null
const ouvintes = new Set()

// Chamar depois de salvar as configurações, para as telas abertas atualizarem os links.
export function definirDominioProprio(endereco, empresaId = 1) {
  dominios = { ...(dominios || {}), [empresaId]: endereco || '' }
  ouvintes.forEach(f => f(dominios))
}

function carregar() {
  if (!carregando) {
    carregando = listarEmpresas()
      .then(lista => {
        dominios = Object.fromEntries(lista.map(e => [e.id, e.dominio || '']))
        ouvintes.forEach(f => f(dominios))
      })
      .catch(() => { carregando = null })
  }
}

export function urlPublica(slug, endereco) {
  return endereco ? `https://${endereco}/${slug}` : `${window.location.origin}${getConfig().rotaPublica}/${slug}`
}

// Devolve `(slug, empresaId = 1) => URL pública` (atualiza sozinho quando o domínio carrega ou muda).
export function useUrlPublica() {
  const [mapa, setMapa] = useState(dominios)
  useEffect(() => {
    ouvintes.add(setMapa)
    if (dominios === null) carregar()
    else setMapa(dominios)
    return () => { ouvintes.delete(setMapa) }
  }, [])
  return (slug, empresaId = 1) => urlPublica(slug, mapa?.[empresaId] || '')
}

export const semProtocolo = url => url.replace(/^https?:\/\//, '')
