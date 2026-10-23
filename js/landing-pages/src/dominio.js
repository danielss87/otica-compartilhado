// Domínio próprio (v0.19.0): com `dominio.endereco` nas configurações gerais, os links que o
// painel mostra/copia viram `https://<endereco>/<slug>`; sem ele, continuam no próprio app
// (`${origin}${rotaPublica}/<slug>`). O endereço é lido uma vez e compartilhado entre telas.
import { useEffect, useState } from 'react'
import { obterConfiguracoes } from './api'
import { getConfig } from './config'

let dominio = null // null = ainda não carregado; '' = sem domínio próprio
let carregando = null
const ouvintes = new Set()

// Chamar depois de salvar as configurações, para as telas abertas atualizarem os links.
export function definirDominioProprio(endereco) {
  dominio = endereco || ''
  ouvintes.forEach(f => f(dominio))
}

function carregar() {
  if (!carregando) {
    carregando = obterConfiguracoes()
      .then(c => definirDominioProprio(c?.dominio?.endereco))
      .catch(() => { carregando = null })
  }
}

export function urlPublica(slug, endereco) {
  return endereco ? `https://${endereco}/${slug}` : `${window.location.origin}${getConfig().rotaPublica}/${slug}`
}

// Devolve `slug => URL pública` (atualiza sozinho quando o domínio carrega ou muda).
export function useUrlPublica() {
  const [endereco, setEndereco] = useState(dominio)
  useEffect(() => {
    ouvintes.add(setEndereco)
    if (dominio === null) carregar()
    else setEndereco(dominio)
    return () => { ouvintes.delete(setEndereco) }
  }, [])
  return slug => urlPublica(slug, endereco)
}

export const semProtocolo = url => url.replace(/^https?:\/\//, '')
