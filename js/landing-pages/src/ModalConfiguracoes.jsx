// Configurações que valem para TODAS as landing pages (botão "Configurações"
// da listagem). Formato espelhado de python/.../landing_pages/config.py.
import { useEffect, useRef, useState } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'
import { obterConfiguracoes, salvarConfiguracoes, uploadImagemLandingPage } from './api'
import { IconeWhatsApp } from './Moldura'

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

export default function ModalConfiguracoes({ onClose }) {
  const [cfg, setCfg] = useState(null)
  const [erroCarregar, setErroCarregar] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [enviandoLogo, setEnviandoLogo] = useState(false)
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)
  const inputLogo = useRef(null)

  useEffect(() => {
    obterConfiguracoes().then(setCfg).catch(e => setErroCarregar(e.message))
  }, [])

  function setWhatsapp(campo, valor) {
    setCfg(c => ({ ...c, whatsapp: { ...c.whatsapp, [campo]: valor } }))
    setSalvo(false)
  }

  function setMenu(campo, valor) {
    setCfg(c => ({ ...c, menu: { ...c.menu, [campo]: valor } }))
    setSalvo(false)
  }

  function setLogo(url) {
    setCfg(c => ({ ...c, marca: { ...c.marca, logo_url: url } }))
    setSalvo(false)
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
      const atualizado = await salvarConfiguracoes({ whatsapp: cfg.whatsapp, marca: cfg.marca, menu: cfg.menu })
      setCfg(atualizado)
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
            <p className="text-xs text-gray-400">Valem para todas as landing pages</p>
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
                </div>
              </section>

              <section className="space-y-3 pt-5 border-t border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Identidade de marca</p>
                  <p className="text-xs text-gray-500">O logo aparece no topo de todas as páginas.</p>
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
            disabled={!cfg || salvando || enviandoLogo}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
