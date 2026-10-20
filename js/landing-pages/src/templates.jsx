// Fonte única de verdade dos templates de Landing Page — importada tanto
// pelo editor (preview) quanto pela página pública (render final), pra
// nunca divergir entre o que o operador vê editando e o que o cliente vê.
// Origem: 4 Olhos gestão (ago/2026), hoje compartilhado com o Ariel.
import { useState, useEffect } from 'react'
import { Image as ImageIcon, MessageCircle, Gem, Footprints, RotateCcw, Star, Quote } from 'lucide-react'
import { getConfig } from './config'

// Textos de exemplo que a página mostra enquanto a lista está vazia. Os campos do
// editor recebem os mesmos valores em `padrao`, pra que o que aparece na página
// também apareça (e seja editável) no formulário.
const GREATS_FEATURES_PADRAO = [
  { titulo: 'FEITOS À MÃO', descricao: 'Produzidos com atenção aos mínimos detalhes, por artesãos experientes.' },
  { titulo: 'MATERIAIS PREMIUM', descricao: 'Usamos apenas materiais de alta qualidade, por dentro e por fora.' },
  { titulo: 'TROCA GRÁTIS', descricao: 'Se não servir perfeitamente, trocamos sem custo em até 21 dias.' },
]
const GREATS_DEPOIMENTOS_PADRAO = [
  { texto: 'Atendimento incrível e produto de altíssima qualidade.', nome: 'Cliente satisfeito' },
  { texto: 'Chegou rápido e é ainda melhor do que nas fotos.', nome: 'Cliente satisfeito' },
]

// `campos` descreve o formulário genérico dirigido por schema do editor —
// cada entrada: { chave, label, tipo: 'texto_curto'|'texto_longo'|'imagem'|'lista'|'cta' }
export const LANDING_PAGE_TEMPLATES = {
  simples: {
    nome: 'Simples',
    descricao: 'Hero + texto livre + CTA — ideal para uma oferta única e direta.',
    secoes: [{ id: 'hero', nome: 'Topo (título e imagem)' }, { id: 'texto', nome: 'Texto livre' }, { id: 'formulario', nome: 'Formulário de contato' }],
    secaoContatoPadrao: 'formulario',
    campos: [
      { chave: 'titulo', label: 'Título (hero)', tipo: 'texto_curto', placeholder: 'Ex: Óculos completo a partir de R$ 250' },
      { chave: 'subtitulo', label: 'Subtítulo', tipo: 'texto_curto', placeholder: 'Ex: Armação + lente, com receita ou sem' },
      { chave: 'imagem_url', label: 'Imagem principal', tipo: 'imagem' },
      { chave: 'texto', label: 'Texto livre', tipo: 'texto_longo', placeholder: 'Conte mais sobre a oferta...' },
      { chave: 'cta_texto', label: 'Texto do botão', tipo: 'texto_curto', placeholder: 'Ex: Quero garantir o meu' },
    ],
    Render: ({ conteudo, onLead }) => (
      <div className="max-w-lg mx-auto px-5 py-10 text-center">
        <div data-secao="hero">
          {conteudo.imagem_url && (
            <img src={conteudo.imagem_url} alt="" className="w-full rounded-2xl mb-6 object-cover max-h-72" />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{conteudo.titulo || 'Título da oferta'}</h1>
          {conteudo.subtitulo && <p className="text-base text-gray-500 mb-5">{conteudo.subtitulo}</p>}
        </div>
        {conteudo.texto && <p data-secao="texto" className="text-sm text-gray-600 whitespace-pre-wrap mb-8">{conteudo.texto}</p>}
        <div data-secao="formulario">
          <FormularioLead ctaTexto={conteudo.cta_texto} onLead={onLead} />
        </div>
      </div>
    ),
  },

  promocao: {
    nome: 'Promoção',
    descricao: 'Hero + imagem de produto + lista de benefícios + CTA.',
    secoes: [{ id: 'hero', nome: 'Topo (título e imagem)' }, { id: 'beneficios', nome: 'Benefícios' }, { id: 'formulario', nome: 'Formulário de contato' }],
    secaoContatoPadrao: 'formulario',
    cores: () => ({ destaque: '#8B5CF6' }),
    campos: [
      { chave: 'titulo', label: 'Título (hero)', tipo: 'texto_curto', placeholder: 'Ex: Promoção de agosto' },
      { chave: 'subtitulo', label: 'Subtítulo', tipo: 'texto_curto' },
      { chave: 'imagem_url', label: 'Imagem do produto', tipo: 'imagem' },
      { chave: 'beneficios', label: 'Benefícios', tipo: 'lista', placeholder: 'Ex: Frete grátis pra SC' },
      { chave: 'cta_texto', label: 'Texto do botão', tipo: 'texto_curto', placeholder: 'Ex: Quero aproveitar' },
    ],
    Render: ({ conteudo, onLead }) => (
      <div className="max-w-lg mx-auto px-5 py-10">
        <div data-secao="hero" className="text-center mb-6">
          {conteudo.imagem_url && (
            <img src={conteudo.imagem_url} alt="" className="w-full rounded-2xl mb-6 object-cover max-h-72" />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{conteudo.titulo || 'Título da promoção'}</h1>
          {conteudo.subtitulo && <p className="text-base text-gray-500">{conteudo.subtitulo}</p>}
        </div>
        {Array.isArray(conteudo.beneficios) && conteudo.beneficios.length > 0 && (
          <ul data-secao="beneficios" className="space-y-2 mb-8">
            {conteudo.beneficios.filter(Boolean).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}
        <div data-secao="formulario">
          <FormularioLead ctaTexto={conteudo.cta_texto} onLead={onLead} />
        </div>
      </div>
    ),
  },

  agendar_consulta: {
    nome: 'Agendar consulta',
    descricao: 'Hero + CTA de WhatsApp + FAQ.',
    secoes: [{ id: 'hero', nome: 'Topo (título e imagem)' }, { id: 'contato', nome: 'Botão de WhatsApp / formulário' }, { id: 'faq', nome: 'Perguntas frequentes' }],
    secaoContatoPadrao: 'contato',
    cores: () => ({ principal: '#059669' }),
    campos: [
      { chave: 'titulo', label: 'Título (hero)', tipo: 'texto_curto', placeholder: 'Ex: Agende sua consulta' },
      { chave: 'subtitulo', label: 'Subtítulo', tipo: 'texto_curto' },
      { chave: 'imagem_url', label: 'Imagem principal', tipo: 'imagem' },
      { chave: 'whatsapp_numero', label: 'Número do WhatsApp (só dígitos, com DDI)', tipo: 'texto_curto', placeholder: 'Ex: 5511999999999' },
      { chave: 'whatsapp_mensagem', label: 'Mensagem pré-preenchida do WhatsApp', tipo: 'texto_curto', placeholder: 'Ex: Olá, quero agendar uma consulta' },
      { chave: 'cta_texto', label: 'Texto do botão de WhatsApp', tipo: 'texto_curto', placeholder: 'Ex: Agendar pelo WhatsApp' },
      { chave: 'faq', label: 'Perguntas frequentes', tipo: 'lista_faq' },
    ],
    Render: ({ conteudo, onLead }) => {
      const wppUrl = conteudo.whatsapp_numero
        ? `https://wa.me/${conteudo.whatsapp_numero}?text=${encodeURIComponent(conteudo.whatsapp_mensagem || 'Olá, quero agendar uma consulta')}`
        : null
      return (
        <div className="max-w-lg mx-auto px-5 py-10">
          <div data-secao="hero" className="text-center mb-6">
            {conteudo.imagem_url && (
              <img src={conteudo.imagem_url} alt="" className="w-full rounded-2xl mb-6 object-cover max-h-72" />
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{conteudo.titulo || 'Agende sua consulta'}</h1>
            {conteudo.subtitulo && <p className="text-base text-gray-500">{conteudo.subtitulo}</p>}
          </div>
          <div data-secao="contato">
          {wppUrl ? (
            <a
              href={wppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors mb-8"
            >
              <MessageCircle size={18} />
              {conteudo.cta_texto || 'Agendar pelo WhatsApp'}
            </a>
          ) : (
            <FormularioLead ctaTexto={conteudo.cta_texto} onLead={onLead} />
          )}
          </div>
          {Array.isArray(conteudo.faq) && conteudo.faq.length > 0 && (
            <div data-secao="faq" className="mt-8 space-y-4">
              {conteudo.faq.filter(f => f?.pergunta).map((f, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-900">{f.pergunta}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{f.resposta}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
  },

  // Réplica fiel de layout/proporções/fonte de uma landing page de e-commerce
  // premium (referência: "Greats", marca de sapatos, estilo Unbounce) — só
  // conteúdo, fotos e paleta de cores são editáveis; a estrutura das seções
  // é fixa de propósito, pra nunca "errar" o resultado visual. Ver
  // CLAUDE.md do repo otica-compartilhado pro racional completo.
  greats: {
    nome: 'Greats',
    descricao: 'Layout premium de e-commerce (hero, mosaico de fotos, CTAs) — fiel a uma referência real.',
    secoes: [
      { id: 'hero', nome: 'Hero' }, { id: 'selos', nome: 'Selos de confiança' }, { id: 'banner', nome: 'Imagem de destaque' },
      { id: 'mosaico_1', nome: 'Mosaico 1' }, { id: 'faixa_cta', nome: 'Faixa de CTA' }, { id: 'mosaico_2', nome: 'Mosaico 2' },
      { id: 'colecoes', nome: 'Coleções (coluna 1 / coluna 2)' }, { id: 'depoimentos', nome: 'Depoimentos' }, { id: 'rodape', nome: 'Rodapé' },
    ],
    secaoContatoPadrao: 'faixa_cta',
    cores: (c) => ({ principal: c.cor_primaria || '#1E3A5F', destaque: c.cor_secundaria || '#E5B3A0' }),
    campos: [
      { chave: 'cor_primaria', label: 'Cor principal (títulos, botões)', tipo: 'cor', padrao: '#1E3A5F' },
      { chave: 'cor_secundaria', label: 'Cor de destaque (seção feminino)', tipo: 'cor', padrao: '#E5B3A0' },

      { chave: 'selo_texto', label: 'Selo no topo do hero', tipo: 'texto_curto', placeholder: 'Ex: SUA MARCA' },
      { chave: 'hero_imagem', label: 'Imagem de fundo do hero', tipo: 'imagem' },
      { chave: 'hero_escurecimento', label: 'Película escura sobre a imagem do hero', tipo: 'intensidade', min: 0, max: 80, passo: 5, padrao: 25, unidade: '%', rotuloMin: 'Mais clara', rotuloMax: 'Mais escura' },
      { chave: 'hero_titulo', label: 'Título do hero', tipo: 'texto_curto', placeholder: 'Ex: O QUE PROCURAR EM ÓCULOS DE QUALIDADE' },
      { chave: 'hero_cta_texto', label: 'Texto do botão do hero', tipo: 'texto_curto', placeholder: 'Ex: VER COLEÇÃO' },
      { chave: 'hero_cta_url', label: 'Link do botão do hero', tipo: 'texto_curto', placeholder: 'https://...' },

      { chave: 'features', label: 'Selos de confiança (3 itens)', tipo: 'lista_features', padrao: GREATS_FEATURES_PADRAO },

      { chave: 'banner_imagem', label: 'Imagem de destaque (detalhe do produto)', tipo: 'imagem' },
      { chave: 'banner_anotacao', label: 'Legenda do detalhe', tipo: 'texto_curto', placeholder: 'Ex: ARMAÇÃO 100% ACETATO ITALIANO' },

      { chave: 'bloco_1', label: 'Bloco 1 (texto, com CTA)', tipo: 'bloco' },
      { chave: 'mosaico_1_imagem', label: 'Imagem do mosaico 1 (superior direita)', tipo: 'imagem' },
      { chave: 'mosaico_2_imagem', label: 'Imagem do mosaico 1 (inferior esquerda, maior)', tipo: 'imagem' },
      { chave: 'bloco_2', label: 'Bloco 2 (texto, com CTA)', tipo: 'bloco' },
      { chave: 'bloco_3', label: 'Bloco 3 (texto, sem CTA)', tipo: 'bloco', semCta: true },

      { chave: 'cta2_imagem', label: 'Imagem da faixa de CTA', tipo: 'imagem' },
      { chave: 'cta2_bloco', label: 'Texto da faixa de CTA', tipo: 'bloco' },

      { chave: 'bloco_4', label: 'Bloco 4 (texto, sem CTA)', tipo: 'bloco', semCta: true },
      { chave: 'mosaico_3_imagem', label: 'Imagem do mosaico 2 (superior direita)', tipo: 'imagem' },
      { chave: 'mosaico_4_imagem', label: 'Imagem do mosaico 2 (inferior esquerda)', tipo: 'imagem' },
      { chave: 'bloco_5', label: 'Bloco 5 (texto, sem CTA)', tipo: 'bloco', semCta: true },

      { chave: 'men_titulo', label: 'Título coluna 1 (ex: MASCULINO)', tipo: 'texto_curto', placeholder: 'MASCULINO' },
      { chave: 'men_cta_texto', label: 'Texto do botão — coluna 1', tipo: 'texto_curto', placeholder: 'VER COLEÇÃO' },
      { chave: 'men_cta_url', label: 'Link do botão — coluna 1', tipo: 'texto_curto' },
      { chave: 'women_titulo', label: 'Título coluna 2 (ex: FEMININO)', tipo: 'texto_curto', placeholder: 'FEMININO' },
      { chave: 'women_cta_texto', label: 'Texto do botão — coluna 2', tipo: 'texto_curto', placeholder: 'VER COLEÇÃO' },
      { chave: 'women_cta_url', label: 'Link do botão — coluna 2', tipo: 'texto_curto' },

      { chave: 'depoimentos', label: 'Depoimentos', tipo: 'lista_depoimentos', padrao: GREATS_DEPOIMENTOS_PADRAO },
      { chave: 'rodape_texto', label: 'Texto do rodapé', tipo: 'texto_curto', placeholder: 'Ex: © 2026 Sua marca. Todos os direitos reservados.' },
    ],
    Render: ({ conteudo }) => <GreatsRender conteudo={conteudo} />,
  },
}

// `secoes`: blocos marcados com `data-secao` no Render — a página escolhe um como "seção de
// contato" (conteudo.secao_contato), destino do botão do menu quando ele leva pro contato.
export function secaoContatoDaPagina(templateId, conteudo) {
  const t = LANDING_PAGE_TEMPLATES[templateId]
  if (!t) return null
  const escolhida = conteudo?.secao_contato
  return t.secoes?.some(s => s.id === escolhida) ? escolhida : t.secaoContatoPadrao
}

// Cores da página pra "mesma cor da página" no botão do menu. Template sem cor própria
// cai no escuro padrão dos botões dos templates (gray-900).
const COR_PADRAO_PAGINA = '#111827'
export function coresDaPagina(templateId, conteudo) {
  const t = LANDING_PAGE_TEMPLATES[templateId]
  const cores = t?.cores ? t.cores(conteudo || {}) : {}
  return { principal: cores.principal || COR_PADRAO_PAGINA, destaque: cores.destaque || cores.principal || COR_PADRAO_PAGINA }
}

export const TEMPLATE_LIST = Object.entries(LANDING_PAGE_TEMPLATES).map(([id, t]) => ({
  id, nome: t.nome, descricao: t.descricao,
}))

// Mockup de card em CSS puro pra galeria de criação — mais barato que gerar imagem.
export function TemplateCardPreview({ templateId }) {
  if (templateId === 'agendar_consulta') {
    return (
      <div className="w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5">
        <div className="h-6 rounded bg-gray-200 flex items-center justify-center">
          <ImageIcon size={12} className="text-gray-400" />
        </div>
        <div className="h-2 w-3/4 rounded bg-gray-300" />
        <div className="h-4 rounded bg-emerald-200 mt-auto" />
      </div>
    )
  }
  if (templateId === 'greats') {
    return (
      <div className="w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-1.5 flex flex-col gap-1">
        <div className="h-9 rounded bg-slate-700 flex items-center justify-center">
          <ImageIcon size={12} className="text-slate-300" />
        </div>
        <div className="flex gap-1 flex-1">
          <div className="flex-1 rounded bg-white border border-gray-200" />
          <div className="flex-1 rounded bg-gray-200" />
        </div>
        <div className="flex gap-1">
          <div className="flex-1 h-2.5 rounded bg-slate-700" />
          <div className="flex-1 h-2.5 rounded" style={{ background: '#E5B3A0' }} />
        </div>
      </div>
    )
  }
  if (templateId === 'promocao') {
    return (
      <div className="w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5">
        <div className="h-8 rounded bg-gray-200 flex items-center justify-center">
          <ImageIcon size={14} className="text-gray-400" />
        </div>
        <div className="h-1.5 w-full rounded bg-gray-300" />
        <div className="h-1.5 w-2/3 rounded bg-gray-300" />
        <div className="h-3 rounded bg-violet-200 mt-auto" />
      </div>
    )
  }
  return (
    <div className="w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5">
      <div className="h-2 w-3/4 rounded bg-gray-300 mx-auto" />
      <div className="h-1.5 w-full rounded bg-gray-200" />
      <div className="h-1.5 w-5/6 rounded bg-gray-200" />
      <div className="h-4 rounded bg-gray-300 mt-auto" />
    </div>
  )
}

function FormularioLead({ ctaTexto, onLead }) {
  if (!onLead) {
    // Preview no editor: formulário estático, sem submit real.
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <div className="h-9 rounded-lg bg-white border border-gray-200" />
        <div className="h-9 rounded-lg bg-white border border-gray-200" />
        <div className="h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white text-sm font-medium">
          {ctaTexto || 'Quero saber mais'}
        </div>
      </div>
    )
  }
  return <FormularioLeadInterativo ctaTexto={ctaTexto} onLead={onLead} />
}

function FormularioLeadInterativo({ ctaTexto, onLead }) {
  const TelefoneInput = getConfig().TelefoneInput || TelefoneInputSimples
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !telefone) return
    setEnviando(true)
    try {
      await onLead({ nome: nome.trim(), telefone })
      setEnviado(true)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-sm text-emerald-700 font-medium">
        Recebemos seus dados! Em breve entramos em contato. 😊
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Seu nome"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
        required
      />
      <TelefoneInput value={telefone} onChange={setTelefone} placeholder="Seu WhatsApp" />
      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {enviando ? 'Enviando...' : (ctaTexto || 'Quero saber mais')}
      </button>
    </form>
  )
}

// Campo de telefone padrão quando o app não injeta o seu (config.TelefoneInput).
function TelefoneInputSimples({ value, onChange, placeholder }) {
  return (
    <input
      type="tel"
      inputMode="tel"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || '(11) 99999-9999'}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
      required
    />
  )
}

// ─── Template "Greats" — helpers ────────────────────────────────────────────

const GREATS_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&display=swap'
const GREATS_FONT_STACK = "'Montserrat', ui-sans-serif, system-ui, sans-serif"

// Carrega a fonte da referência (Montserrat) só quando este template está em
// tela — outros templates continuam usando a fonte padrão do sistema (Inter).
function useGreatsFont() {
  useEffect(() => {
    if (document.querySelector(`link[href="${GREATS_FONT_HREF}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = GREATS_FONT_HREF
    document.head.appendChild(link)
  }, [])
}

function GreatsImg({ src, className, alt = '' }) {
  if (src) return <img src={src} alt={alt} className={className} />
  return (
    <div className={`${className} bg-gray-200 flex items-center justify-center`}>
      <ImageIcon size={28} className="text-gray-400" />
    </div>
  )
}

function GreatsBotao({ texto, url, variante = 'escuro', cor }) {
  if (!texto) return null
  const claro = variante === 'claro'
  return (
    <a
      href={url || undefined}
      target={url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase text-center transition-opacity hover:opacity-90"
      style={claro ? { background: '#fff', color: cor } : { background: cor, color: '#fff' }}
    >
      {texto}
    </a>
  )
}

function GreatsBloco({ bloco, corPrimaria, fundo = 'branco', className = '' }) {
  const v = bloco || {}
  const escuro = fundo === 'escuro'
  return (
    <div
      className={`flex flex-col justify-center gap-3 p-8 sm:p-10 ${className}`}
      style={{ background: escuro ? corPrimaria : (fundo === 'cinza' ? '#F5F4F2' : '#fff') }}
    >
      <h3
        className="text-lg sm:text-xl font-extrabold uppercase tracking-tight leading-snug"
        style={{ color: escuro ? '#fff' : corPrimaria }}
      >
        {v.titulo || 'Título do bloco'}
      </h3>
      {v.texto && (
        <p className="text-sm leading-relaxed" style={{ color: escuro ? 'rgba(255,255,255,0.85)' : '#6B7280' }}>
          {v.texto}
        </p>
      )}
      {v.cta_texto && (
        <div className="pt-1">
          <GreatsBotao texto={v.cta_texto} url={v.cta_url} variante={escuro ? 'claro' : 'escuro'} cor={corPrimaria} />
        </div>
      )}
    </div>
  )
}

const GREATS_ICONES = [Gem, Footprints, RotateCcw]

const GREATS_ESCURECIMENTO_PADRAO = 25

function GreatsRender({ conteudo }) {
  useGreatsFont()
  const c = conteudo || {}
  const corPrimaria = c.cor_primaria || '#1E3A5F'
  const corSecundaria = c.cor_secundaria || '#E5B3A0'
  // Película escura sobre a foto do hero, em % (0 = sem película). Padrão 25 = o
  // bg-black/25 que a página tinha antes de virar campo editável.
  const escurecimentoHero = Number.isFinite(Number(c.hero_escurecimento)) && c.hero_escurecimento !== ''
    && c.hero_escurecimento != null ? Number(c.hero_escurecimento) : GREATS_ESCURECIMENTO_PADRAO
  const features = Array.isArray(c.features) && c.features.length > 0 ? c.features : GREATS_FEATURES_PADRAO
  const depoimentos = Array.isArray(c.depoimentos) && c.depoimentos.length > 0 ? c.depoimentos : GREATS_DEPOIMENTOS_PADRAO

  return (
    <div style={{ fontFamily: GREATS_FONT_STACK }} className="bg-white">
      {/* Hero */}
      <div data-secao="hero" className="relative w-full min-h-[380px] sm:min-h-[440px] flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden">
        {c.hero_imagem ? (
          <img src={c.hero_imagem} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gray-300" />
        )}
        <div className="absolute inset-0" style={{ background: `rgba(0, 0, 0, ${escurecimentoHero / 100})` }} />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <span
            className="px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-white"
            style={{ background: corPrimaria }}
          >
            {c.selo_texto || 'SUA MARCA'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-white leading-tight max-w-md drop-shadow-md">
            {c.hero_titulo || 'Título de impacto para o seu produto'}
          </h1>
          <GreatsBotao texto={c.hero_cta_texto || 'SAIBA MAIS'} url={c.hero_cta_url} variante="escuro" cor={corPrimaria} />
        </div>
      </div>

      {/* Selos de confiança */}
      <div data-secao="selos" className="grid grid-cols-3 gap-3 sm:gap-6 px-4 sm:px-10 py-10" style={{ background: '#F7F6F4' }}>
        {features.slice(0, 3).map((f, i) => {
          const Icone = GREATS_ICONES[i % GREATS_ICONES.length]
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <Icone size={22} style={{ color: corPrimaria }} strokeWidth={1.75} />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: corPrimaria }}>
                {f.titulo || 'Selo'}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-snug">{f.descricao}</p>
            </div>
          )
        })}
      </div>

      {/* Banner com detalhe do produto */}
      <div data-secao="banner" className="relative w-full">
        <GreatsImg src={c.banner_imagem} className="w-full h-56 sm:h-72 object-cover" />
        {c.banner_anotacao && (
          <div className="absolute left-3 bottom-3 sm:left-6 sm:bottom-6 bg-white/95 px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
            <span className="text-gray-900 text-[11px] sm:text-xs font-bold uppercase tracking-wide">
              {c.banner_anotacao}
            </span>
          </div>
        )}
      </div>

      {/* Mosaico 1: bloco texto / imagem / imagem / bloco navy / bloco */}
      <div data-secao="mosaico_1" className="grid grid-cols-2">
        <GreatsBloco bloco={c.bloco_1} corPrimaria={corPrimaria} fundo="branco" />
        <GreatsImg src={c.mosaico_1_imagem} className="w-full aspect-[4/5] object-cover" />
        <GreatsImg src={c.mosaico_2_imagem} className="w-full aspect-[4/5] object-cover" />
        <GreatsBloco bloco={c.bloco_2} corPrimaria={corPrimaria} fundo="escuro" />
        <div className="col-span-2 sm:col-span-1 sm:col-start-2">
          <GreatsBloco bloco={c.bloco_3} corPrimaria={corPrimaria} fundo="cinza" />
        </div>
      </div>

      {/* Faixa de CTA */}
      <div data-secao="faixa_cta" className="grid grid-cols-2 items-stretch" style={{ background: '#F7F6F4' }}>
        <div className="flex flex-col justify-center gap-3 p-8 sm:p-10">
          <h3 className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight" style={{ color: corPrimaria }}>
            {c.cta2_bloco?.titulo || 'Confira nossa coleção'}
          </h3>
          {c.cta2_bloco?.texto && <p className="text-sm text-gray-500">{c.cta2_bloco.texto}</p>}
          <div className="pt-1">
            <GreatsBotao texto={c.cta2_bloco?.cta_texto || 'VER COLEÇÃO'} url={c.cta2_bloco?.cta_url} variante="escuro" cor={corPrimaria} />
          </div>
        </div>
        <GreatsImg src={c.cta2_imagem} className="w-full h-full min-h-[220px] object-cover" />
      </div>

      {/* Mosaico 2: bloco navy / imagem / imagem / bloco branco */}
      <div data-secao="mosaico_2" className="grid grid-cols-2">
        <GreatsBloco bloco={c.bloco_4} corPrimaria={corPrimaria} fundo="escuro" />
        <GreatsImg src={c.mosaico_3_imagem} className="w-full aspect-square object-cover" />
        <GreatsImg src={c.mosaico_4_imagem} className="w-full aspect-square object-cover" />
        <GreatsBloco bloco={c.bloco_5} corPrimaria={corPrimaria} fundo="branco" />
      </div>

      {/* Masculino / Feminino */}
      <div data-secao="colecoes" className="grid grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-3 py-14 px-4" style={{ background: corPrimaria }}>
          <h3 className="text-white text-lg sm:text-xl font-extrabold uppercase tracking-wide">
            {c.men_titulo || 'MASCULINO'}
          </h3>
          <GreatsBotao texto={c.men_cta_texto || 'VER AGORA'} url={c.men_cta_url} variante="claro" cor={corPrimaria} />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-14 px-4" style={{ background: corSecundaria }}>
          <h3 className="text-white text-lg sm:text-xl font-extrabold uppercase tracking-wide">
            {c.women_titulo || 'FEMININO'}
          </h3>
          <GreatsBotao texto={c.women_cta_texto || 'VER AGORA'} url={c.women_cta_url} variante="claro" cor={corSecundaria} />
        </div>
      </div>

      {/* Depoimentos */}
      <div data-secao="depoimentos" className="grid grid-cols-2 gap-4 sm:gap-8 px-4 sm:px-10 py-12 text-center">
        {depoimentos.slice(0, 2).map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Quote size={16} className="text-gray-300" fill="currentColor" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} size={13} className="text-amber-400" fill="currentColor" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{d.texto}</p>
            <p className="text-xs font-bold" style={{ color: corPrimaria }}>{d.nome}</p>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div data-secao="rodape" className="text-center text-[11px] text-gray-400 py-6 border-t border-gray-100">
        {c.rodape_texto || `© ${new Date().getFullYear()} Todos os direitos reservados.`}
      </div>
    </div>
  )
}
