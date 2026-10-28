import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LANDING_PAGE_TEMPLATES, coresDaPagina, secaoContatoDaPagina } from './templates'
import { definirPaginaDasAvaliacoes } from './avaliacoesGoogle'
import { buscarLandingPagePublica, buscarPaginaInicialPublica, registrarVisualizacao, enviarLeadLandingPage, registrarCliqueWhatsApp } from './api'
import { iniciarRastreamento, registrarEvento, guardarOrigem, origemDoVisitante, ehLinkWhatsApp } from './rastreamento'
import { getConfig } from './config'
import { gerarCodigo, marcarLinkWhatsApp, registrarCodigoWhatsApp } from './codigoWhatsApp'
import MolduraLandingPage from './Moldura'

// Troca o favicon do site pelo das configurações gerais enquanto a página está aberta.
// Tira os <link rel="icon"> do app (senão o navegador pode ficar com o dele) e os devolve ao sair.
function useFavicon(url) {
  useEffect(() => {
    if (!url) return
    const originais = [...document.querySelectorAll('link[rel~="icon"]')]
    originais.forEach(el => el.remove())
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = url
    document.head.appendChild(link)
    return () => {
      link.remove()
      originais.forEach(el => document.head.appendChild(el))
    }
  }, [url])
}

// `inicial`: raiz do domínio próprio — abre a página escolhida em Configurações → Domínio próprio.
export default function LandingPageView({ inicial = false }) {
  const { slug: slugDaRota } = useParams()
  const [lp, setLp] = useState(null)
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    guardarOrigem()
  }, [])

  useEffect(() => {
    const busca = inicial ? buscarPaginaInicialPublica() : buscarLandingPagePublica(slugDaRota)
    busca
      .then(data => {
        definirPaginaDasAvaliacoes(data.slug || slugDaRota)
        setLp(data)
        document.title = data.meta_titulo || data.nome || getConfig().tituloPadrao
        if (data.meta_descricao) {
          let meta = document.querySelector('meta[name="description"]')
          if (!meta) {
            meta = document.createElement('meta')
            meta.name = 'description'
            document.head.appendChild(meta)
          }
          meta.content = data.meta_descricao
        }
        registrarVisualizacao(data.slug || slugDaRota)
        iniciarRastreamento(data.configuracoes?.rastreamento)
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [inicial, slugDaRota])

  const slug = lp?.slug || slugDaRota

  useFavicon(lp?.configuracoes?.marca?.favicon_url)

  async function handleLead(payload) {
    await enviarLeadLandingPage(slug, { ...payload, ...origemDoVisitante() })
    registrarEvento('generate_lead', { landing_page: slug }, 'ads_rotulo_lead')
  }

  // Clique em qualquer link de WhatsApp da página (botão flutuante, menu, botões dos templates).
  // Fase de captura: conta antes de o navegador sair para o WhatsApp.
  function handleClique(e) {
    const a = e.target.closest?.('a[href]')
    // O href original fica guardado: cada clique gera um código novo a partir dele
    const original = a?.getAttribute('data-lp-href') || a?.getAttribute('href')
    if (!a || !ehLinkWhatsApp(original)) return
    registrarCliqueWhatsApp(slug)
    registrarEvento('whatsapp_clique', { landing_page: slug }, 'ads_rotulo_whatsapp')
    const destino = getConfig().rastreioWhatsApp?.url
    if (destino) {
      try {
        const codigo = gerarCodigo()
        const { url, texto } = marcarLinkWhatsApp(original, codigo)
        a.setAttribute('data-lp-href', original)
        a.setAttribute('href', url)  // antes da navegação: o handler roda na fase de captura
        registrarCodigoWhatsApp(destino, codigo, texto, origemDoVisitante())
      } catch {
        // qualquer erro: o clique segue com o link original
      }
    }
  }

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Carregando...</div>
  }

  if (erro || !lp) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <p className="text-sm text-gray-500">Essa página não está mais disponível.</p>
      </div>
    )
  }

  const template = LANDING_PAGE_TEMPLATES[lp.template]
  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <p className="text-sm text-gray-500">Essa página não está mais disponível.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" onClickCapture={handleClique}>
      <MolduraLandingPage
        configuracoes={lp.configuracoes}
        secaoContato={secaoContatoDaPagina(lp.template, lp.conteudo)}
        coresPagina={coresDaPagina(lp.template, lp.conteudo)}
        mensagemPagina={lp.conteudo?.whatsapp_mensagem}
      >
        <template.Render conteudo={lp.conteudo || {}} onLead={handleLead} />
      </MolduraLandingPage>
    </div>
  )
}
