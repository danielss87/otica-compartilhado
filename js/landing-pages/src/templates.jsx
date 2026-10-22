// Fonte única de verdade dos templates de Landing Page — importada tanto
// pelo editor (preview) quanto pela página pública (render final), pra
// nunca divergir entre o que o operador vê editando e o que o cliente vê.
// Origem: 4 Olhos gestão (ago/2026), hoje compartilhado com o Ariel.
import { useState, useEffect } from 'react'
import { Image as ImageIcon, MessageCircle, Gem, Footprints, RotateCcw, Star, Quote } from 'lucide-react'
import { getConfig } from './config'
import {
  LeaderRender, LeaderCardPreview, LEADER_COR_ESCURA, LEADER_COR_DESTAQUE, LEADER_SERVICOS_PADRAO, LEADER_SERVICOS_ICONES,
  LEADER_PASSOS_PADRAO, LEADER_PASSOS_ICONES, LEADER_FAQ_PADRAO, LEADER_RODAPE_ITENS_PADRAO, LEADER_TEXTOS,
} from './templateLeader'

// Textos de exemplo que a página mostra enquanto a lista está vazia. Os campos do
// editor recebem os mesmos valores em `padrao`, pra que o que aparece na página
// também apareça (e seja editável) no formulário.
const GREATS_FEATURES_PADRAO = [
  { titulo: 'FEITOS À MÃO', descricao: 'Produzidos com atenção aos mínimos detalhes, por artesãos experientes.' },
  { titulo: 'MATERIAIS PREMIUM', descricao: 'Usamos apenas materiais de alta qualidade, por dentro e por fora.' },
  { titulo: 'TROCA GRÁTIS', descricao: 'Se não servir perfeitamente, trocamos sem custo em até 21 dias.' },
]
// Ícone padrão de cada selo (por posição) quando o selo não tem `icone_url` enviado.
const GREATS_BLOCO_PADRAO = { titulo: 'Título do bloco' }
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
      { chave: 'titulo', label: 'Título (hero)', tipo: 'texto_curto', padrao: 'Título da oferta', placeholder: 'Ex: Óculos completo a partir de R$ 250' },
      { chave: 'subtitulo', label: 'Subtítulo', tipo: 'texto_curto', placeholder: 'Ex: Armação + lente, com receita ou sem' },
      { chave: 'imagem_url', label: 'Imagem principal', tipo: 'imagem' },
      { chave: 'texto', label: 'Texto livre', tipo: 'texto_longo', placeholder: 'Conte mais sobre a oferta...' },
      { chave: 'cta_texto', label: 'Texto do botão', tipo: 'texto_curto', padrao: 'Quero saber mais', placeholder: 'Ex: Quero garantir o meu' },
    ],
    Render: ({ conteudo, onLead }) => (
      <div className="max-w-lg mx-auto px-5 py-10 text-center">
        <div data-secao="hero">
          {conteudo.imagem_url && (
            <img src={conteudo.imagem_url} alt="" className="w-full rounded-2xl mb-6 object-cover max-h-72" />
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">{conteudo.titulo}</h1>
          {conteudo.subtitulo && <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-5">{conteudo.subtitulo}</p>}
        </div>
        {conteudo.texto && <p data-secao="texto" className="text-base sm:text-lg text-gray-800 leading-relaxed whitespace-pre-wrap mb-8">{conteudo.texto}</p>}
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
      { chave: 'titulo', label: 'Título (hero)', tipo: 'texto_curto', padrao: 'Título da promoção', placeholder: 'Ex: Promoção de agosto' },
      { chave: 'subtitulo', label: 'Subtítulo', tipo: 'texto_curto' },
      { chave: 'imagem_url', label: 'Imagem do produto', tipo: 'imagem' },
      { chave: 'beneficios', label: 'Benefícios', tipo: 'lista', placeholder: 'Ex: Frete grátis pra SC' },
      { chave: 'cta_texto', label: 'Texto do botão', tipo: 'texto_curto', padrao: 'Quero saber mais', placeholder: 'Ex: Quero aproveitar' },
    ],
    Render: ({ conteudo, onLead }) => (
      <div className="max-w-lg mx-auto px-5 py-10">
        <div data-secao="hero" className="text-center mb-6">
          {conteudo.imagem_url && (
            <img src={conteudo.imagem_url} alt="" className="w-full rounded-2xl mb-6 object-cover max-h-72" />
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">{conteudo.titulo}</h1>
          {conteudo.subtitulo && <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">{conteudo.subtitulo}</p>}
        </div>
        {Array.isArray(conteudo.beneficios) && conteudo.beneficios.length > 0 && (
          <ul data-secao="beneficios" className="space-y-3 mb-8">
            {conteudo.beneficios.filter(Boolean).map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-gray-800 leading-snug">
                <span className="mt-2 w-2 h-2 rounded-full bg-violet-500 shrink-0" />
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
      { chave: 'titulo', label: 'Título (hero)', tipo: 'texto_curto', padrao: 'Agende sua consulta' },
      { chave: 'subtitulo', label: 'Subtítulo', tipo: 'texto_curto' },
      { chave: 'imagem_url', label: 'Imagem principal', tipo: 'imagem' },
      { chave: 'whatsapp_numero', label: 'Número do WhatsApp (só dígitos, com DDI)', tipo: 'texto_curto', placeholder: 'Ex: 5511999999999' },
      { chave: 'whatsapp_mensagem', label: 'Mensagem pré-preenchida do WhatsApp', tipo: 'texto_curto', padrao: 'Olá, quero agendar uma consulta' },
      // Sem `padrao` de propósito: o texto padrão muda com o WhatsApp preenchido ou não.
      { chave: 'cta_texto', label: 'Texto do botão de WhatsApp', tipo: 'texto_curto', placeholder: 'Ex: Agendar pelo WhatsApp' },
      { chave: 'faq', label: 'Perguntas frequentes', tipo: 'lista_faq' },
    ],
    Render: ({ conteudo, onLead }) => {
      const wppUrl = conteudo.whatsapp_numero
        ? `https://wa.me/${conteudo.whatsapp_numero}?text=${encodeURIComponent(conteudo.whatsapp_mensagem)}`
        : null
      return (
        <div className="max-w-lg mx-auto px-5 py-10">
          <div data-secao="hero" className="text-center mb-6">
            {conteudo.imagem_url && (
              <img src={conteudo.imagem_url} alt="" className="w-full rounded-2xl mb-6 object-cover max-h-72" />
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">{conteudo.titulo}</h1>
            {conteudo.subtitulo && <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">{conteudo.subtitulo}</p>}
          </div>
          <div data-secao="contato">
          {wppUrl ? (
            <a
              href={wppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold py-4 rounded-xl transition-colors mb-8"
            >
              <MessageCircle size={22} />
              {conteudo.cta_texto || 'Agendar pelo WhatsApp'}
            </a>
          ) : (
            <FormularioLead ctaTexto={conteudo.cta_texto} onLead={onLead} />
          )}
          </div>
          {Array.isArray(conteudo.faq) && conteudo.faq.length > 0 && (
            <div data-secao="faq" className="mt-8 space-y-5">
              {conteudo.faq.filter(f => f?.pergunta).map((f, i) => (
                <div key={i}>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{f.pergunta}</p>
                  <p className="text-base text-gray-700 leading-relaxed mt-1">{f.resposta}</p>
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

      { chave: 'selo_texto', label: 'Selo no topo do hero', tipo: 'texto_curto', padrao: 'SUA MARCA', placeholder: 'Ex: SUA MARCA' },
      { chave: 'hero_imagem', label: 'Imagem de fundo do hero', tipo: 'imagem' },
      { chave: 'hero_escurecimento', label: 'Película escura sobre a imagem do hero', tipo: 'intensidade', min: 0, max: 80, passo: 5, padrao: 25, unidade: '%', rotuloMin: 'Mais clara', rotuloMax: 'Mais escura' },
      { chave: 'hero_titulo', label: 'Título do hero', tipo: 'texto_curto', padrao: 'Título de impacto para o seu produto', placeholder: 'Ex: O QUE PROCURAR EM ÓCULOS DE QUALIDADE' },
      { chave: 'hero_cta_texto', label: 'Texto do botão do hero', tipo: 'texto_curto', padrao: 'SAIBA MAIS', placeholder: 'Ex: VER COLEÇÃO' },
      { chave: 'hero_cta_url', label: 'Link do botão do hero', tipo: 'texto_curto', placeholder: 'https://...' },

      { chave: 'features', label: 'Selos de confiança (3 itens)', tipo: 'lista_features', padrao: GREATS_FEATURES_PADRAO, icones: GREATS_ICONES },

      { chave: 'banner_imagem', label: 'Imagem de destaque (detalhe do produto)', tipo: 'imagem' },
      { chave: 'banner_anotacao', label: 'Legenda do detalhe', tipo: 'texto_curto', placeholder: 'Ex: ARMAÇÃO 100% ACETATO ITALIANO' },

      { chave: 'bloco_1', label: 'Bloco 1 (texto, com CTA)', tipo: 'bloco', padrao: GREATS_BLOCO_PADRAO },
      { chave: 'mosaico_1_imagem', label: 'Imagem do mosaico 1 (superior direita)', tipo: 'imagem' },
      { chave: 'mosaico_2_imagem', label: 'Imagem do mosaico 1 (inferior esquerda, maior)', tipo: 'imagem' },
      { chave: 'bloco_2', label: 'Bloco 2 (texto, com CTA)', tipo: 'bloco', padrao: GREATS_BLOCO_PADRAO },
      { chave: 'bloco_3', label: 'Bloco 3 (texto, sem CTA)', tipo: 'bloco', padrao: GREATS_BLOCO_PADRAO, semCta: true },

      { chave: 'cta2_imagem', label: 'Imagem da faixa de CTA', tipo: 'imagem' },
      { chave: 'cta2_bloco', label: 'Texto da faixa de CTA', tipo: 'bloco', padrao: { titulo: 'Confira nossa coleção', cta_texto: 'VER COLEÇÃO' } },

      { chave: 'bloco_4', label: 'Bloco 4 (texto, sem CTA)', tipo: 'bloco', padrao: GREATS_BLOCO_PADRAO, semCta: true },
      { chave: 'mosaico_3_imagem', label: 'Imagem do mosaico 2 (superior direita)', tipo: 'imagem' },
      { chave: 'mosaico_4_imagem', label: 'Imagem do mosaico 2 (inferior esquerda)', tipo: 'imagem' },
      { chave: 'bloco_5', label: 'Bloco 5 (texto, sem CTA)', tipo: 'bloco', padrao: GREATS_BLOCO_PADRAO, semCta: true },

      { chave: 'men_titulo', label: 'Título coluna 1 (ex: MASCULINO)', tipo: 'texto_curto', padrao: 'MASCULINO', placeholder: 'MASCULINO' },
      { chave: 'men_cta_texto', label: 'Texto do botão — coluna 1', tipo: 'texto_curto', padrao: 'VER AGORA', placeholder: 'VER COLEÇÃO' },
      { chave: 'men_cta_url', label: 'Link do botão — coluna 1', tipo: 'texto_curto' },
      { chave: 'women_titulo', label: 'Título coluna 2 (ex: FEMININO)', tipo: 'texto_curto', padrao: 'FEMININO', placeholder: 'FEMININO' },
      { chave: 'women_cta_texto', label: 'Texto do botão — coluna 2', tipo: 'texto_curto', padrao: 'VER AGORA', placeholder: 'VER COLEÇÃO' },
      { chave: 'women_cta_url', label: 'Link do botão — coluna 2', tipo: 'texto_curto' },

      { chave: 'depoimentos', label: 'Depoimentos', tipo: 'lista_depoimentos', padrao: GREATS_DEPOIMENTOS_PADRAO },
      { chave: 'rodape_texto', label: 'Texto do rodapé', tipo: 'texto_curto', padrao: `© ${new Date().getFullYear()} Todos os direitos reservados.`, placeholder: 'Ex: © 2026 Sua marca. Todos os direitos reservados.' },
    ],
    Render: ({ conteudo }) => <GreatsRender conteudo={conteudo} />,
  },

  // Ótica de bairro com banners em degradê (cor sólida ↔ foto da loja). Responsivo por
  // container query: a pré-visualização mostra celular/tablet/desktop de verdade
  // (`responsivoPorContainer`). Código em templateLeader.jsx.
  leader: {
    nome: 'Leader',
    descricao: 'Ótica de bairro: banners com degradê entre cor sólida e foto da loja, passo a passo, FAQ e WhatsApp.',
    responsivoPorContainer: true,
    secoes: [
      { id: 'hero', nome: 'Topo (banner com degradê)' }, { id: 'problema', nome: 'O problema' }, { id: 'solucao', nome: 'A solução (banner com degradê)' },
      { id: 'servicos', nome: 'O que oferecemos' }, { id: 'como_funciona', nome: 'Como funciona' }, { id: 'galeria', nome: 'Fotos da loja' },
      { id: 'prova_social', nome: 'Prova social' }, { id: 'faq', nome: 'Dúvidas frequentes' }, { id: 'contato', nome: 'Venha nos visitar (contato)' },
      { id: 'rodape', nome: 'Rodapé' },
    ],
    secaoContatoPadrao: 'contato',
    cores: (c) => ({ principal: c.cor_escura || LEADER_COR_ESCURA, destaque: c.cor_destaque || LEADER_COR_DESTAQUE }),
    campos: [
      { chave: 'cor_escura', label: 'Cor escura (topo, rodapé, títulos)', tipo: 'cor', padrao: LEADER_COR_ESCURA },
      { chave: 'cor_destaque', label: 'Cor de destaque (botões, palavras em destaque)', tipo: 'cor', padrao: LEADER_COR_DESTAQUE },
      { chave: 'degrade_largura', label: 'Largura do degradê entre a cor e a foto (banners)', tipo: 'intensidade', min: 20, max: 80, passo: 5, padrao: 50, unidade: '%', rotuloMin: 'Transição curta', rotuloMax: 'Transição longa' },

      { chave: 'whatsapp_numero', label: 'WhatsApp dos botões (com DDD)', tipo: 'texto_curto', placeholder: 'Ex: 11 99999-9999 — em branco, os botões levam ao formulário' },
      { chave: 'whatsapp_mensagem', label: 'Mensagem pré-preenchida do WhatsApp', tipo: 'texto_curto', padrao: LEADER_TEXTOS.whatsapp_mensagem, placeholder: 'Ex: Olá! Vim pela página e gostaria de mais informações.' },
      { chave: 'botao_texto', label: 'Texto dos botões', tipo: 'texto_curto', padrao: LEADER_TEXTOS.botao_texto, padrao: LEADER_TEXTOS.botao_texto },

      { chave: 'hero_imagem', label: 'Topo: foto da loja (fica à direita, fundindo com a cor escura)', tipo: 'imagem' },
      { chave: 'hero_logo', label: 'Topo: logo dentro do banner, acima da frase pequena (opcional, PNG com fundo transparente)', tipo: 'imagem' },
      { chave: 'hero_logo_cor', label: 'Topo: cor do logo', tipo: 'opcoes', padrao: 'original', opcoes: [['original', 'Cores originais'], ['branca', 'Todo branco']] },
      { chave: 'hero_logo_celular', label: 'Topo: logo no celular', tipo: 'opcoes', padrao: 'mostrar', opcoes: [['mostrar', 'Mostrar'], ['ocultar', 'Esconder (só tablet e computador)']] },
      { chave: 'hero_selo', label: 'Topo: frase pequena acima do título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.hero_selo, placeholder: 'Ex: ÓTICA — ÓCULOS DE GRAU, SOL E LENTES DE CONTATO' },
      { chave: 'hero_titulo', label: 'Topo: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.hero_titulo, placeholder: 'Ex: Enxergue melhor ainda hoje.' },
      { chave: 'hero_titulo_destaque', label: 'Topo: final do título, na cor de destaque', tipo: 'texto_curto', placeholder: 'Ex: Óculos prontos em até 40 minutos.' },
      { chave: 'hero_texto', label: 'Topo: texto', tipo: 'texto_longo', padrao: LEADER_TEXTOS.hero_texto },
      { chave: 'hero_link_texto', label: 'Topo: link ao lado do botão', tipo: 'texto_curto', padrao: LEADER_TEXTOS.hero_link_texto, padrao: LEADER_TEXTOS.hero_link_texto },
      { chave: 'hero_link_url', label: 'Topo: endereço do link (ex: Google Maps). Em branco, rola até o contato', tipo: 'texto_curto', placeholder: 'https://maps.google.com/...' },

      { chave: 'problema_imagem', label: 'O problema: imagem', tipo: 'imagem' },
      { chave: 'problema_selo', label: 'O problema: frase pequena', tipo: 'texto_curto', padrao: LEADER_TEXTOS.problema_selo, padrao: LEADER_TEXTOS.problema_selo },
      { chave: 'problema_titulo', label: 'O problema: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.problema_titulo },
      { chave: 'problema_titulo_destaque', label: 'O problema: final do título em destaque', tipo: 'texto_curto' },
      { chave: 'problema_texto', label: 'O problema: texto (linha em branco separa parágrafos)', tipo: 'texto_longo', padrao: LEADER_TEXTOS.problema_texto },
      { chave: 'problema_caixa_acao', label: 'O problema: elemento no fim do texto', tipo: 'opcoes', padrao: 'caixa', opcoes: [['caixa', 'Caixa escura (só texto)'], ['contato', 'Botão que leva ao contato']] },
      { chave: 'problema_caixa', label: 'O problema: texto da caixa escura ou do botão', tipo: 'texto_curto', padrao: LEADER_TEXTOS.problema_caixa, placeholder: 'Ex: Aqui é diferente. / Entrar em contato' },

      { chave: 'solucao_imagem', label: 'A solução: foto (fica à direita, fundindo com o branco)', tipo: 'imagem' },
      { chave: 'solucao_selo', label: 'A solução: frase pequena', tipo: 'texto_curto', padrao: LEADER_TEXTOS.solucao_selo, padrao: LEADER_TEXTOS.solucao_selo },
      { chave: 'solucao_titulo', label: 'A solução: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.solucao_titulo },
      { chave: 'solucao_titulo_destaque', label: 'A solução: final do título em destaque', tipo: 'texto_curto' },
      { chave: 'solucao_texto', label: 'A solução: texto', tipo: 'texto_longo', padrao: LEADER_TEXTOS.solucao_texto },

      { chave: 'servicos_selo', label: 'O que oferecemos: frase pequena', tipo: 'texto_curto', padrao: LEADER_TEXTOS.servicos_selo, padrao: LEADER_TEXTOS.servicos_selo },
      { chave: 'servicos_titulo', label: 'O que oferecemos: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.servicos_titulo },
      { chave: 'servicos_titulo_destaque', label: 'O que oferecemos: final do título em destaque', tipo: 'texto_curto' },
      { chave: 'servicos', label: 'O que oferecemos: cartões (até 4)', tipo: 'lista_features', padrao: LEADER_SERVICOS_PADRAO, icones: LEADER_SERVICOS_ICONES, placeholderTitulo: 'Ex: Óculos de grau' },
      { chave: 'faixa_titulo', label: 'Faixa escura: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.faixa_titulo, placeholder: 'Ex: Entrega expressa' },
      { chave: 'faixa_texto', label: 'Faixa escura: texto', tipo: 'texto_curto', padrao: LEADER_TEXTOS.faixa_texto },

      { chave: 'passos_selo', label: 'Como funciona: frase pequena', tipo: 'texto_curto', padrao: LEADER_TEXTOS.passos_selo, padrao: LEADER_TEXTOS.passos_selo },
      { chave: 'passos_titulo', label: 'Como funciona: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.passos_titulo },
      { chave: 'passos_titulo_destaque', label: 'Como funciona: final do título em destaque', tipo: 'texto_curto' },
      { chave: 'passos', label: 'Como funciona: etapas', tipo: 'lista_features', padrao: LEADER_PASSOS_PADRAO, icones: LEADER_PASSOS_ICONES, placeholderTitulo: 'Ex: Escolha da armação' },

      { chave: 'galeria_1', label: 'Fotos da loja: 1', tipo: 'imagem' },
      { chave: 'galeria_2', label: 'Fotos da loja: 2', tipo: 'imagem' },
      { chave: 'galeria_3', label: 'Fotos da loja: 3', tipo: 'imagem' },

      { chave: 'prova_selo', label: 'Prova social: frase pequena', tipo: 'texto_curto', padrao: LEADER_TEXTOS.prova_selo, padrao: LEADER_TEXTOS.prova_selo },
      { chave: 'prova_titulo', label: 'Prova social: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.prova_titulo },
      { chave: 'prova_titulo_destaque', label: 'Prova social: final do título em destaque', tipo: 'texto_curto' },
      { chave: 'prova_texto', label: 'Prova social: texto', tipo: 'texto_longo', padrao: LEADER_TEXTOS.prova_texto },
      { chave: 'prova_google', label: 'Prova social: avaliações do Google', tipo: 'opcoes', padrao: 'nao', opcoes: [['nao', 'Não mostrar'], ['sim', 'Mostrar (no lugar dos depoimentos)']], ajuda: 'Configure a loja em Configurações → Avaliações do Google. Se o Google não responder, aparecem os depoimentos abaixo.' },
      { chave: 'depoimentos', label: 'Prova social: depoimentos (opcional, até 3)', tipo: 'lista_depoimentos' },

      { chave: 'faq_selo', label: 'Dúvidas: frase pequena', tipo: 'texto_curto', padrao: LEADER_TEXTOS.faq_selo, padrao: LEADER_TEXTOS.faq_selo },
      { chave: 'faq_titulo', label: 'Dúvidas: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.faq_titulo },
      { chave: 'faq_titulo_destaque', label: 'Dúvidas: final do título em destaque', tipo: 'texto_curto' },
      { chave: 'faq', label: 'Dúvidas: perguntas e respostas', tipo: 'lista_faq', padrao: LEADER_FAQ_PADRAO },

      { chave: 'contato_imagem', label: 'Contato: imagem (PNG sem fundo fica melhor; não aparece quando há endereço, que vira mapa)', tipo: 'imagem' },
      { chave: 'contato_selo', label: 'Contato: frase pequena', tipo: 'texto_curto', padrao: LEADER_TEXTOS.contato_selo, padrao: LEADER_TEXTOS.contato_selo },
      { chave: 'contato_titulo', label: 'Contato: título', tipo: 'texto_curto', padrao: LEADER_TEXTOS.contato_titulo },
      { chave: 'contato_titulo_destaque', label: 'Contato: final do título em destaque', tipo: 'texto_curto' },
      { chave: 'contato_texto', label: 'Contato: texto', tipo: 'texto_longo', padrao: LEADER_TEXTOS.contato_texto },
      { chave: 'endereco_texto', label: 'Como chegar: endereço da loja (com o endereço, a imagem vira um mapa e aparece o botão de rotas)', tipo: 'texto_curto', placeholder: 'Ex: Rua das Flores, 123 – Centro, Cidade/UF' },
      { chave: 'endereco_complemento', label: 'Como chegar: complemento, ao lado do endereço (não entra na busca do mapa)', tipo: 'texto_curto', placeholder: 'Ex: Loja 91' },
      { chave: 'loja_nome', label: 'Como chegar: nome do local (ajuda o Google Maps a achar a loja)', tipo: 'texto_curto', placeholder: 'Ex: Shopping Centro' },
      { chave: 'loja_coordenadas', label: 'Como chegar: coordenadas, para o botão do Uber (Google Maps → clique direito no local → copie os números)', tipo: 'texto_curto', placeholder: 'Ex: -27.5988, -48.6082' },
      { chave: 'uber_texto', label: 'Como chegar: texto do botão do Uber', tipo: 'texto_curto', padrao: LEADER_TEXTOS.uber_texto },
      { chave: 'rotas_texto', label: 'Como chegar: texto do botão de rotas', tipo: 'texto_curto', padrao: LEADER_TEXTOS.rotas_texto },
      { chave: 'endereco_url', label: 'Como chegar: link do endereço (opcional; em branco, abre as rotas)', tipo: 'texto_curto', placeholder: 'https://maps.google.com/...' },

      { chave: 'rodape_titulo', label: 'Rodapé: nome da ótica', tipo: 'texto_curto', padrao: LEADER_TEXTOS.rodape_titulo },
      { chave: 'rodape_itens', label: 'Rodapé: diferenciais', tipo: 'lista', padrao: LEADER_RODAPE_ITENS_PADRAO, placeholder: 'Ex: Pós-venda garantido' },
      { chave: 'rodape_texto', label: 'Rodapé: texto da faixa final', tipo: 'texto_curto', padrao: LEADER_TEXTOS.rodape_texto, placeholder: 'Ex: © 2026 Sua ótica. Todos os direitos reservados.' },
    ],
    Render: (props) => <LeaderRender {...props} FormularioLead={FormularioLead} />,
  },
}

// Textos padrão (v0.11.0): o texto que a página mostra num campo vazio mora SÓ no `padrao` do
// campo (texto_curto, texto_longo e as chaves de um `bloco`). O editor mostra esse mesmo texto
// dentro da caixa, pra dar pra achar no Ctrl+F, e o Render recebe o conteúdo já mesclado com os
// padrões (vazio, nulo ou "" → padrão, igual ao antigo `valor || 'texto'`). `conteudoOriginal`
// fica disponível pro caso raro em que o padrão depende de outro campo.
const TIPOS_TEXTO = new Set(['texto_curto', 'texto_longo'])
const vazio = v => v === undefined || v === null || v === ''

export function aplicarPadroes(campos, conteudo) {
  const c = { ...(conteudo || {}) }
  for (const campo of campos || []) {
    if (campo.padrao === undefined) continue
    if (TIPOS_TEXTO.has(campo.tipo)) {
      if (vazio(c[campo.chave])) c[campo.chave] = campo.padrao
    } else if (campo.tipo === 'opcoes') {
      if (!campo.opcoes.some(([v]) => v === c[campo.chave])) c[campo.chave] = campo.padrao
    } else if (campo.tipo === 'bloco') {
      const bloco = { ...(c[campo.chave] || {}) }
      for (const [k, v] of Object.entries(campo.padrao)) if (vazio(bloco[k])) bloco[k] = v
      c[campo.chave] = bloco
    }
  }
  return c
}

for (const t of Object.values(LANDING_PAGE_TEMPLATES)) {
  const RenderTemplate = t.Render
  t.Render = ({ conteudo, ...resto }) => (
    <RenderTemplate {...resto} conteudo={aplicarPadroes(t.campos, conteudo)} conteudoOriginal={conteudo || {}} />
  )
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
  if (templateId === 'leader') return <LeaderCardPreview />
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
        <div className="h-12 rounded-lg bg-white border border-gray-300" />
        <div className="h-12 rounded-lg bg-white border border-gray-300" />
        <div className="h-12 rounded-lg bg-gray-800 flex items-center justify-center text-white text-base font-semibold">
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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-base text-emerald-800 font-semibold">
        Recebemos seus dados! Em breve entramos em contato. 😊
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Seu nome"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
        required
      />
      <TelefoneInput value={telefone} onChange={setTelefone} placeholder="Seu WhatsApp" />
      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-3.5 rounded-lg text-base transition-colors"
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
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
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
      className="inline-block px-7 py-3.5 text-sm sm:text-base font-bold tracking-wider uppercase text-center transition-opacity hover:opacity-90"
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
      className={`flex flex-col justify-center gap-3 p-5 sm:p-10 ${className}`}
      style={{ background: escuro ? corPrimaria : (fundo === 'cinza' ? '#F5F4F2' : '#fff') }}
    >
      <h3
        className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight leading-snug break-words"
        style={{ color: escuro ? '#fff' : corPrimaria }}
      >
        {v.titulo}
      </h3>
      {v.texto && (
        <p className="text-base sm:text-lg font-medium leading-relaxed break-words" style={{ color: escuro ? 'rgba(255,255,255,0.95)' : GREATS_TEXTO }}>
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

// Padrão "letrão" (v0.9.0): parte do público chega sem óculos ou com a pupila dilatada.
// Texto corrido em cinza escuro (~10:1 no branco), nunca abaixo de 14px; corpo em 16–18px.
const GREATS_TEXTO = '#374151'

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
    <div lang="pt-BR" style={{ fontFamily: GREATS_FONT_STACK }} className="bg-white">
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
            className="px-4 py-2 text-sm font-bold tracking-[0.12em] uppercase text-white"
            style={{ background: corPrimaria }}
          >
            {c.selo_texto}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-white leading-tight max-w-xl break-words" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.55)' }}>
            {c.hero_titulo}
          </h1>
          <GreatsBotao texto={c.hero_cta_texto} url={c.hero_cta_url} variante="escuro" cor={corPrimaria} />
        </div>
      </div>

      {/* Selos de confiança */}
      <div data-secao="selos" className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 sm:px-10 py-10" style={{ background: '#F7F6F4' }}>
        {features.slice(0, 3).map((f, i) => {
          const Icone = GREATS_ICONES[i % GREATS_ICONES.length]
          return (
            <div key={i} className="flex flex-col gap-2">
              {f.icone_url ? (
                // Caixa fixa + object-contain: qualquer PNG fica do mesmo tamanho, sem distorcer.
                <img src={f.icone_url} alt="" className="w-8 h-8 object-contain" />
              ) : (
                <Icone size={30} style={{ color: corPrimaria }} strokeWidth={1.75} />
              )}
              <p className="text-base sm:text-lg font-extrabold uppercase tracking-wide" style={{ color: corPrimaria }}>
                {f.titulo || 'Selo'}
              </p>
              <p className="text-base font-medium leading-relaxed" style={{ color: GREATS_TEXTO }}>{f.descricao}</p>
            </div>
          )
        })}
      </div>

      {/* Banner com detalhe do produto */}
      <div data-secao="banner" className="relative w-full">
        <GreatsImg src={c.banner_imagem} className="w-full h-56 sm:h-72 object-cover" />
        {c.banner_anotacao && (
          <div className="absolute left-3 bottom-3 sm:left-6 sm:bottom-6 bg-white px-4 py-2 flex items-center gap-1.5 shadow-md">
            <span className="text-gray-900 text-sm sm:text-base font-bold uppercase tracking-wide">
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
      <div data-secao="faixa_cta" className="grid grid-cols-1 sm:grid-cols-2 items-stretch" style={{ background: '#F7F6F4' }}>
        <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-tight break-words" style={{ color: corPrimaria }}>
            {c.cta2_bloco?.titulo}
          </h3>
          {c.cta2_bloco?.texto && <p className="text-base sm:text-lg font-medium leading-relaxed" style={{ color: GREATS_TEXTO }}>{c.cta2_bloco.texto}</p>}
          <div className="pt-1">
            <GreatsBotao texto={c.cta2_bloco?.cta_texto} url={c.cta2_bloco?.cta_url} variante="escuro" cor={corPrimaria} />
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
          <h3 className="text-white text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-center break-words">
            {c.men_titulo}
          </h3>
          <GreatsBotao texto={c.men_cta_texto} url={c.men_cta_url} variante="claro" cor={corPrimaria} />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-14 px-4" style={{ background: corSecundaria }}>
          <h3 className="text-white text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-center break-words">
            {c.women_titulo}
          </h3>
          <GreatsBotao texto={c.women_cta_texto} url={c.women_cta_url} variante="claro" cor={corSecundaria} />
        </div>
      </div>

      {/* Depoimentos */}
      <div data-secao="depoimentos" className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-6 sm:px-10 py-12 text-center">
        {depoimentos.slice(0, 2).map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Quote size={20} className="text-gray-400" fill="currentColor" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} size={18} className="text-amber-500" fill="currentColor" />
              ))}
            </div>
            <p className="text-base sm:text-lg font-medium leading-relaxed" style={{ color: GREATS_TEXTO }}>{d.texto}</p>
            <p className="text-base font-bold" style={{ color: corPrimaria }}>{d.nome}</p>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div data-secao="rodape" className="text-center text-sm text-gray-600 px-6 py-6 border-t border-gray-200">
        {c.rodape_texto}
      </div>
    </div>
  )
}
