import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LANDING_PAGE_TEMPLATES } from './templates'
import { buscarLandingPagePublica, registrarVisualizacao, enviarLeadLandingPage } from './api'
import { getConfig } from './config'

export default function LandingPageView() {
  const { slug } = useParams()
  const [lp, setLp] = useState(null)
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarLandingPagePublica(slug)
      .then(data => {
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
        registrarVisualizacao(slug)
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [slug])

  async function handleLead(payload) {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid') || undefined
    await enviarLeadLandingPage(slug, { ...payload, fbclid })
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
    <div className="min-h-screen bg-white">
      <template.Render conteudo={lp.conteudo || {}} onLead={handleLead} />
    </div>
  )
}
