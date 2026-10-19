import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Plus, X, Copy, CopyPlus, Trash2, Eye, Users, ExternalLink, Play, Pause, Check, Settings } from 'lucide-react'
import { TEMPLATE_LIST, TemplateCardPreview } from './templates'
import { getConfig } from './config'
import ModalConfiguracoes from './ModalConfiguracoes'
import {
  listarLandingPages, criarLandingPage, publicarLandingPage, pausarLandingPage,
  duplicarLandingPage, deletarLandingPage,
} from './api'

const STATUS_ESTILO = {
  rascunho: 'bg-gray-100 text-gray-600',
  publicada: 'bg-emerald-100 text-emerald-700',
  pausada: 'bg-amber-100 text-amber-700',
}
const STATUS_LABEL = { rascunho: 'Rascunho', publicada: 'Publicada', pausada: 'Pausada' }

function AvatarIniciais({ nome }) {
  const iniciais = (nome ?? '?').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  return (
    <div className="w-5 h-5 text-[10px] rounded-full bg-violet-100 text-violet-700 font-semibold flex items-center justify-center shrink-0">
      {iniciais}
    </div>
  )
}

export default function LandingPagesLista() {
  const navigate = useNavigate()
  const { rotaPainel, rotaPublica } = getConfig()
  const Avatar = getConfig().Avatar || AvatarIniciais
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalCriar, setModalCriar] = useState(false)
  const [modalConfig, setModalConfig] = useState(false)
  const [copiado, setCopiado] = useState(null)

  function carregar() {
    setCarregando(true)
    listarLandingPages().then(setItens).catch(() => {}).finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  async function handlePublicarPausar(lp) {
    try {
      if (lp.status === 'publicada') await pausarLandingPage(lp.id)
      else await publicarLandingPage(lp.id)
      carregar()
    } catch (e) { alert(e.message) }
  }

  async function handleDuplicar(lp) {
    try {
      const nova = await duplicarLandingPage(lp.id)
      carregar()
      navigate(`${rotaPainel}/${nova.id}`)
    } catch (e) { alert(e.message) }
  }

  async function handleExcluir(lp) {
    if (!window.confirm(`Excluir "${lp.nome}"? Essa ação não pode ser desfeita.`)) return
    try {
      await deletarLandingPage(lp.id)
      carregar()
    } catch (e) { alert(e.message) }
  }

  function copiarLink(slug) {
    const url = `${window.location.origin}${rotaPublica}/${slug}`
    navigator.clipboard?.writeText(url)
    setCopiado(slug)
    setTimeout(() => setCopiado(null), 1500)
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-violet-50 shrink-0">
              <Rocket size={18} className="text-violet-600" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 leading-tight">Landing Pages</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Páginas de captura por template</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModalConfig(true)}
            className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Settings size={15} />
            <span className="hidden sm:inline">Configurações</span>
          </button>
          <button
            onClick={() => setModalCriar(true)}
            className="flex items-center gap-2 bg-violet-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">Nova landing page</span>
            <span className="sm:hidden">Nova</span>
          </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {carregando ? (
          <p className="text-sm text-gray-400 text-center py-10">Carregando...</p>
        ) : itens.length === 0 ? (
          <div className="text-center py-16">
            <Rocket size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Nenhuma landing page ainda.</p>
            <button onClick={() => setModalCriar(true)} className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700">
              Criar a primeira
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itens.map(lp => (
              <div key={lp.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => navigate(`${rotaPainel}/${lp.id}`)}
                    className="text-left min-w-0"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate hover:text-violet-600">{lp.nome}</p>
                    <p className="text-xs text-gray-400 truncate">{rotaPublica}/{lp.slug}</p>
                  </button>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_ESTILO[lp.status]}`}>
                    {STATUS_LABEL[lp.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Eye size={13} /> {lp.visualizacoes}</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {lp.total_leads}</span>
                  {lp.criado_por_nome && (
                    <span className="flex items-center gap-1.5 ml-auto">
                      <Avatar nome={lp.criado_por_nome} fotoUrl={lp.criado_por_foto_url} size="xs" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handlePublicarPausar(lp)}
                    title={lp.status === 'publicada' ? 'Pausar' : 'Publicar'}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    {lp.status === 'publicada' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  {lp.status === 'publicada' && (
                    <>
                      <button onClick={() => copiarLink(lp.slug)} title="Copiar link" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                        {copiado === lp.slug ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                      <a href={`${rotaPublica}/${lp.slug}`} target="_blank" rel="noopener noreferrer" title="Abrir página" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                        <ExternalLink size={14} />
                      </a>
                    </>
                  )}
                  <button onClick={() => handleDuplicar(lp)} title="Duplicar" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <CopyPlus size={14} />
                  </button>
                  <button onClick={() => handleExcluir(lp)} title="Excluir" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 ml-auto">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalConfig && <ModalConfiguracoes onClose={() => setModalConfig(false)} />}

      {modalCriar && (
        <ModalEscolherTemplate
          onClose={() => setModalCriar(false)}
          onCriado={(lp) => navigate(`${rotaPainel}/${lp.id}`)}
        />
      )}
    </div>
  )
}

function ModalEscolherTemplate({ onClose, onCriado }) {
  const [nome, setNome] = useState('')
  const [templateId, setTemplateId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleCriar() {
    if (!nome.trim() || !templateId) return
    setSalvando(true)
    setErro('')
    try {
      const lp = await criarLandingPage({ nome: nome.trim(), template: templateId })
      onCriado(lp)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Nova landing page</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nome da página</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Promoção Dia das Mães"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Escolha um template</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TEMPLATE_LIST.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={`text-left rounded-xl border-2 p-3 transition-colors ${
                    templateId === t.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TemplateCardPreview templateId={t.id} />
                  <p className="text-sm font-semibold text-gray-900 mt-2">{t.nome}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.descricao}</p>
                </button>
              ))}
            </div>
          </div>
          {erro && <p className="text-xs text-red-600">{erro}</p>}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCriar}
            disabled={!nome.trim() || !templateId || salvando}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {salvando ? 'Criando...' : 'Criar e editar'}
          </button>
        </div>
      </div>
    </div>
  )
}
