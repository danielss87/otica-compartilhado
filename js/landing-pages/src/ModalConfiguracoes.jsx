// Configurações que valem para TODAS as landing pages (botão "Configurações"
// da listagem). Formato espelhado de python/.../landing_pages/config.py.
import { useEffect, useRef, useState } from 'react'
import { X, Upload, Trash2, Globe, Activity } from 'lucide-react'
import { obterConfiguracoes, salvarConfiguracoes, uploadImagemLandingPage, testarAvaliacoesGoogle, listarLandingPages } from './api'
import { getConfig } from './config'
import { definirDominioProprio } from './dominio'
import { IconeWhatsApp } from './Moldura'
import { LogoGoogle, formatarNota } from './avaliacoesGoogle'
import { FONTES_MARCA } from './fontes'

const RASTREAMENTO_VAZIO = { ga4_id: '', ads_id: '', ads_rotulo_lead: '', ads_rotulo_whatsapp: '', hotjar_id: '', clarity_id: '' }

// Campos de Configurações → Rastreamento: [chave, rótulo, exemplo, onde achar]
const CAMPOS_RASTREAMENTO = [
  ['ga4_id', 'Google Analytics 4 (ID de medição)', 'G-AB12CD34EF', 'Analytics → Administrador → Fluxos de dados → o fluxo do site.'],
  ['ads_id', 'Google Ads (ID da tag)', 'AW-123456789', 'Google Ads → Metas → Conversões → a ação → Configurar tag.'],
  ['ads_rotulo_lead', 'Conversão "lead enviado" (rótulo)', 'AbCdEf123', 'O texto depois da barra em send_to: AW-123456789/AbCdEf123. Pode colar o send_to inteiro.'],
  ['ads_rotulo_whatsapp', 'Conversão "clique no WhatsApp" (rótulo)', 'XyZ789', 'Uma segunda ação de conversão no Google Ads, só para o clique no WhatsApp.'],
  ['hotjar_id', 'Hotjar (Site ID)', '3456789', 'Hotjar → Sites & Organizations. Grava sessões e mapas de calor.'],
  ['clarity_id', 'Microsoft Clarity (Project ID)', 'abcd1234ef', 'Clarity → Settings → Overview. Gratuito; grava sessões e mapas de calor.'],
]

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400'

function Interruptor({ ligado, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={label}
      onClick={() => onChange(!ligado)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${ligado ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${ligado ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

// `empresaId` (v0.22.0): as configurações são de uma empresa; 1 = a original do app.
export default function ModalConfiguracoes({ onClose, empresaId = 1 }) {
  const [cfg, setCfg] = useState(null)
  const [erroCarregar, setErroCarregar] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [enviandoLogo, setEnviandoLogo] = useState(false)
  const [enviandoFavicon, setEnviandoFavicon] = useState(false)
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)
  const inputLogo = useRef(null)
  const inputFavicon = useRef(null)
  const [testeGoogle, setTesteGoogle] = useState(null) // { carregando } | { ok: dados } | { erro }
  const [paginas, setPaginas] = useState([])
  const [testeDominio, setTesteDominio] = useState(null) // { carregando } | { ok } | { erro }

  useEffect(() => {
    obterConfiguracoes(empresaId).then(setCfg).catch(e => setErroCarregar(e.message))
    listarLandingPages().then(l => setPaginas(l.filter(p => (p.empresa_id || 1) === empresaId))).catch(() => {})
  }, [empresaId])

  function setDominio(campo, valor) {
    setCfg(c => ({ ...c, dominio: { endereco: '', pagina_inicial: '', ...c.dominio, [campo]: valor } }))
    setSalvo(false)
    if (campo === 'endereco') setTesteDominio(null)
  }

  // Só confere se o domínio já abre (DNS + certificado). `no-cors`: a resposta não é lida,
  // basta não dar erro de rede.
  async function handleTestarDominio() {
    const endereco = (cfg.dominio?.endereco || '').trim().replace(/^https?:\/\//, '').split('/')[0]
    setTesteDominio({ carregando: true })
    try {
      await fetch(`https://${endereco}/`, { mode: 'no-cors', cache: 'no-store' })
      setTesteDominio({ ok: true })
    } catch {
      setTesteDominio({ erro: true })
    }
  }

  function setWhatsapp(campo, valor) {
    setCfg(c => ({ ...c, whatsapp: { ...c.whatsapp, [campo]: valor } }))
    setSalvo(false)
  }

  function setMenu(campo, valor) {
    setCfg(c => ({ ...c, menu: { ...c.menu, [campo]: valor } }))
    setSalvo(false)
  }

  function setRastreamento(campo, valor) {
    setCfg(c => ({ ...c, rastreamento: { ...RASTREAMENTO_VAZIO, ...c.rastreamento, [campo]: valor } }))
    setSalvo(false)
  }

  function setGoogle(campo, valor) {
    setCfg(c => ({ ...c, google: { busca: '', nota_minima: 4, ...c.google, [campo]: valor } }))
    setSalvo(false)
    if (campo === 'busca') setTesteGoogle(null)
  }

  async function handleTestarGoogle() {
    setTesteGoogle({ carregando: true })
    try {
      setTesteGoogle({ ok: await testarAvaliacoesGoogle(cfg.google?.busca || '') })
    } catch (e) {
      setTesteGoogle({ erro: e.message })
    }
  }

  function setNomeEmpresa(valor) {
    setCfg(c => ({ ...c, empresa: { ...c.empresa, nome: valor } }))
    setSalvo(false)
  }

  function setMarca(campo, url) {
    setCfg(c => ({ ...c, marca: { ...c.marca, [campo]: url } }))
    setSalvo(false)
  }
  const setLogo = (url) => setMarca('logo_url', url)

  async function handleFavicon(file) {
    if (!file) return
    setEnviandoFavicon(true)
    setErro('')
    try {
      const { url } = await uploadImagemLandingPage(file)
      setMarca('favicon_url', url)
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviandoFavicon(false)
      if (inputFavicon.current) inputFavicon.current.value = ''
    }
  }

  async function handleLogo(file) {
    if (!file) return
    setEnviandoLogo(true)
    setErro('')
    try {
      const { url } = await uploadImagemLandingPage(file)
      setLogo(url)
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviandoLogo(false)
      if (inputLogo.current) inputLogo.current.value = ''
    }
  }

  async function handleSalvar() {
    setSalvando(true)
    setErro('')
    try {
      const atualizado = await salvarConfiguracoes({
        whatsapp: cfg.whatsapp, marca: cfg.marca, menu: cfg.menu,
        ...(cfg.google ? { google: cfg.google } : {}),
        ...(cfg.dominio ? { dominio: cfg.dominio } : {}),
        ...(cfg.rastreamento ? { rastreamento: cfg.rastreamento } : {}),
        ...(cfg.empresa ? { empresa: cfg.empresa } : {}),
      }, empresaId)
      setCfg(atualizado)
      definirDominioProprio(atualizado.dominio?.endereco, empresaId)
      setSalvo(true)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Configurações</h2>
            <p className="text-xs text-gray-400">
              {empresaId === 1 && !cfg?.empresa?.nome ? 'Valem para todas as landing pages' : `Valem para as páginas de ${cfg?.empresa?.nome || 'esta empresa'}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {!cfg && !erroCarregar && <p className="text-sm text-gray-400 text-center py-6">Carregando...</p>}
          {erroCarregar && <p className="text-sm text-red-600 text-center py-6">{erroCarregar}</p>}

          {cfg && (
            <>
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full text-white" style={{ background: '#25D366' }}>
                      <IconeWhatsApp className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Botão de WhatsApp</p>
                      <p className="text-xs text-gray-500">Botão verde flutuante no canto inferior direito de todas as páginas.</p>
                    </div>
                  </div>
                  <Interruptor ligado={cfg.whatsapp.ativo} onChange={v => setWhatsapp('ativo', v)} label="Ativar botão de WhatsApp" />
                </div>
                <div className="space-y-3 pl-0 sm:pl-10">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Número do WhatsApp (com DDD)</label>
                      <input
                        value={cfg.whatsapp.numero}
                        onChange={e => setWhatsapp('numero', e.target.value)}
                        placeholder="(11) 99999-9999"
                        inputMode="tel"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Mensagem padrão</label>
                      <textarea
                        value={cfg.whatsapp.mensagem}
                        onChange={e => setWhatsapp('mensagem', e.target.value)}
                        rows={3}
                        placeholder="Olá! Vim pela página e gostaria de mais informações."
                        className={`${inputCls} resize-none`}
                      />
                      <p className="text-xs text-gray-400 mt-1">Já vem escrita quando o visitante abre a conversa.</p>
                    </div>
                    {cfg.whatsapp.ativo && (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Bolinha de notificação</p>
                        <p className="text-xs text-gray-400">Círculo vermelho pulsando no botão, como uma mensagem nova.</p>
                      </div>
                      <Interruptor ligado={cfg.whatsapp.notificacao !== false} onChange={v => setWhatsapp('notificacao', v)} label="Mostrar bolinha de notificação" />
                    </div>
                    )}
                    {cfg.whatsapp.ativo && (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Usar a mensagem de cada página</p>
                        <p className="text-xs text-gray-400">Se a página tem mensagem de WhatsApp própria, o botão flutuante usa ela, e dá para saber de qual página veio o contato. Sem mensagem própria, vai a padrão acima.</p>
                      </div>
                      <Interruptor ligado={Boolean(cfg.whatsapp.mensagem_da_pagina)} onChange={v => setWhatsapp('mensagem_da_pagina', v)} label="Usar a mensagem de cada página" />
                    </div>
                    )}
                </div>
              </section>

              <section className="space-y-3 pt-5 border-t border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Identidade de marca</p>
                  <p className="text-xs text-gray-500">O logo aparece no topo de todas as páginas, e o favicon na aba do navegador.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nome da empresa</label>
                  <input value={cfg.empresa?.nome || ''} onChange={e => setNomeEmpresa(e.target.value)} placeholder={empresaId === 1 ? 'Principal' : ''} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Fonte das páginas</label>
                  <select value={cfg.marca.fonte || ''} onChange={e => setMarca('fonte', e.target.value)} className={inputCls + ' bg-white'}>
                    <option value="">Padrão do modelo</option>
                    {FONTES_MARCA.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Vale para o modelo Leader; os outros modelos mantêm a própria fonte.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Título da aba do navegador</label>
                  <input value={cfg.marca.titulo || ''} onChange={e => setMarca('titulo', e.target.value)} placeholder="Ex: Otovida | Oftalmologia" className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Usado nas páginas que não têm título próprio (campo "Título da página" no editor).</p>
                </div>
                {cfg.marca.logo_url ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <img src={cfg.marca.logo_url} alt="Logo" className="h-12 w-auto max-w-[200px] object-contain" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button type="button" onClick={() => inputLogo.current?.click()} disabled={enviandoLogo} className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700">
                        <Upload size={13} /> {enviandoLogo ? 'Enviando...' : 'Trocar logo'}
                      </button>
                      <button type="button" onClick={() => setLogo(null)} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600">
                        <Trash2 size={13} /> Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputLogo.current?.click()}
                    disabled={enviandoLogo}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600"
                  >
                    <Upload size={14} />
                    {enviandoLogo ? 'Enviando...' : 'Enviar logo'}
                  </button>
                )}
                <p className="text-xs text-gray-400">Dica: PNG com fundo transparente fica melhor.</p>
                <input ref={inputLogo} type="file" accept="image/*" className="hidden" onChange={e => handleLogo(e.target.files?.[0])} />

                <div className="pt-2">
                  <p className="text-xs font-medium text-gray-700">Favicon</p>
                  <p className="text-xs text-gray-400 mb-2">O ícone pequeno que aparece na aba do navegador, em todas as páginas.</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-w-0">
                      {cfg.marca.favicon_url
                        ? <img src={cfg.marca.favicon_url} alt="Favicon" className="w-4 h-4 object-contain shrink-0" />
                        : <span className="w-4 h-4 rounded-sm bg-gray-300 shrink-0" />}
                      <span className="text-xs text-gray-500 truncate">{cfg.marca.favicon_url ? 'Seu favicon' : 'Favicon padrão do site'}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button type="button" onClick={() => inputFavicon.current?.click()} disabled={enviandoFavicon} className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700">
                        <Upload size={13} /> {enviandoFavicon ? 'Enviando...' : cfg.marca.favicon_url ? 'Trocar favicon' : 'Enviar favicon'}
                      </button>
                      {cfg.marca.favicon_url && (
                        <button type="button" onClick={() => setMarca('favicon_url', null)} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600">
                          <Trash2 size={13} /> Remover
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Use um PNG quadrado (ex: 512×512), com fundo transparente.</p>
                  <input ref={inputFavicon} type="file" accept="image/png,image/webp" className="hidden" onChange={e => handleFavicon(e.target.files?.[0])} />
                </div>
              </section>

              <section className="space-y-3 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Menu no topo</p>
                    <p className="text-xs text-gray-500">
                      No computador: logo à esquerda e um botão à direita. No celular: só o logo, centralizado.
                    </p>
                  </div>
                  <Interruptor ligado={cfg.menu.ativo} onChange={v => setMenu('ativo', v)} label="Ativar menu no topo" />
                </div>
                {cfg.menu.ativo && (
                  <div className="space-y-3">
                    {!cfg.marca.logo_url && (
                      <p className="text-xs text-amber-700">Envie o logo em "Identidade de marca" para ele aparecer no menu.</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Menu fixo no topo</p>
                        <p className="text-xs text-gray-400">O menu continua visível no topo da tela enquanto o visitante rola a página.</p>
                      </div>
                      <Interruptor ligado={cfg.menu.fixo === true} onChange={v => setMenu('fixo', v)} label="Manter o menu fixo no topo" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Animação no botão</p>
                        <p className="text-xs text-gray-400">O botão balança de leve a cada poucos segundos, para chamar a atenção do visitante.</p>
                      </div>
                      <Interruptor ligado={cfg.menu.cta_tilt === true} onChange={v => setMenu('cta_tilt', v)} label="Animar o botão do menu" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Texto do botão</label>
                      <input
                        value={cfg.menu.cta_texto}
                        onChange={e => setMenu('cta_texto', e.target.value)}
                        placeholder="Ex: Fale conosco"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">O botão leva para</label>
                      <div className="flex gap-2">
                        {[['whatsapp', 'WhatsApp'], ['contato', 'Seção de contato'], ['url', 'Um link']].map(([valor, rotulo]) => (
                          <button
                            key={valor}
                            type="button"
                            onClick={() => setMenu('cta_destino', valor)}
                            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                              cfg.menu.cta_destino === valor ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {rotulo}
                          </button>
                        ))}
                      </div>
                      {cfg.menu.cta_destino === 'whatsapp' && (
                        <p className="text-xs text-gray-400 mt-1">
                          Usa o número e a mensagem da seção "Botão de WhatsApp" (funciona mesmo com o botão flutuante desligado).
                        </p>
                      )}
                      {cfg.menu.cta_destino === 'contato' && (
                        <p className="text-xs text-gray-400 mt-1">
                          Rola a página, com transição suave, até a seção de contato. Cada página escolhe a sua no editor
                          (campo "Seção de contato"); sem escolha, vai para o formulário do modelo.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Cor do botão</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[['padrao', 'Padrão'], ['principal', 'Cor principal da página'], ['destaque', 'Cor de destaque da página']].map(([valor, rotulo]) => (
                          <button
                            key={valor}
                            type="button"
                            onClick={() => setMenu('cta_cor', valor)}
                            className={`rounded-lg border-2 px-2 py-2 text-xs font-medium leading-tight transition-colors ${
                              (cfg.menu.cta_cor || 'padrao') === valor ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {rotulo}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Padrão: verde quando leva ao WhatsApp, escuro nos outros casos. As cores da página acompanham as
                        cores escolhidas em cada landing page (modelos sem cor própria usam o escuro).
                      </p>
                    </div>
                    {cfg.menu.cta_destino === 'url' && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Link</label>
                        <input
                          value={cfg.menu.cta_url}
                          onChange={e => setMenu('cta_url', e.target.value)}
                          placeholder="https://..."
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="space-y-3 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200"><LogoGoogle size={18} /></span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Avaliações do Google</p>
                    <p className="text-xs text-gray-500">
                      Mostra as avaliações do seu Perfil da Empresa no Google na prova social das páginas. Cada página liga
                      no editor (Leader: "Prova social: avaliações do Google").
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Loja no Google</label>
                  <div className="flex gap-2">
                    <input
                      value={cfg.google?.busca || ''}
                      onChange={e => setGoogle('busca', e.target.value)}
                      placeholder="Ex: Ótica Exemplo, São Paulo SP (ou o Place ID)"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={handleTestarGoogle}
                      disabled={!(cfg.google?.busca || '').trim() || testeGoogle?.carregando}
                      className="shrink-0 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {testeGoogle?.carregando ? 'Buscando...' : 'Testar'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Nome da loja e cidade, como você buscaria no Google Maps. Em branco, desliga.</p>
                  {testeGoogle?.ok && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Encontrado: <strong>{testeGoogle.ok.nome}</strong>, nota {formatarNota(testeGoogle.ok.nota)} ({testeGoogle.ok.total} avaliações).
                      O Google libera até 5 avaliações; {testeGoogle.ok.avaliacoes.filter(a => a.texto && a.nota >= (cfg.google?.nota_minima || 1)).length} passam
                      na nota mínima.
                    </p>
                  )}
                  {testeGoogle?.erro && <p className="text-xs text-red-600 mt-1">{testeGoogle.erro}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Mostrar só avaliações a partir de</label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setGoogle('nota_minima', n)}
                        className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                          (cfg.google?.nota_minima ?? 4) === n ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {n} {n === 1 ? 'estrela' : 'estrelas'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">As avaliações são atualizadas sozinhas algumas vezes por dia.</p>
                </div>
              </section>
              <section className="space-y-3 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-700"><Globe size={16} /></span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Domínio próprio</p>
                    <p className="text-xs text-gray-500">
                      Publica as páginas num subdomínio do seu site (ex: lp.suaotica.com.br/promocao) em vez do endereço do sistema.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Endereço</label>
                  <div className="flex gap-2">
                    <input
                      value={cfg.dominio?.endereco || ''}
                      onChange={e => setDominio('endereco', e.target.value)}
                      placeholder="lp.suaotica.com.br"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={handleTestarDominio}
                      disabled={!(cfg.dominio?.endereco || '').trim() || testeDominio?.carregando}
                      className="shrink-0 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {testeDominio?.carregando ? 'Testando...' : 'Testar'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Só o endereço, sem https://. Em branco, os links continuam no endereço do sistema.</p>
                  {testeDominio?.ok && <p className="text-xs text-emerald-700 mt-1">O domínio está respondendo.</p>}
                  {testeDominio?.erro && (
                    <p className="text-xs text-amber-700 mt-1">
                      O domínio ainda não responde. Depois de configurar o DNS, pode levar de alguns minutos a algumas horas.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Página na raiz do domínio</label>
                  <select
                    value={cfg.dominio?.pagina_inicial || ''}
                    onChange={e => setDominio('pagina_inicial', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Nenhuma</option>
                    {paginas.map(p => (
                      <option key={p.id} value={p.slug}>
                        {p.nome}{p.status !== 'publicada' ? ' (não publicada)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">O que abre quando alguém acessa só o domínio, sem o nome da página.</p>
                </div>
                {getConfig().instrucoesDominio && (
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Como ligar o domínio</p>
                    <p className="text-xs text-gray-600 whitespace-pre-line">{getConfig().instrucoesDominio}</p>
                  </div>
                )}
              </section>
              <section className="space-y-3 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700"><Activity size={16} /></span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Rastreamento</p>
                    <p className="text-xs text-gray-500">
                      Mede visitas, cliques no WhatsApp e leads no Google Analytics e no Google Ads, e grava as sessões
                      (Hotjar ou Clarity). Preencha só o ID de cada ferramenta; em branco, não carrega.
                    </p>
                  </div>
                </div>
                {CAMPOS_RASTREAMENTO.map(([chave, rotulo, exemplo, ajuda]) => (
                  <div key={chave}>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">{rotulo}</label>
                    <input
                      value={cfg.rastreamento?.[chave] || ''}
                      onChange={e => setRastreamento(chave, e.target.value)}
                      placeholder={exemplo}
                      className={inputCls}
                      spellCheck={false}
                    />
                    <p className="text-xs text-gray-400 mt-1">{ajuda}</p>
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  Os eventos enviados são <span className="font-mono">whatsapp_clique</span> e <span className="font-mono">generate_lead</span>.
                  A pré-visualização do editor não conta.
                </p>
              </section>
            </>
          )}
          {erro && <p className="text-xs text-red-600">{erro}</p>}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          {salvo && <span className="text-xs text-emerald-600 mr-auto">Configurações salvas</span>}
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={!cfg || salvando || enviandoLogo || enviandoFavicon}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
