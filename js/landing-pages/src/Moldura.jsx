import { estiloFonte, useFonteDaMarca } from './fontes'
import { useRef } from 'react'

// Moldura comum a TODAS as landing pages: logo no topo e botão flutuante de
// WhatsApp, vindos das configurações gerais (GET /landing-pages/configuracoes;
// na página pública chegam junto com a página, em `configuracoes`).
// Usada na página pública e na pré-visualização do editor, pra nunca divergirem.

// Ícone oficial do WhatsApp — Simple Icons (CC0).
const WHATSAPP_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'

export function IconeWhatsApp({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={WHATSAPP_PATH} />
    </svg>
  )
}

export function linkWhatsApp(numero, mensagem) {
  // `text=` montado com encodeURIComponent (espaço vira %20; "+" o WhatsApp pode mostrar literal).
  return `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}`
}

// Pulso suave da bolinha de notificação — keyframes próprios (mais lento e discreto
// que o animate-ping do Tailwind) e desligado pra quem pede menos movimento.
const ESTILO_PULSO = `
@keyframes otica-lp-pulso {
  0% { transform: scale(1); opacity: .55; }
  70% { transform: scale(2.1); opacity: 0; }
  100% { transform: scale(2.1); opacity: 0; }
}
.otica-lp-pulso { animation: otica-lp-pulso 2.2s ease-out infinite; }
@media (prefers-reduced-motion: reduce) { .otica-lp-pulso { animation: none; opacity: 0; } }
`
const COR_NOTIFICACAO = '#FF4B2B'

// Menu no topo (v0.12.0): o conteúdo do menu fica numa faixa central de no máximo 1180px (a mesma
// largura do conteúdo dos templates), pra logo e botão não ficarem colados nos cantos em tela larga.
// O formato (só logo centralizado no celular; logo + botão a partir de 640px) segue a largura da
// janela (`data-modo="janela"`) ou, na pré-visualização de templates responsivos por container, a
// largura simulada (`data-modo="container"`). O container fica num wrapper que é o próprio
// elemento sticky (sticky só gruda dentro do pai). Nunca pôr `container-type` num ancestral do
// botão flutuante: vira bloco de contenção do `fixed` e o botão some do canto da tela.
const ESTILO_MENU = `
.otica-lp-menu[data-modo="container"] { container: otica-lp-menu / inline-size; }
.otica-lp-menu-int { box-sizing: border-box; width: 100%; max-width: 1180px; margin: 0 auto; min-height: 64px; padding: 12px 20px;
  display: flex; align-items: center; justify-content: center; gap: 16px; }
.otica-lp-menu-cta { display: none; flex-shrink: 0; white-space: nowrap; }
@media (min-width: 640px) {
  .otica-lp-menu[data-modo="janela"] .otica-lp-menu-int { justify-content: space-between; padding: 12px 32px; }
  .otica-lp-menu[data-modo="janela"] .otica-lp-menu-cta { display: inline-flex; }
}
@container otica-lp-menu (min-width: 640px) {
  .otica-lp-menu-int { justify-content: space-between; padding: 12px 32px; }
  .otica-lp-menu-cta { display: inline-flex; }
}
`

// "Tilt" do botão do menu (menu.cta_tilt): balança rápido e fica parado o resto do ciclo
// (~0,7s de movimento a cada 4s), pra chamar atenção sem cansar. Para no hover e pra quem
// pede menos movimento.
const ESTILO_TILT = `
@keyframes otica-lp-tilt {
  0%, 82%, 100% { transform: rotate(0deg) scale(1); }
  85% { transform: rotate(-4deg) scale(1.04); }
  88% { transform: rotate(4deg) scale(1.04); }
  91% { transform: rotate(-3deg) scale(1.03); }
  94% { transform: rotate(2deg) scale(1.02); }
  97% { transform: rotate(0deg) scale(1); }
}
.otica-lp-tilt { animation: otica-lp-tilt 4s ease-in-out 1.5s infinite; }
.otica-lp-tilt:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .otica-lp-tilt { animation: none; } }
`

function BolinhaNotificacao() {
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5" aria-hidden="true">
      <style>{ESTILO_PULSO}</style>
      <span className="otica-lp-pulso absolute inline-flex h-full w-full rounded-full" style={{ background: COR_NOTIFICACAO }} />
      <span
        className="relative inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold leading-none text-white ring-2 ring-white"
        style={{ background: COR_NOTIFICACAO }}
      >
        1
      </span>
    </span>
  )
}

function BotaoWhatsApp({ href, notificacao }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      title="Falar no WhatsApp"
      className="relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-transform hover:scale-105"
      style={{ background: '#25D366' }}
    >
      <IconeWhatsApp />
      {notificacao && <BolinhaNotificacao />}
    </a>
  )
}

// Menu no topo: logo à esquerda + CTA à direita no desktop; só o logo, centralizado, no celular.
// Rolagem suave até um elemento, com easing (easeInOutCubic, ~0,9s) — como o "scroll to
// section" do Unbounce. Rola o ancestral rolável mais próximo (a área de pré-visualização no
// editor) ou a janela (página pública). Sem animação pra quem pede menos movimento.
function ancestralRolavel(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p)
    if ((overflowY === 'auto' || overflowY === 'scroll') && p.scrollHeight > p.clientHeight) return p
  }
  return null
}

export function rolarSuaveAte(el, { duracao = 900, folga = 16 } = {}) {
  if (!el) return
  const caixa = ancestralRolavel(el)
  const inicio = caixa ? caixa.scrollTop : window.scrollY
  const topoRelativo = caixa
    ? el.getBoundingClientRect().top - caixa.getBoundingClientRect().top
    : el.getBoundingClientRect().top
  const maximo = caixa ? caixa.scrollHeight - caixa.clientHeight : document.documentElement.scrollHeight - window.innerHeight
  const destino = Math.max(0, Math.min(maximo, inicio + topoRelativo - folga))
  const rolar = (y) => (caixa ? (caixa.scrollTop = y) : window.scrollTo(0, y))
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return rolar(destino)
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const t0 = performance.now()
  const passo = (agora) => {
    const t = Math.min(1, (agora - t0) / duracao)
    rolar(inicio + (destino - inicio) * easeInOutCubic(t))
    if (t < 1) requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)
}

// Cor do botão do menu: "padrao" (verde se WhatsApp, escuro nos outros) ou a cor
// principal/de destaque da própria página (`coresDaPagina` em templates.jsx).
function corDoCta(menu, coresPagina) {
  if (menu.cta_cor === 'principal' && coresPagina?.principal) return coresPagina.principal
  if (menu.cta_cor === 'destaque' && coresPagina?.destaque) return coresPagina.destaque
  return menu.cta_destino === 'whatsapp' ? '#25D366' : '#111827'
}

// `whatsapp`: config do botão de WhatsApp. A página pública já recebe `menu.cta_url` pronto
// (calculado no backend, `config.publica`); o editor recebe a config completa e monta aqui.
function MenuTopo({ logo, menu, whatsapp, mensagemWhatsApp, coresPagina, onIrParaContato, refMenu, porContainer }) {
  const vaiProContato = menu.cta_destino === 'contato'
  const ctaUrl = vaiProContato
    ? '#contato'
    : menu.cta_destino === 'whatsapp' && whatsapp?.numero
      ? linkWhatsApp(whatsapp.numero, mensagemWhatsApp)
      : menu.cta_url
  const cta = menu.cta_texto && ctaUrl
  const ehWhatsapp = menu.cta_destino === 'whatsapp'
  return (
    <div
      ref={refMenu}
      data-modo={porContainer ? 'container' : 'janela'}
      className={`otica-lp-menu bg-white border-b border-gray-100 ${menu.fixo ? 'sticky top-0 z-40' : ''}`}
    >
      <style>{ESTILO_MENU}</style>
      <header className="otica-lp-menu-int">
        {logo ? <img src={logo} alt="Logo" className="h-10 sm:h-11 w-auto max-w-[200px] object-contain" /> : <span />}
        {cta && (
          <a
            href={ctaUrl}
            {...(vaiProContato
              ? { onClick: (e) => { e.preventDefault(); onIrParaContato() } }
              : { target: '_blank', rel: 'noopener noreferrer' })}
            className={`otica-lp-menu-cta items-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold text-white transition-opacity hover:opacity-90 ${
              menu.cta_tilt ? 'otica-lp-tilt' : ''
            }`}
            style={{ background: corDoCta(menu, coresPagina) }}
          >
            {menu.cta_tilt && <style>{ESTILO_TILT}</style>}
            {ehWhatsapp && <IconeWhatsApp className="w-5 h-5" />}
            {menu.cta_texto}
          </a>
        )}
      </header>
    </div>
  )
}

// `preview`: dentro do editor o botão fica preso ao canto da área de rolagem da
// pré-visualização (sticky), em vez de `fixed` na janela inteira.
// `secaoContato`: id do bloco (`data-secao`) que é a seção de contato desta página;
// `coresPagina`: { principal, destaque } desta página. Ambos vêm de templates.jsx.
// `mensagemPagina`: mensagem do WhatsApp da própria página (`conteudo.whatsapp_mensagem`, sem o padrão do
// modelo); com `whatsapp.mensagem_da_pagina` ligado, o botão flutuante e o do menu usam ela no lugar da padrão.
// `porContainer`: só na pré-visualização de template com `responsivoPorContainer` — o menu segue a
// largura simulada (celular/tablet/desktop) em vez da largura da janela.
export default function MolduraLandingPage({ configuracoes, preview = false, secaoContato = null, coresPagina = null, mensagemPagina = '', porContainer = false, children }) {
  useFonteDaMarca(configuracoes?.marca?.fonte)
  const raiz = useRef(null)
  const refMenu = useRef(null)
  const logo = configuracoes?.marca?.logo_url
  const w = configuracoes?.whatsapp
  const mensagem = (w?.mensagem_da_pagina && mensagemPagina?.trim()) || w?.mensagem
  const wpp = w?.ativo && w?.numero ? linkWhatsApp(w.numero, mensagem) : null
  const menu = configuracoes?.menu
  const notificacao = w?.notificacao !== false

  return (
    <div ref={raiz} className="bg-white" style={estiloFonte(configuracoes?.marca?.fonte)}>
      {menu?.ativo && (
        <MenuTopo
          logo={logo}
          menu={menu}
          whatsapp={w}
          mensagemWhatsApp={mensagem}
          coresPagina={coresPagina}
          refMenu={refMenu}
          porContainer={porContainer}
          // Menu fixo cobre o topo da tela: desconta a altura dele pra seção não ficar escondida.
          onIrParaContato={() => rolarSuaveAte(
            raiz.current?.querySelector(`[data-secao="${secaoContato}"]`) || raiz.current?.querySelector('form'),
            { folga: 16 + (menu.fixo ? refMenu.current?.offsetHeight || 0 : 0) },
          )}
        />
      )}
      {!menu?.ativo && logo && (
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-10 sm:h-12 w-auto max-w-[220px] object-contain" />
        </header>
      )}
      {children}
      {wpp && (preview ? (
        <div className="sticky bottom-0 h-0">
          <div className="absolute bottom-5 right-5">
            <BotaoWhatsApp href={wpp} notificacao={notificacao} />
          </div>
        </div>
      ) : (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
          <BotaoWhatsApp href={wpp} notificacao={notificacao} />
        </div>
      ))}
    </div>
  )
}
