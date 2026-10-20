import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Play, Pause, Copy, Check, Upload, X, Plus, Trash2 } from 'lucide-react'
import { LANDING_PAGE_TEMPLATES, coresDaPagina, secaoContatoDaPagina } from './templates'
import { getConfig } from './config'
import MolduraLandingPage from './Moldura'
import {
  obterLandingPage, atualizarLandingPage, publicarLandingPage, pausarLandingPage,
  uploadImagemLandingPage, obterConfiguracoes,
} from './api'

export default function LandingPageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rotaPainel, rotaPublica } = getConfig()
  const [lp, setLp] = useState(null)
  const [nome, setNome] = useState('')
  const [conteudo, setConteudo] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const saveTimeout = useRef(null)
  // Configurações gerais (logo, botão de WhatsApp) — só pra pré-visualização ficar igual à página pública.
  const [configuracoes, setConfiguracoes] = useState(null)

  useEffect(() => {
    obterConfiguracoes().then(setConfiguracoes).catch(() => {})
  }, [])

  useEffect(() => {
    obterLandingPage(id).then(data => {
      setLp(data)
      setNome(data.nome)
      setConteudo(data.conteudo || {})
    }).catch(() => {}).finally(() => setCarregando(false))
  }, [id])

  const salvar = useCallback((novoNome, novoConteudo) => {
    setSalvando(true)
    atualizarLandingPage(id, { nome: novoNome, conteudo: novoConteudo })
      .then(setLp)
      .catch(() => {})
      .finally(() => setSalvando(false))
  }, [id])

  function agendarSalvar(novoNome, novoConteudo) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => salvar(novoNome, novoConteudo), 900)
  }

  function handleCampoChange(chave, valor) {
    const novo = { ...conteudo, [chave]: valor }
    setConteudo(novo)
    agendarSalvar(nome, novo)
  }

  function handleNomeChange(valor) {
    setNome(valor)
    agendarSalvar(valor, conteudo)
  }

  async function handlePublicarPausar() {
    try {
      const atualizado = lp.status === 'publicada' ? await pausarLandingPage(id) : await publicarLandingPage(id)
      setLp(atualizado)
    } catch (e) { alert(e.message) }
  }

  function copiarLink() {
    navigator.clipboard?.writeText(`${window.location.origin}${rotaPublica}/${lp.slug}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  if (carregando) return <div className="p-10 text-center text-sm text-gray-400">Carregando...</div>
  if (!lp) return <div className="p-10 text-center text-sm text-gray-400">Landing page não encontrada.</div>

  const template = LANDING_PAGE_TEMPLATES[lp.template]

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate(rotaPainel)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
              <ArrowLeft size={18} />
            </button>
            <input
              value={nome}
              onChange={e => handleNomeChange(e.target.value)}
              className="text-sm font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 truncate"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400 hidden sm:inline">{salvando ? 'Salvando...' : 'Salvo'}</span>
            {lp.status === 'publicada' && (
              <button onClick={copiarLink} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Copiar link público">
                {copiado ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            )}
            <button
              onClick={handlePublicarPausar}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                lp.status === 'publicada' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {lp.status === 'publicada' ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Publicar</>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 p-4 sm:p-6">
        <div className="space-y-4">
          <CamposPagina lp={lp} nome={nome} onNomeChange={handleNomeChange} onSalvo={setLp} rotaPublica={rotaPublica} />

          {template.secoes?.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Seção de contato</label>
              <select
                value={secaoContatoDaPagina(lp.template, conteudo) || ''}
                onChange={e => handleCampoChange('secao_contato', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {template.secoes.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.nome}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Para onde a página rola quando o botão do menu está configurado para "levar à seção de contato".
              </p>
            </div>
          )}

          {template.campos.map(campo => (
            <CampoEditor key={campo.chave} campo={campo} valor={conteudo[campo.chave]} onChange={v => handleCampoChange(campo.chave, v)} />
          ))}

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <p className="text-xs font-medium text-gray-500">SEO (aba do navegador)</p>
            <MetaCampos lp={lp} onSalvo={setLp} />
          </div>
        </div>

        <div className="mt-4 lg:mt-0">
          <p className="text-xs font-medium text-gray-500 mb-2">Pré-visualização</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 flex items-center gap-1.5 border-b border-gray-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <MolduraLandingPage
                configuracoes={configuracoes}
                preview
                secaoContato={secaoContatoDaPagina(lp.template, conteudo)}
                coresPagina={coresDaPagina(lp.template, conteudo)}
              >
                <template.Render conteudo={conteudo} />
              </MolduraLandingPage>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mesma regra de `_slug` no backend (router.py): sem acento, minúsculo, o resto vira "-".
// `final=false` enquanto digita (mantém o "-" do fim para dar pra continuar a palavra).
function normalizarSlug(texto, final = false) {
  let s = (texto || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  if (final) s = s.replace(/^-+|-+$/g, '').slice(0, 80)
  return s
}

function CamposPagina({ lp, nome, onNomeChange, onSalvo, rotaPublica }) {
  const [slug, setSlug] = useState(lp.slug)
  const [salvandoSlug, setSalvandoSlug] = useState(false)
  const [erroSlug, setErroSlug] = useState('')
  const slugFinal = normalizarSlug(slug, true)
  const mudou = slugFinal && slugFinal !== lp.slug

  async function salvarSlug() {
    if (!mudou || salvandoSlug) return
    setSalvandoSlug(true)
    setErroSlug('')
    try {
      const atualizado = await atualizarLandingPage(lp.id, { slug: slugFinal })
      onSalvo(atualizado)
      setSlug(atualizado.slug)
    } catch (e) {
      setErroSlug(e.message)
    } finally {
      setSalvandoSlug(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Nome da página</label>
        <input
          value={nome}
          onChange={e => onNomeChange(e.target.value)}
          placeholder="Ex: Promoção Dia das Mães"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Endereço da página</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-1 min-w-0 items-center rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-violet-400">
            <span className="pl-3 text-sm text-gray-400 whitespace-nowrap">{rotaPublica}/</span>
            <input
              value={slug}
              onChange={e => { setSlug(normalizarSlug(e.target.value)); setErroSlug('') }}
              onKeyDown={e => { if (e.key === 'Enter') salvarSlug() }}
              placeholder="promocao-dia-das-maes"
              className="flex-1 min-w-0 bg-transparent px-1 py-2 text-sm focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={salvarSlug}
            disabled={!mudou || salvandoSlug}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 shrink-0"
          >
            {salvandoSlug ? 'Salvando...' : 'Salvar endereço'}
          </button>
        </div>
        {erroSlug && <p className="text-xs text-red-600 mt-1">{erroSlug}</p>}
        {!erroSlug && mudou && lp.status === 'publicada' && (
          <p className="text-xs text-amber-700 mt-1">
            A página está publicada: links já divulgados com o endereço antigo vão parar de funcionar.
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1 break-all">
          {window.location.origin}{rotaPublica}/{slugFinal || lp.slug}
        </p>
      </div>
    </div>
  )
}

function MetaCampos({ lp, onSalvo }) {
  const [metaTitulo, setMetaTitulo] = useState(lp.meta_titulo || '')
  const [metaDescricao, setMetaDescricao] = useState(lp.meta_descricao || '')
  const timeout = useRef(null)

  function agendar(novoTitulo, novaDescricao) {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      atualizarLandingPage(lp.id, { meta_titulo: novoTitulo, meta_descricao: novaDescricao }).then(onSalvo).catch(() => {})
    }, 900)
  }

  return (
    <div className="space-y-2">
      <input
        value={metaTitulo}
        onChange={e => { setMetaTitulo(e.target.value); agendar(e.target.value, metaDescricao) }}
        placeholder="Título da aba (ex: Promoção de inverno)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
      <textarea
        value={metaDescricao}
        onChange={e => { setMetaDescricao(e.target.value); agendar(metaTitulo, e.target.value) }}
        placeholder="Descrição curta (aparece em compartilhamentos)"
        rows={2}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
      />
    </div>
  )
}

function CampoEditor({ campo, valor, onChange }) {
  if (campo.tipo === 'texto_curto') {
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
        <input
          value={valor ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={campo.placeholder}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>
    )
  }
  if (campo.tipo === 'texto_longo') {
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
        <textarea
          value={valor ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={campo.placeholder}
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        />
      </div>
    )
  }
  if (campo.tipo === 'imagem') {
    return <CampoImagem campo={campo} valor={valor} onChange={onChange} />
  }
  if (campo.tipo === 'lista') {
    return <CampoLista campo={campo} valor={valor} onChange={onChange} />
  }
  if (campo.tipo === 'lista_faq') {
    return <CampoFaq campo={campo} valor={valor} onChange={onChange} />
  }
  if (campo.tipo === 'cor') {
    return <CampoCor campo={campo} valor={valor} onChange={onChange} />
  }
  if (campo.tipo === 'intensidade') {
    return <CampoIntensidade campo={campo} valor={valor} onChange={onChange} />
  }
  if (campo.tipo === 'bloco') {
    return <CampoBloco campo={campo} valor={valor} onChange={onChange} />
  }
  if (campo.tipo === 'lista_features') {
    return <CampoListaFeatures campo={campo} valor={valor} onChange={onChange} />
  }
  if (campo.tipo === 'lista_depoimentos') {
    return <CampoListaDepoimentos campo={campo} valor={valor} onChange={onChange} />
  }
  return null
}

// Controle deslizante numérico (ex: película escura do hero, em %). `valor` vazio = `campo.padrao`.
function CampoIntensidade({ campo, valor, onChange }) {
  const atual = valor === undefined || valor === null || valor === '' ? campo.padrao : Number(valor)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-500">{campo.label}</label>
        <span className="text-xs font-semibold text-gray-700 tabular-nums">{atual}{campo.unidade || ''}</span>
      </div>
      <input
        type="range"
        min={campo.min ?? 0}
        max={campo.max ?? 100}
        step={campo.passo ?? 1}
        value={atual}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-violet-600"
        aria-label={campo.label}
      />
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>{campo.rotuloMin}</span>
        {atual !== campo.padrao && (
          <button type="button" onClick={() => onChange(campo.padrao)} className="text-violet-600 hover:text-violet-700">
            Voltar ao padrão ({campo.padrao}{campo.unidade || ''})
          </button>
        )}
        <span>{campo.rotuloMax}</span>
      </div>
    </div>
  )
}

function CampoCor({ campo, valor, onChange }) {
  const cor = valor || campo.padrao || '#000000'
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={cor}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
        />
        <input
          value={cor}
          onChange={e => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>
    </div>
  )
}

function CampoBloco({ campo, valor, onChange }) {
  const v = valor || {}

  function set(chave, texto) {
    onChange({ ...v, [chave]: texto })
  }

  return (
    <div className="rounded-lg border border-gray-200 p-3 space-y-2">
      <label className="text-xs font-medium text-gray-500 block">{campo.label}</label>
      <input
        value={v.titulo || ''}
        onChange={e => set('titulo', e.target.value)}
        placeholder="Título do bloco"
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
      <textarea
        value={v.texto || ''}
        onChange={e => set('texto', e.target.value)}
        placeholder="Texto (opcional)"
        rows={2}
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
      />
      {campo.semCta !== true && (
        <div className="flex gap-2">
          <input
            value={v.cta_texto || ''}
            onChange={e => set('cta_texto', e.target.value)}
            placeholder="Texto do botão (opcional)"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <input
            value={v.cta_url || ''}
            onChange={e => set('cta_url', e.target.value)}
            placeholder="Link (opcional)"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      )}
    </div>
  )
}

// Lista vazia = a página mostra os textos de exemplo do template (`campo.padrao`).
// O editor mostra esses mesmos itens, pra que dê pra editar o que aparece na página;
// a primeira edição grava a lista inteira em `conteudo`.
function listaOuPadrao(valor, campo) {
  if (Array.isArray(valor) && valor.length > 0) return valor
  return Array.isArray(campo.padrao) ? campo.padrao : []
}

function CampoListaFeatures({ campo, valor, onChange }) {
  const itens = listaOuPadrao(valor, campo)
  const [enviando, setEnviando] = useState(null)
  const inputIcone = useRef(null)
  const alvoIcone = useRef(null)

  async function handleIcone(file) {
    const i = alvoIcone.current
    if (!file || i == null) return
    setEnviando(i)
    try {
      const { url } = await uploadImagemLandingPage(file)
      atualizarItem(i, 'icone_url', url)
    } catch (e) {
      alert(e.message)
    } finally {
      setEnviando(null)
      if (inputIcone.current) inputIcone.current.value = ''
    }
  }

  function atualizarItem(i, chave, texto) {
    const novo = [...itens]
    novo[i] = { ...(novo[i] || {}), [chave]: texto }
    onChange(novo)
  }

  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
      <div className="space-y-2">
        {itens.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <IconeSelo
                item={item}
                IconePadrao={campo.icones?.[i % campo.icones.length]}
                enviando={enviando === i}
                onTrocar={() => { alvoIcone.current = i; inputIcone.current?.click() }}
                onRemover={() => atualizarItem(i, 'icone_url', null)}
              />
              <input
                value={item?.titulo || ''}
                onChange={e => atualizarItem(i, 'titulo', e.target.value)}
                placeholder="Título curto (ex: FEITO À MÃO)"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button onClick={() => removerItem(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={item?.descricao || ''}
              onChange={e => atualizarItem(i, 'descricao', e.target.value)}
              placeholder="Descrição curta"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...itens, { titulo: '', descricao: '' }])}
          className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
        >
          <Plus size={13} /> Adicionar
        </button>
        <p className="text-xs text-gray-400">
          Clique no ícone para trocar. Use PNG com fundo transparente: qualquer tamanho é ajustado automaticamente.
        </p>
      </div>
      <input ref={inputIcone} type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={e => handleIcone(e.target.files?.[0])} />
    </div>
  )
}

// Ícone do selo no editor: o PNG enviado ou o ícone padrão do template. Clicar troca.
function IconeSelo({ item, IconePadrao, enviando, onTrocar, onRemover }) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onTrocar}
        disabled={enviando}
        title="Trocar ícone"
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-violet-400 hover:text-violet-600"
      >
        {enviando ? <Upload size={14} className="animate-pulse" />
          : item?.icone_url ? <img src={item.icone_url} alt="" className="w-6 h-6 object-contain" />
          : IconePadrao ? <IconePadrao size={18} strokeWidth={1.75} />
          : <Upload size={14} />}
      </button>
      {item?.icone_url && !enviando && (
        <button
          type="button"
          onClick={onRemover}
          title="Voltar ao ícone padrão"
          className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow border border-gray-200 text-gray-500 hover:text-red-600"
        >
          <X size={10} />
        </button>
      )}
    </div>
  )
}

function CampoListaDepoimentos({ campo, valor, onChange }) {
  const itens = listaOuPadrao(valor, campo)

  function atualizarItem(i, chave, texto) {
    const novo = [...itens]
    novo[i] = { ...(novo[i] || {}), [chave]: texto }
    onChange(novo)
  }

  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
      <div className="space-y-2">
        {itens.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <textarea
                value={item?.texto || ''}
                onChange={e => atualizarItem(i, 'texto', e.target.value)}
                placeholder="Texto do depoimento"
                rows={2}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
              <button onClick={() => removerItem(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
            <input
              value={item?.nome || ''}
              onChange={e => atualizarItem(i, 'nome', e.target.value)}
              placeholder="Nome de quem falou"
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...itens, { texto: '', nome: '' }])}
          className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
        >
          <Plus size={13} /> Adicionar depoimento
        </button>
      </div>
    </div>
  )
}

function CampoImagem({ campo, valor, onChange }) {
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    setEnviando(true)
    try {
      const { url } = await uploadImagemLandingPage(file)
      onChange(url)
    } catch (e) {
      alert(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
      {valor ? (
        <div className="relative inline-block">
          <img src={valor} alt="" className="h-24 rounded-lg border border-gray-200 object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-gray-200 text-gray-500 hover:text-red-600"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600"
        >
          <Upload size={14} />
          {enviando ? 'Enviando...' : 'Enviar imagem'}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
    </div>
  )
}

function CampoLista({ campo, valor, onChange }) {
  const itens = Array.isArray(valor) ? valor : []

  function atualizarItem(i, texto) {
    const novo = [...itens]
    novo[i] = texto
    onChange(novo)
  }

  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
      <div className="space-y-1.5">
        {itens.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={item}
              onChange={e => atualizarItem(i, e.target.value)}
              placeholder={campo.placeholder}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button onClick={() => removerItem(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...itens, ''])}
          className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>
    </div>
  )
}

function CampoFaq({ campo, valor, onChange }) {
  const itens = Array.isArray(valor) ? valor : []

  function atualizarItem(i, campoNome, texto) {
    const novo = [...itens]
    novo[i] = { ...(novo[i] || {}), [campoNome]: texto }
    onChange(novo)
  }

  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{campo.label}</label>
      <div className="space-y-3">
        {itens.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input
                value={item?.pergunta || ''}
                onChange={e => atualizarItem(i, 'pergunta', e.target.value)}
                placeholder="Pergunta"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button onClick={() => removerItem(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={item?.resposta || ''}
              onChange={e => atualizarItem(i, 'resposta', e.target.value)}
              placeholder="Resposta"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...itens, { pergunta: '', resposta: '' }])}
          className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
        >
          <Plus size={13} /> Adicionar pergunta
        </button>
      </div>
    </div>
  )
}
