var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// js/landing-pages/src/config.js
var padrao = {
  // Base da API, JÁ com o "/api" (ex: "https://backend.onrender.com/api").
  apiUrl: "",
  // Headers de auth do painel (ex: () => ({ Authorization: `Bearer ${token}` })).
  getHeaders: () => ({}),
  // fetch usado nas chamadas autenticadas (ex: um fetch com retry de cold start).
  fetch: (...args) => fetch(...args),
  // Rota do painel (listagem; o editor é `${rotaPainel}/:id`) e prefixo da rota pública.
  rotaPainel: "/marketing/landing-pages",
  rotaPublica: "/lp",
  // Campo de telefone do formulário de lead ({ value, onChange, placeholder }).
  // Sem isso, usa um <input type="tel"> simples.
  TelefoneInput: null,
  // Avatar de quem criou a página ({ nome, fotoUrl, size }). Sem isso, iniciais.
  Avatar: null,
  // Título da aba na página pública quando a LP não tem meta_titulo nem nome.
  tituloPadrao: ""
};
var config = { ...padrao };
function configurarLandingPages(opcoes = {}) {
  config = { ...padrao, ...opcoes };
}
function getConfig() {
  return config;
}

// js/landing-pages/src/templates.jsx
import { useState, useEffect } from "react";
import { Image as ImageIcon, MessageCircle, Gem, Footprints, RotateCcw, Star, Quote } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
var GREATS_FEATURES_PADRAO = [
  { titulo: "FEITOS \xC0 M\xC3O", descricao: "Produzidos com aten\xE7\xE3o aos m\xEDnimos detalhes, por artes\xE3os experientes." },
  { titulo: "MATERIAIS PREMIUM", descricao: "Usamos apenas materiais de alta qualidade, por dentro e por fora." },
  { titulo: "TROCA GR\xC1TIS", descricao: "Se n\xE3o servir perfeitamente, trocamos sem custo em at\xE9 21 dias." }
];
var GREATS_DEPOIMENTOS_PADRAO = [
  { texto: "Atendimento incr\xEDvel e produto de alt\xEDssima qualidade.", nome: "Cliente satisfeito" },
  { texto: "Chegou r\xE1pido e \xE9 ainda melhor do que nas fotos.", nome: "Cliente satisfeito" }
];
var LANDING_PAGE_TEMPLATES = {
  simples: {
    nome: "Simples",
    descricao: "Hero + texto livre + CTA \u2014 ideal para uma oferta \xFAnica e direta.",
    secoes: [{ id: "hero", nome: "Topo (t\xEDtulo e imagem)" }, { id: "texto", nome: "Texto livre" }, { id: "formulario", nome: "Formul\xE1rio de contato" }],
    secaoContatoPadrao: "formulario",
    campos: [
      { chave: "titulo", label: "T\xEDtulo (hero)", tipo: "texto_curto", placeholder: "Ex: \xD3culos completo a partir de R$ 250" },
      { chave: "subtitulo", label: "Subt\xEDtulo", tipo: "texto_curto", placeholder: "Ex: Arma\xE7\xE3o + lente, com receita ou sem" },
      { chave: "imagem_url", label: "Imagem principal", tipo: "imagem" },
      { chave: "texto", label: "Texto livre", tipo: "texto_longo", placeholder: "Conte mais sobre a oferta..." },
      { chave: "cta_texto", label: "Texto do bot\xE3o", tipo: "texto_curto", placeholder: "Ex: Quero garantir o meu" }
    ],
    Render: ({ conteudo, onLead }) => /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto px-5 py-10 text-center", children: [
      /* @__PURE__ */ jsxs("div", { "data-secao": "hero", children: [
        conteudo.imagem_url && /* @__PURE__ */ jsx("img", { src: conteudo.imagem_url, alt: "", className: "w-full rounded-2xl mb-6 object-cover max-h-72" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-2", children: conteudo.titulo || "T\xEDtulo da oferta" }),
        conteudo.subtitulo && /* @__PURE__ */ jsx("p", { className: "text-base text-gray-500 mb-5", children: conteudo.subtitulo })
      ] }),
      conteudo.texto && /* @__PURE__ */ jsx("p", { "data-secao": "texto", className: "text-sm text-gray-600 whitespace-pre-wrap mb-8", children: conteudo.texto }),
      /* @__PURE__ */ jsx("div", { "data-secao": "formulario", children: /* @__PURE__ */ jsx(FormularioLead, { ctaTexto: conteudo.cta_texto, onLead }) })
    ] })
  },
  promocao: {
    nome: "Promo\xE7\xE3o",
    descricao: "Hero + imagem de produto + lista de benef\xEDcios + CTA.",
    secoes: [{ id: "hero", nome: "Topo (t\xEDtulo e imagem)" }, { id: "beneficios", nome: "Benef\xEDcios" }, { id: "formulario", nome: "Formul\xE1rio de contato" }],
    secaoContatoPadrao: "formulario",
    cores: () => ({ destaque: "#8B5CF6" }),
    campos: [
      { chave: "titulo", label: "T\xEDtulo (hero)", tipo: "texto_curto", placeholder: "Ex: Promo\xE7\xE3o de agosto" },
      { chave: "subtitulo", label: "Subt\xEDtulo", tipo: "texto_curto" },
      { chave: "imagem_url", label: "Imagem do produto", tipo: "imagem" },
      { chave: "beneficios", label: "Benef\xEDcios", tipo: "lista", placeholder: "Ex: Frete gr\xE1tis pra SC" },
      { chave: "cta_texto", label: "Texto do bot\xE3o", tipo: "texto_curto", placeholder: "Ex: Quero aproveitar" }
    ],
    Render: ({ conteudo, onLead }) => /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto px-5 py-10", children: [
      /* @__PURE__ */ jsxs("div", { "data-secao": "hero", className: "text-center mb-6", children: [
        conteudo.imagem_url && /* @__PURE__ */ jsx("img", { src: conteudo.imagem_url, alt: "", className: "w-full rounded-2xl mb-6 object-cover max-h-72" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-2", children: conteudo.titulo || "T\xEDtulo da promo\xE7\xE3o" }),
        conteudo.subtitulo && /* @__PURE__ */ jsx("p", { className: "text-base text-gray-500", children: conteudo.subtitulo })
      ] }),
      Array.isArray(conteudo.beneficios) && conteudo.beneficios.length > 0 && /* @__PURE__ */ jsx("ul", { "data-secao": "beneficios", className: "space-y-2 mb-8", children: conteudo.beneficios.filter(Boolean).map((b, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-gray-700", children: [
        /* @__PURE__ */ jsx("span", { className: "mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" }),
        b
      ] }, i)) }),
      /* @__PURE__ */ jsx("div", { "data-secao": "formulario", children: /* @__PURE__ */ jsx(FormularioLead, { ctaTexto: conteudo.cta_texto, onLead }) })
    ] })
  },
  agendar_consulta: {
    nome: "Agendar consulta",
    descricao: "Hero + CTA de WhatsApp + FAQ.",
    secoes: [{ id: "hero", nome: "Topo (t\xEDtulo e imagem)" }, { id: "contato", nome: "Bot\xE3o de WhatsApp / formul\xE1rio" }, { id: "faq", nome: "Perguntas frequentes" }],
    secaoContatoPadrao: "contato",
    cores: () => ({ principal: "#059669" }),
    campos: [
      { chave: "titulo", label: "T\xEDtulo (hero)", tipo: "texto_curto", placeholder: "Ex: Agende sua consulta" },
      { chave: "subtitulo", label: "Subt\xEDtulo", tipo: "texto_curto" },
      { chave: "imagem_url", label: "Imagem principal", tipo: "imagem" },
      { chave: "whatsapp_numero", label: "N\xFAmero do WhatsApp (s\xF3 d\xEDgitos, com DDI)", tipo: "texto_curto", placeholder: "Ex: 5511999999999" },
      { chave: "whatsapp_mensagem", label: "Mensagem pr\xE9-preenchida do WhatsApp", tipo: "texto_curto", placeholder: "Ex: Ol\xE1, quero agendar uma consulta" },
      { chave: "cta_texto", label: "Texto do bot\xE3o de WhatsApp", tipo: "texto_curto", placeholder: "Ex: Agendar pelo WhatsApp" },
      { chave: "faq", label: "Perguntas frequentes", tipo: "lista_faq" }
    ],
    Render: ({ conteudo, onLead }) => {
      const wppUrl = conteudo.whatsapp_numero ? `https://wa.me/${conteudo.whatsapp_numero}?text=${encodeURIComponent(conteudo.whatsapp_mensagem || "Ol\xE1, quero agendar uma consulta")}` : null;
      return /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto px-5 py-10", children: [
        /* @__PURE__ */ jsxs("div", { "data-secao": "hero", className: "text-center mb-6", children: [
          conteudo.imagem_url && /* @__PURE__ */ jsx("img", { src: conteudo.imagem_url, alt: "", className: "w-full rounded-2xl mb-6 object-cover max-h-72" }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-2", children: conteudo.titulo || "Agende sua consulta" }),
          conteudo.subtitulo && /* @__PURE__ */ jsx("p", { className: "text-base text-gray-500", children: conteudo.subtitulo })
        ] }),
        /* @__PURE__ */ jsx("div", { "data-secao": "contato", children: wppUrl ? /* @__PURE__ */ jsxs(
          "a",
          {
            href: wppUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors mb-8",
            children: [
              /* @__PURE__ */ jsx(MessageCircle, { size: 18 }),
              conteudo.cta_texto || "Agendar pelo WhatsApp"
            ]
          }
        ) : /* @__PURE__ */ jsx(FormularioLead, { ctaTexto: conteudo.cta_texto, onLead }) }),
        Array.isArray(conteudo.faq) && conteudo.faq.length > 0 && /* @__PURE__ */ jsx("div", { "data-secao": "faq", className: "mt-8 space-y-4", children: conteudo.faq.filter((f) => f?.pergunta).map((f, i) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900", children: f.pergunta }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: f.resposta })
        ] }, i)) })
      ] });
    }
  },
  // Réplica fiel de layout/proporções/fonte de uma landing page de e-commerce
  // premium (referência: "Greats", marca de sapatos, estilo Unbounce) — só
  // conteúdo, fotos e paleta de cores são editáveis; a estrutura das seções
  // é fixa de propósito, pra nunca "errar" o resultado visual. Ver
  // CLAUDE.md do repo otica-compartilhado pro racional completo.
  greats: {
    nome: "Greats",
    descricao: "Layout premium de e-commerce (hero, mosaico de fotos, CTAs) \u2014 fiel a uma refer\xEAncia real.",
    secoes: [
      { id: "hero", nome: "Hero" },
      { id: "selos", nome: "Selos de confian\xE7a" },
      { id: "banner", nome: "Imagem de destaque" },
      { id: "mosaico_1", nome: "Mosaico 1" },
      { id: "faixa_cta", nome: "Faixa de CTA" },
      { id: "mosaico_2", nome: "Mosaico 2" },
      { id: "colecoes", nome: "Cole\xE7\xF5es (coluna 1 / coluna 2)" },
      { id: "depoimentos", nome: "Depoimentos" },
      { id: "rodape", nome: "Rodap\xE9" }
    ],
    secaoContatoPadrao: "faixa_cta",
    cores: (c) => ({ principal: c.cor_primaria || "#1E3A5F", destaque: c.cor_secundaria || "#E5B3A0" }),
    campos: [
      { chave: "cor_primaria", label: "Cor principal (t\xEDtulos, bot\xF5es)", tipo: "cor", padrao: "#1E3A5F" },
      { chave: "cor_secundaria", label: "Cor de destaque (se\xE7\xE3o feminino)", tipo: "cor", padrao: "#E5B3A0" },
      { chave: "selo_texto", label: "Selo no topo do hero", tipo: "texto_curto", placeholder: "Ex: SUA MARCA" },
      { chave: "hero_imagem", label: "Imagem de fundo do hero", tipo: "imagem" },
      { chave: "hero_escurecimento", label: "Pel\xEDcula escura sobre a imagem do hero", tipo: "intensidade", min: 0, max: 80, passo: 5, padrao: 25, unidade: "%", rotuloMin: "Mais clara", rotuloMax: "Mais escura" },
      { chave: "hero_titulo", label: "T\xEDtulo do hero", tipo: "texto_curto", placeholder: "Ex: O QUE PROCURAR EM \xD3CULOS DE QUALIDADE" },
      { chave: "hero_cta_texto", label: "Texto do bot\xE3o do hero", tipo: "texto_curto", placeholder: "Ex: VER COLE\xC7\xC3O" },
      { chave: "hero_cta_url", label: "Link do bot\xE3o do hero", tipo: "texto_curto", placeholder: "https://..." },
      { chave: "features", label: "Selos de confian\xE7a (3 itens)", tipo: "lista_features", padrao: GREATS_FEATURES_PADRAO, icones: GREATS_ICONES },
      { chave: "banner_imagem", label: "Imagem de destaque (detalhe do produto)", tipo: "imagem" },
      { chave: "banner_anotacao", label: "Legenda do detalhe", tipo: "texto_curto", placeholder: "Ex: ARMA\xC7\xC3O 100% ACETATO ITALIANO" },
      { chave: "bloco_1", label: "Bloco 1 (texto, com CTA)", tipo: "bloco" },
      { chave: "mosaico_1_imagem", label: "Imagem do mosaico 1 (superior direita)", tipo: "imagem" },
      { chave: "mosaico_2_imagem", label: "Imagem do mosaico 1 (inferior esquerda, maior)", tipo: "imagem" },
      { chave: "bloco_2", label: "Bloco 2 (texto, com CTA)", tipo: "bloco" },
      { chave: "bloco_3", label: "Bloco 3 (texto, sem CTA)", tipo: "bloco", semCta: true },
      { chave: "cta2_imagem", label: "Imagem da faixa de CTA", tipo: "imagem" },
      { chave: "cta2_bloco", label: "Texto da faixa de CTA", tipo: "bloco" },
      { chave: "bloco_4", label: "Bloco 4 (texto, sem CTA)", tipo: "bloco", semCta: true },
      { chave: "mosaico_3_imagem", label: "Imagem do mosaico 2 (superior direita)", tipo: "imagem" },
      { chave: "mosaico_4_imagem", label: "Imagem do mosaico 2 (inferior esquerda)", tipo: "imagem" },
      { chave: "bloco_5", label: "Bloco 5 (texto, sem CTA)", tipo: "bloco", semCta: true },
      { chave: "men_titulo", label: "T\xEDtulo coluna 1 (ex: MASCULINO)", tipo: "texto_curto", placeholder: "MASCULINO" },
      { chave: "men_cta_texto", label: "Texto do bot\xE3o \u2014 coluna 1", tipo: "texto_curto", placeholder: "VER COLE\xC7\xC3O" },
      { chave: "men_cta_url", label: "Link do bot\xE3o \u2014 coluna 1", tipo: "texto_curto" },
      { chave: "women_titulo", label: "T\xEDtulo coluna 2 (ex: FEMININO)", tipo: "texto_curto", placeholder: "FEMININO" },
      { chave: "women_cta_texto", label: "Texto do bot\xE3o \u2014 coluna 2", tipo: "texto_curto", placeholder: "VER COLE\xC7\xC3O" },
      { chave: "women_cta_url", label: "Link do bot\xE3o \u2014 coluna 2", tipo: "texto_curto" },
      { chave: "depoimentos", label: "Depoimentos", tipo: "lista_depoimentos", padrao: GREATS_DEPOIMENTOS_PADRAO },
      { chave: "rodape_texto", label: "Texto do rodap\xE9", tipo: "texto_curto", placeholder: "Ex: \xA9 2026 Sua marca. Todos os direitos reservados." }
    ],
    Render: ({ conteudo }) => /* @__PURE__ */ jsx(GreatsRender, { conteudo })
  }
};
function secaoContatoDaPagina(templateId, conteudo) {
  const t = LANDING_PAGE_TEMPLATES[templateId];
  if (!t) return null;
  const escolhida = conteudo?.secao_contato;
  return t.secoes?.some((s) => s.id === escolhida) ? escolhida : t.secaoContatoPadrao;
}
var COR_PADRAO_PAGINA = "#111827";
function coresDaPagina(templateId, conteudo) {
  const t = LANDING_PAGE_TEMPLATES[templateId];
  const cores = t?.cores ? t.cores(conteudo || {}) : {};
  return { principal: cores.principal || COR_PADRAO_PAGINA, destaque: cores.destaque || cores.principal || COR_PADRAO_PAGINA };
}
var TEMPLATE_LIST = Object.entries(LANDING_PAGE_TEMPLATES).map(([id, t]) => ({
  id,
  nome: t.nome,
  descricao: t.descricao
}));
function TemplateCardPreview({ templateId }) {
  if (templateId === "agendar_consulta") {
    return /* @__PURE__ */ jsxs("div", { className: "w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx("div", { className: "h-6 rounded bg-gray-200 flex items-center justify-center", children: /* @__PURE__ */ jsx(ImageIcon, { size: 12, className: "text-gray-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "h-2 w-3/4 rounded bg-gray-300" }),
      /* @__PURE__ */ jsx("div", { className: "h-4 rounded bg-emerald-200 mt-auto" })
    ] });
  }
  if (templateId === "greats") {
    return /* @__PURE__ */ jsxs("div", { className: "w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-1.5 flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx("div", { className: "h-9 rounded bg-slate-700 flex items-center justify-center", children: /* @__PURE__ */ jsx(ImageIcon, { size: 12, className: "text-slate-300" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 rounded bg-white border border-gray-200" }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 rounded bg-gray-200" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 h-2.5 rounded bg-slate-700" }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 h-2.5 rounded", style: { background: "#E5B3A0" } })
      ] })
    ] });
  }
  if (templateId === "promocao") {
    return /* @__PURE__ */ jsxs("div", { className: "w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx("div", { className: "h-8 rounded bg-gray-200 flex items-center justify-center", children: /* @__PURE__ */ jsx(ImageIcon, { size: 14, className: "text-gray-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full rounded bg-gray-300" }),
      /* @__PURE__ */ jsx("div", { className: "h-1.5 w-2/3 rounded bg-gray-300" }),
      /* @__PURE__ */ jsx("div", { className: "h-3 rounded bg-violet-200 mt-auto" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5", children: [
    /* @__PURE__ */ jsx("div", { className: "h-2 w-3/4 rounded bg-gray-300 mx-auto" }),
    /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full rounded bg-gray-200" }),
    /* @__PURE__ */ jsx("div", { className: "h-1.5 w-5/6 rounded bg-gray-200" }),
    /* @__PURE__ */ jsx("div", { className: "h-4 rounded bg-gray-300 mt-auto" })
  ] });
}
function FormularioLead({ ctaTexto, onLead }) {
  if (!onLead) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-9 rounded-lg bg-white border border-gray-200" }),
      /* @__PURE__ */ jsx("div", { className: "h-9 rounded-lg bg-white border border-gray-200" }),
      /* @__PURE__ */ jsx("div", { className: "h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white text-sm font-medium", children: ctaTexto || "Quero saber mais" })
    ] });
  }
  return /* @__PURE__ */ jsx(FormularioLeadInterativo, { ctaTexto, onLead });
}
function FormularioLeadInterativo({ ctaTexto, onLead }) {
  const TelefoneInput = getConfig().TelefoneInput || TelefoneInputSimples;
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim() || !telefone) return;
    setEnviando(true);
    try {
      await onLead({ nome: nome.trim(), telefone });
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  }
  if (enviado) {
    return /* @__PURE__ */ jsx("div", { className: "bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-sm text-emerald-700 font-medium", children: "Recebemos seus dados! Em breve entramos em contato. \u{1F60A}" });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        value: nome,
        onChange: (e) => setNome(e.target.value),
        placeholder: "Seu nome",
        className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white",
        required: true
      }
    ),
    /* @__PURE__ */ jsx(TelefoneInput, { value: telefone, onChange: setTelefone, placeholder: "Seu WhatsApp" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: enviando,
        className: "w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors",
        children: enviando ? "Enviando..." : ctaTexto || "Quero saber mais"
      }
    )
  ] });
}
function TelefoneInputSimples({ value, onChange, placeholder }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type: "tel",
      inputMode: "tel",
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder: placeholder || "(11) 99999-9999",
      className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white",
      required: true
    }
  );
}
var GREATS_FONT_HREF = "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&display=swap";
var GREATS_FONT_STACK = "'Montserrat', ui-sans-serif, system-ui, sans-serif";
function useGreatsFont() {
  useEffect(() => {
    if (document.querySelector(`link[href="${GREATS_FONT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GREATS_FONT_HREF;
    document.head.appendChild(link);
  }, []);
}
function GreatsImg({ src, className, alt = "" }) {
  if (src) return /* @__PURE__ */ jsx("img", { src, alt, className });
  return /* @__PURE__ */ jsx("div", { className: `${className} bg-gray-200 flex items-center justify-center`, children: /* @__PURE__ */ jsx(ImageIcon, { size: 28, className: "text-gray-400" }) });
}
function GreatsBotao({ texto, url, variante = "escuro", cor }) {
  if (!texto) return null;
  const claro = variante === "claro";
  return /* @__PURE__ */ jsx(
    "a",
    {
      href: url || void 0,
      target: url ? "_blank" : void 0,
      rel: "noopener noreferrer",
      className: "inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase text-center transition-opacity hover:opacity-90",
      style: claro ? { background: "#fff", color: cor } : { background: cor, color: "#fff" },
      children: texto
    }
  );
}
function GreatsBloco({ bloco, corPrimaria, fundo = "branco", className = "" }) {
  const v = bloco || {};
  const escuro = fundo === "escuro";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex flex-col justify-center gap-3 p-8 sm:p-10 ${className}`,
      style: { background: escuro ? corPrimaria : fundo === "cinza" ? "#F5F4F2" : "#fff" },
      children: [
        /* @__PURE__ */ jsx(
          "h3",
          {
            className: "text-lg sm:text-xl font-extrabold uppercase tracking-tight leading-snug",
            style: { color: escuro ? "#fff" : corPrimaria },
            children: v.titulo || "T\xEDtulo do bloco"
          }
        ),
        v.texto && /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: escuro ? "rgba(255,255,255,0.85)" : "#6B7280" }, children: v.texto }),
        v.cta_texto && /* @__PURE__ */ jsx("div", { className: "pt-1", children: /* @__PURE__ */ jsx(GreatsBotao, { texto: v.cta_texto, url: v.cta_url, variante: escuro ? "claro" : "escuro", cor: corPrimaria }) })
      ]
    }
  );
}
var GREATS_ICONES = [Gem, Footprints, RotateCcw];
var GREATS_ESCURECIMENTO_PADRAO = 25;
function GreatsRender({ conteudo }) {
  useGreatsFont();
  const c = conteudo || {};
  const corPrimaria = c.cor_primaria || "#1E3A5F";
  const corSecundaria = c.cor_secundaria || "#E5B3A0";
  const escurecimentoHero = Number.isFinite(Number(c.hero_escurecimento)) && c.hero_escurecimento !== "" && c.hero_escurecimento != null ? Number(c.hero_escurecimento) : GREATS_ESCURECIMENTO_PADRAO;
  const features = Array.isArray(c.features) && c.features.length > 0 ? c.features : GREATS_FEATURES_PADRAO;
  const depoimentos = Array.isArray(c.depoimentos) && c.depoimentos.length > 0 ? c.depoimentos : GREATS_DEPOIMENTOS_PADRAO;
  return /* @__PURE__ */ jsxs("div", { style: { fontFamily: GREATS_FONT_STACK }, className: "bg-white", children: [
    /* @__PURE__ */ jsxs("div", { "data-secao": "hero", className: "relative w-full min-h-[380px] sm:min-h-[440px] flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden", children: [
      c.hero_imagem ? /* @__PURE__ */ jsx("img", { src: c.hero_imagem, alt: "", className: "absolute inset-0 w-full h-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-300" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: { background: `rgba(0, 0, 0, ${escurecimentoHero / 100})` } }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center gap-5", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-white",
            style: { background: corPrimaria },
            children: c.selo_texto || "SUA MARCA"
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold uppercase text-white leading-tight max-w-md drop-shadow-md", children: c.hero_titulo || "T\xEDtulo de impacto para o seu produto" }),
        /* @__PURE__ */ jsx(GreatsBotao, { texto: c.hero_cta_texto || "SAIBA MAIS", url: c.hero_cta_url, variante: "escuro", cor: corPrimaria })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { "data-secao": "selos", className: "grid grid-cols-3 gap-3 sm:gap-6 px-4 sm:px-10 py-10", style: { background: "#F7F6F4" }, children: features.slice(0, 3).map((f, i) => {
      const Icone = GREATS_ICONES[i % GREATS_ICONES.length];
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        f.icone_url ? (
          // Caixa fixa + object-contain: qualquer PNG fica do mesmo tamanho, sem distorcer.
          /* @__PURE__ */ jsx("img", { src: f.icone_url, alt: "", className: "w-6 h-6 object-contain" })
        ) : /* @__PURE__ */ jsx(Icone, { size: 22, style: { color: corPrimaria }, strokeWidth: 1.75 }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] sm:text-xs font-bold uppercase tracking-wide", style: { color: corPrimaria }, children: f.titulo || "Selo" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs text-gray-500 leading-snug", children: f.descricao })
      ] }, i);
    }) }),
    /* @__PURE__ */ jsxs("div", { "data-secao": "banner", className: "relative w-full", children: [
      /* @__PURE__ */ jsx(GreatsImg, { src: c.banner_imagem, className: "w-full h-56 sm:h-72 object-cover" }),
      c.banner_anotacao && /* @__PURE__ */ jsx("div", { className: "absolute left-3 bottom-3 sm:left-6 sm:bottom-6 bg-white/95 px-3 py-1.5 flex items-center gap-1.5 shadow-sm", children: /* @__PURE__ */ jsx("span", { className: "text-gray-900 text-[11px] sm:text-xs font-bold uppercase tracking-wide", children: c.banner_anotacao }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { "data-secao": "mosaico_1", className: "grid grid-cols-2", children: [
      /* @__PURE__ */ jsx(GreatsBloco, { bloco: c.bloco_1, corPrimaria, fundo: "branco" }),
      /* @__PURE__ */ jsx(GreatsImg, { src: c.mosaico_1_imagem, className: "w-full aspect-[4/5] object-cover" }),
      /* @__PURE__ */ jsx(GreatsImg, { src: c.mosaico_2_imagem, className: "w-full aspect-[4/5] object-cover" }),
      /* @__PURE__ */ jsx(GreatsBloco, { bloco: c.bloco_2, corPrimaria, fundo: "escuro" }),
      /* @__PURE__ */ jsx("div", { className: "col-span-2 sm:col-span-1 sm:col-start-2", children: /* @__PURE__ */ jsx(GreatsBloco, { bloco: c.bloco_3, corPrimaria, fundo: "cinza" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { "data-secao": "faixa_cta", className: "grid grid-cols-2 items-stretch", style: { background: "#F7F6F4" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center gap-3 p-8 sm:p-10", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-2xl font-extrabold uppercase tracking-tight", style: { color: corPrimaria }, children: c.cta2_bloco?.titulo || "Confira nossa cole\xE7\xE3o" }),
        c.cta2_bloco?.texto && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: c.cta2_bloco.texto }),
        /* @__PURE__ */ jsx("div", { className: "pt-1", children: /* @__PURE__ */ jsx(GreatsBotao, { texto: c.cta2_bloco?.cta_texto || "VER COLE\xC7\xC3O", url: c.cta2_bloco?.cta_url, variante: "escuro", cor: corPrimaria }) })
      ] }),
      /* @__PURE__ */ jsx(GreatsImg, { src: c.cta2_imagem, className: "w-full h-full min-h-[220px] object-cover" })
    ] }),
    /* @__PURE__ */ jsxs("div", { "data-secao": "mosaico_2", className: "grid grid-cols-2", children: [
      /* @__PURE__ */ jsx(GreatsBloco, { bloco: c.bloco_4, corPrimaria, fundo: "escuro" }),
      /* @__PURE__ */ jsx(GreatsImg, { src: c.mosaico_3_imagem, className: "w-full aspect-square object-cover" }),
      /* @__PURE__ */ jsx(GreatsImg, { src: c.mosaico_4_imagem, className: "w-full aspect-square object-cover" }),
      /* @__PURE__ */ jsx(GreatsBloco, { bloco: c.bloco_5, corPrimaria, fundo: "branco" })
    ] }),
    /* @__PURE__ */ jsxs("div", { "data-secao": "colecoes", className: "grid grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-14 px-4", style: { background: corPrimaria }, children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white text-lg sm:text-xl font-extrabold uppercase tracking-wide", children: c.men_titulo || "MASCULINO" }),
        /* @__PURE__ */ jsx(GreatsBotao, { texto: c.men_cta_texto || "VER AGORA", url: c.men_cta_url, variante: "claro", cor: corPrimaria })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-14 px-4", style: { background: corSecundaria }, children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white text-lg sm:text-xl font-extrabold uppercase tracking-wide", children: c.women_titulo || "FEMININO" }),
        /* @__PURE__ */ jsx(GreatsBotao, { texto: c.women_cta_texto || "VER AGORA", url: c.women_cta_url, variante: "claro", cor: corSecundaria })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { "data-secao": "depoimentos", className: "grid grid-cols-2 gap-4 sm:gap-8 px-4 sm:px-10 py-12 text-center", children: depoimentos.slice(0, 2).map((d, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsx(Quote, { size: 16, className: "text-gray-300", fill: "currentColor" }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-0.5", children: Array.from({ length: 5 }).map((_, j) => /* @__PURE__ */ jsx(Star, { size: 13, className: "text-amber-400", fill: "currentColor" }, j)) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-gray-600 leading-relaxed", children: d.texto }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold", style: { color: corPrimaria }, children: d.nome })
    ] }, i)) }),
    /* @__PURE__ */ jsx("div", { "data-secao": "rodape", className: "text-center text-[11px] text-gray-400 py-6 border-t border-gray-100", children: c.rodape_texto || `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Todos os direitos reservados.` })
  ] });
}

// js/landing-pages/src/LandingPagesLista.jsx
import { useEffect as useEffect3, useState as useState3 } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Plus, X as X2, Copy, CopyPlus, Trash2 as Trash22, Eye, Users, ExternalLink, Play, Pause, Check, Settings } from "lucide-react";

// js/landing-pages/src/ModalConfiguracoes.jsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";
import { X, Upload, Trash2 } from "lucide-react";

// js/landing-pages/src/api.js
var api_exports = {};
__export(api_exports, {
  atualizarLandingPage: () => atualizarLandingPage,
  buscarLandingPagePublica: () => buscarLandingPagePublica,
  criarLandingPage: () => criarLandingPage,
  deletarLandingPage: () => deletarLandingPage,
  duplicarLandingPage: () => duplicarLandingPage,
  enviarLeadLandingPage: () => enviarLeadLandingPage,
  listarLandingPages: () => listarLandingPages,
  listarLeadsLandingPage: () => listarLeadsLandingPage,
  listarTemplates: () => listarTemplates,
  obterConfiguracoes: () => obterConfiguracoes,
  obterLandingPage: () => obterLandingPage,
  pausarLandingPage: () => pausarLandingPage,
  publicarLandingPage: () => publicarLandingPage,
  registrarVisualizacao: () => registrarVisualizacao,
  salvarConfiguracoes: () => salvarConfiguracoes,
  uploadImagemLandingPage: () => uploadImagemLandingPage
});
function base() {
  return `${getConfig().apiUrl.replace(/\/$/, "")}/landing-pages`;
}
function headers(extra = {}) {
  return { ...getConfig().getHeaders(), ...extra };
}
function req(url, opcoes = {}) {
  return getConfig().fetch(url, opcoes);
}
async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Erro na requisi\xE7\xE3o");
  }
  if (res.status === 204) return null;
  return res.json();
}
async function listarTemplates() {
  return handle(await req(`${base()}/templates`, { headers: headers() }));
}
async function listarLandingPages() {
  return handle(await req(base(), { headers: headers() }));
}
async function obterLandingPage(id) {
  return handle(await req(`${base()}/${id}`, { headers: headers() }));
}
async function criarLandingPage(payload) {
  return handle(await req(base(), {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  }));
}
async function atualizarLandingPage(id, payload) {
  return handle(await req(`${base()}/${id}`, {
    method: "PUT",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  }));
}
async function publicarLandingPage(id) {
  return handle(await req(`${base()}/${id}/publicar`, { method: "POST", headers: headers() }));
}
async function pausarLandingPage(id) {
  return handle(await req(`${base()}/${id}/pausar`, { method: "POST", headers: headers() }));
}
async function duplicarLandingPage(id) {
  return handle(await req(`${base()}/${id}/duplicar`, { method: "POST", headers: headers() }));
}
async function deletarLandingPage(id) {
  return handle(await req(`${base()}/${id}`, { method: "DELETE", headers: headers() }));
}
async function listarLeadsLandingPage(id) {
  return handle(await req(`${base()}/${id}/leads`, { headers: headers() }));
}
async function uploadImagemLandingPage(file) {
  const formData = new FormData();
  formData.append("imagem", file);
  return handle(await req(`${base()}/upload-imagem`, {
    method: "POST",
    headers: headers(),
    body: formData
  }));
}
function basePublica() {
  return `${getConfig().apiUrl.replace(/\/$/, "")}/publico/landing-pages`;
}
async function handlePublico(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.detail || "Erro na requisi\xE7\xE3o");
    err.status = res.status;
    throw err;
  }
  return res.json();
}
async function buscarLandingPagePublica(slug) {
  return handlePublico(await fetch(`${basePublica()}/${slug}`));
}
async function registrarVisualizacao(slug) {
  try {
    await fetch(`${basePublica()}/${slug}/visualizacao`, { method: "POST" });
  } catch {
  }
}
async function enviarLeadLandingPage(slug, payload) {
  return handlePublico(await fetch(`${basePublica()}/${slug}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }));
}
async function obterConfiguracoes() {
  return handle(await req(`${base()}/configuracoes`, { headers: headers() }));
}
async function salvarConfiguracoes(payload) {
  return handle(await req(`${base()}/configuracoes`, {
    method: "PUT",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  }));
}

// js/landing-pages/src/Moldura.jsx
import { useRef } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var WHATSAPP_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";
function IconeWhatsApp({ className = "w-7 h-7" }) {
  return /* @__PURE__ */ jsx2("svg", { viewBox: "0 0 24 24", className, fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx2("path", { d: WHATSAPP_PATH }) });
}
function linkWhatsApp(numero, mensagem) {
  return `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}
var ESTILO_PULSO = `
@keyframes otica-lp-pulso {
  0% { transform: scale(1); opacity: .55; }
  70% { transform: scale(2.1); opacity: 0; }
  100% { transform: scale(2.1); opacity: 0; }
}
.otica-lp-pulso { animation: otica-lp-pulso 2.2s ease-out infinite; }
@media (prefers-reduced-motion: reduce) { .otica-lp-pulso { animation: none; opacity: 0; } }
`;
var COR_NOTIFICACAO = "#FF4B2B";
var ESTILO_TILT = `
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
`;
function BolinhaNotificacao() {
  return /* @__PURE__ */ jsxs2("span", { className: "absolute -top-0.5 -right-0.5 flex h-5 w-5", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx2("style", { children: ESTILO_PULSO }),
    /* @__PURE__ */ jsx2("span", { className: "otica-lp-pulso absolute inline-flex h-full w-full rounded-full", style: { background: COR_NOTIFICACAO } }),
    /* @__PURE__ */ jsx2(
      "span",
      {
        className: "relative inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold leading-none text-white ring-2 ring-white",
        style: { background: COR_NOTIFICACAO },
        children: "1"
      }
    )
  ] });
}
function BotaoWhatsApp({ href, notificacao }) {
  return /* @__PURE__ */ jsxs2(
    "a",
    {
      href,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Falar no WhatsApp",
      title: "Falar no WhatsApp",
      className: "relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-transform hover:scale-105",
      style: { background: "#25D366" },
      children: [
        /* @__PURE__ */ jsx2(IconeWhatsApp, {}),
        notificacao && /* @__PURE__ */ jsx2(BolinhaNotificacao, {})
      ]
    }
  );
}
function ancestralRolavel(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if ((overflowY === "auto" || overflowY === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}
function rolarSuaveAte(el, { duracao = 900, folga = 16 } = {}) {
  if (!el) return;
  const caixa = ancestralRolavel(el);
  const inicio = caixa ? caixa.scrollTop : window.scrollY;
  const topoRelativo = caixa ? el.getBoundingClientRect().top - caixa.getBoundingClientRect().top : el.getBoundingClientRect().top;
  const maximo = caixa ? caixa.scrollHeight - caixa.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
  const destino = Math.max(0, Math.min(maximo, inicio + topoRelativo - folga));
  const rolar = (y) => caixa ? caixa.scrollTop = y : window.scrollTo(0, y);
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return rolar(destino);
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const t0 = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - t0) / duracao);
    rolar(inicio + (destino - inicio) * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}
function corDoCta(menu, coresPagina) {
  if (menu.cta_cor === "principal" && coresPagina?.principal) return coresPagina.principal;
  if (menu.cta_cor === "destaque" && coresPagina?.destaque) return coresPagina.destaque;
  return menu.cta_destino === "whatsapp" ? "#25D366" : "#111827";
}
function MenuTopo({ logo, menu, whatsapp, coresPagina, onIrParaContato, refMenu }) {
  const vaiProContato = menu.cta_destino === "contato";
  const ctaUrl = vaiProContato ? "#contato" : menu.cta_destino === "whatsapp" && whatsapp?.numero ? linkWhatsApp(whatsapp.numero, whatsapp.mensagem) : menu.cta_url;
  const cta = menu.cta_texto && ctaUrl;
  const ehWhatsapp = menu.cta_destino === "whatsapp";
  return /* @__PURE__ */ jsxs2(
    "header",
    {
      ref: refMenu,
      className: `bg-white border-b border-gray-100 px-5 sm:px-8 py-3 flex items-center justify-center sm:justify-between gap-4 min-h-[64px] ${menu.fixo ? "sticky top-0 z-40" : ""}`,
      children: [
        logo ? /* @__PURE__ */ jsx2("img", { src: logo, alt: "Logo", className: "h-10 sm:h-11 w-auto max-w-[200px] object-contain" }) : /* @__PURE__ */ jsx2("span", {}),
        cta && /* @__PURE__ */ jsxs2(
          "a",
          {
            href: ctaUrl,
            ...vaiProContato ? { onClick: (e) => {
              e.preventDefault();
              onIrParaContato();
            } } : { target: "_blank", rel: "noopener noreferrer" },
            className: `hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${menu.cta_tilt ? "otica-lp-tilt" : ""}`,
            style: { background: corDoCta(menu, coresPagina) },
            children: [
              menu.cta_tilt && /* @__PURE__ */ jsx2("style", { children: ESTILO_TILT }),
              ehWhatsapp && /* @__PURE__ */ jsx2(IconeWhatsApp, { className: "w-4 h-4" }),
              menu.cta_texto
            ]
          }
        )
      ]
    }
  );
}
function MolduraLandingPage({ configuracoes, preview = false, secaoContato = null, coresPagina = null, children }) {
  const raiz = useRef(null);
  const refMenu = useRef(null);
  const logo = configuracoes?.marca?.logo_url;
  const w = configuracoes?.whatsapp;
  const wpp = w?.ativo && w?.numero ? linkWhatsApp(w.numero, w.mensagem) : null;
  const menu = configuracoes?.menu;
  const notificacao = w?.notificacao !== false;
  return /* @__PURE__ */ jsxs2("div", { ref: raiz, className: "bg-white", children: [
    menu?.ativo && /* @__PURE__ */ jsx2(
      MenuTopo,
      {
        logo,
        menu,
        whatsapp: w,
        coresPagina,
        refMenu,
        onIrParaContato: () => rolarSuaveAte(
          raiz.current?.querySelector(`[data-secao="${secaoContato}"]`) || raiz.current?.querySelector("form"),
          { folga: 16 + (menu.fixo ? refMenu.current?.offsetHeight || 0 : 0) }
        )
      }
    ),
    !menu?.ativo && logo && /* @__PURE__ */ jsx2("header", { className: "bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-center", children: /* @__PURE__ */ jsx2("img", { src: logo, alt: "Logo", className: "h-10 sm:h-12 w-auto max-w-[220px] object-contain" }) }),
    children,
    wpp && (preview ? /* @__PURE__ */ jsx2("div", { className: "sticky bottom-0 h-0", children: /* @__PURE__ */ jsx2("div", { className: "absolute bottom-4 right-4", children: /* @__PURE__ */ jsx2(BotaoWhatsApp, { href: wpp, notificacao }) }) }) : /* @__PURE__ */ jsx2("div", { className: "fixed bottom-5 right-5 z-50", children: /* @__PURE__ */ jsx2(BotaoWhatsApp, { href: wpp, notificacao }) }))
  ] });
}

// js/landing-pages/src/ModalConfiguracoes.jsx
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";
function Interruptor({ ligado, onChange, label }) {
  return /* @__PURE__ */ jsx3(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": ligado,
      "aria-label": label,
      onClick: () => onChange(!ligado),
      className: `relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${ligado ? "bg-emerald-500" : "bg-gray-300"}`,
      children: /* @__PURE__ */ jsx3("span", { className: `inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${ligado ? "translate-x-5" : "translate-x-0.5"}` })
    }
  );
}
function ModalConfiguracoes({ onClose }) {
  const [cfg, setCfg] = useState2(null);
  const [erroCarregar, setErroCarregar] = useState2("");
  const [salvando, setSalvando] = useState2(false);
  const [enviandoLogo, setEnviandoLogo] = useState2(false);
  const [enviandoFavicon, setEnviandoFavicon] = useState2(false);
  const [erro, setErro] = useState2("");
  const [salvo, setSalvo] = useState2(false);
  const inputLogo = useRef2(null);
  const inputFavicon = useRef2(null);
  useEffect2(() => {
    obterConfiguracoes().then(setCfg).catch((e) => setErroCarregar(e.message));
  }, []);
  function setWhatsapp(campo, valor) {
    setCfg((c) => ({ ...c, whatsapp: { ...c.whatsapp, [campo]: valor } }));
    setSalvo(false);
  }
  function setMenu(campo, valor) {
    setCfg((c) => ({ ...c, menu: { ...c.menu, [campo]: valor } }));
    setSalvo(false);
  }
  function setMarca(campo, url) {
    setCfg((c) => ({ ...c, marca: { ...c.marca, [campo]: url } }));
    setSalvo(false);
  }
  const setLogo = (url) => setMarca("logo_url", url);
  async function handleFavicon(file) {
    if (!file) return;
    setEnviandoFavicon(true);
    setErro("");
    try {
      const { url } = await uploadImagemLandingPage(file);
      setMarca("favicon_url", url);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviandoFavicon(false);
      if (inputFavicon.current) inputFavicon.current.value = "";
    }
  }
  async function handleLogo(file) {
    if (!file) return;
    setEnviandoLogo(true);
    setErro("");
    try {
      const { url } = await uploadImagemLandingPage(file);
      setLogo(url);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviandoLogo(false);
      if (inputLogo.current) inputLogo.current.value = "";
    }
  }
  async function handleSalvar() {
    setSalvando(true);
    setErro("");
    try {
      const atualizado = await salvarConfiguracoes({ whatsapp: cfg.whatsapp, marca: cfg.marca, menu: cfg.menu });
      setCfg(atualizado);
      setSalvo(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }
  return /* @__PURE__ */ jsxs3("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4", children: [
    /* @__PURE__ */ jsx3("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxs3("div", { className: "relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]", children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-100", children: [
        /* @__PURE__ */ jsxs3("div", { children: [
          /* @__PURE__ */ jsx3("h2", { className: "text-base font-bold text-gray-900", children: "Configura\xE7\xF5es" }),
          /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400", children: "Valem para todas as landing pages" })
        ] }),
        /* @__PURE__ */ jsx3("button", { onClick: onClose, className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-400", "aria-label": "Fechar", children: /* @__PURE__ */ jsx3(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "p-5 overflow-y-auto space-y-6", children: [
        !cfg && !erroCarregar && /* @__PURE__ */ jsx3("p", { className: "text-sm text-gray-400 text-center py-6", children: "Carregando..." }),
        erroCarregar && /* @__PURE__ */ jsx3("p", { className: "text-sm text-red-600 text-center py-6", children: erroCarregar }),
        cfg && /* @__PURE__ */ jsxs3(Fragment, { children: [
          /* @__PURE__ */ jsxs3("section", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsx3("span", { className: "flex items-center justify-center w-8 h-8 rounded-full text-white", style: { background: "#25D366" }, children: /* @__PURE__ */ jsx3(IconeWhatsApp, { className: "w-4 h-4" }) }),
                /* @__PURE__ */ jsxs3("div", { children: [
                  /* @__PURE__ */ jsx3("p", { className: "text-sm font-semibold text-gray-900", children: "Bot\xE3o de WhatsApp" }),
                  /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-500", children: "Bot\xE3o verde flutuante no canto inferior direito de todas as p\xE1ginas." })
                ] })
              ] }),
              /* @__PURE__ */ jsx3(Interruptor, { ligado: cfg.whatsapp.ativo, onChange: (v) => setWhatsapp("ativo", v), label: "Ativar bot\xE3o de WhatsApp" })
            ] }),
            /* @__PURE__ */ jsxs3("div", { className: "space-y-3 pl-0 sm:pl-10", children: [
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "N\xFAmero do WhatsApp (com DDD)" }),
                /* @__PURE__ */ jsx3(
                  "input",
                  {
                    value: cfg.whatsapp.numero,
                    onChange: (e) => setWhatsapp("numero", e.target.value),
                    placeholder: "(11) 99999-9999",
                    inputMode: "tel",
                    className: inputCls
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Mensagem padr\xE3o" }),
                /* @__PURE__ */ jsx3(
                  "textarea",
                  {
                    value: cfg.whatsapp.mensagem,
                    onChange: (e) => setWhatsapp("mensagem", e.target.value),
                    rows: 3,
                    placeholder: "Ol\xE1! Vim pela p\xE1gina e gostaria de mais informa\xE7\xF5es.",
                    className: `${inputCls} resize-none`
                  }
                ),
                /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400 mt-1", children: "J\xE1 vem escrita quando o visitante abre a conversa." })
              ] }),
              cfg.whatsapp.ativo && /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsxs3("div", { children: [
                  /* @__PURE__ */ jsx3("p", { className: "text-xs font-medium text-gray-700", children: "Bolinha de notifica\xE7\xE3o" }),
                  /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400", children: "C\xEDrculo vermelho pulsando no bot\xE3o, como uma mensagem nova." })
                ] }),
                /* @__PURE__ */ jsx3(Interruptor, { ligado: cfg.whatsapp.notificacao !== false, onChange: (v) => setWhatsapp("notificacao", v), label: "Mostrar bolinha de notifica\xE7\xE3o" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs3("section", { className: "space-y-3 pt-5 border-t border-gray-100", children: [
            /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsx3("p", { className: "text-sm font-semibold text-gray-900", children: "Identidade de marca" }),
              /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-500", children: "O logo aparece no topo de todas as p\xE1ginas, e o favicon na aba do navegador." })
            ] }),
            cfg.marca.logo_url ? /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx3("div", { className: "flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3", children: /* @__PURE__ */ jsx3("img", { src: cfg.marca.logo_url, alt: "Logo", className: "h-12 w-auto max-w-[200px] object-contain" }) }),
              /* @__PURE__ */ jsxs3("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ jsxs3("button", { type: "button", onClick: () => inputLogo.current?.click(), disabled: enviandoLogo, className: "flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700", children: [
                  /* @__PURE__ */ jsx3(Upload, { size: 13 }),
                  " ",
                  enviandoLogo ? "Enviando..." : "Trocar logo"
                ] }),
                /* @__PURE__ */ jsxs3("button", { type: "button", onClick: () => setLogo(null), className: "flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600", children: [
                  /* @__PURE__ */ jsx3(Trash2, { size: 13 }),
                  " Remover"
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxs3(
              "button",
              {
                type: "button",
                onClick: () => inputLogo.current?.click(),
                disabled: enviandoLogo,
                className: "flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600",
                children: [
                  /* @__PURE__ */ jsx3(Upload, { size: 14 }),
                  enviandoLogo ? "Enviando..." : "Enviar logo"
                ]
              }
            ),
            /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400", children: "Dica: PNG com fundo transparente fica melhor." }),
            /* @__PURE__ */ jsx3("input", { ref: inputLogo, type: "file", accept: "image/*", className: "hidden", onChange: (e) => handleLogo(e.target.files?.[0]) }),
            /* @__PURE__ */ jsxs3("div", { className: "pt-2", children: [
              /* @__PURE__ */ jsx3("p", { className: "text-xs font-medium text-gray-700", children: "Favicon" }),
              /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400 mb-2", children: "O \xEDcone pequeno que aparece na aba do navegador, em todas as p\xE1ginas." }),
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-w-0", children: [
                  cfg.marca.favicon_url ? /* @__PURE__ */ jsx3("img", { src: cfg.marca.favicon_url, alt: "Favicon", className: "w-4 h-4 object-contain shrink-0" }) : /* @__PURE__ */ jsx3("span", { className: "w-4 h-4 rounded-sm bg-gray-300 shrink-0" }),
                  /* @__PURE__ */ jsx3("span", { className: "text-xs text-gray-500 truncate", children: cfg.marca.favicon_url ? "Seu favicon" : "Favicon padr\xE3o do site" })
                ] }),
                /* @__PURE__ */ jsxs3("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ jsxs3("button", { type: "button", onClick: () => inputFavicon.current?.click(), disabled: enviandoFavicon, className: "flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700", children: [
                    /* @__PURE__ */ jsx3(Upload, { size: 13 }),
                    " ",
                    enviandoFavicon ? "Enviando..." : cfg.marca.favicon_url ? "Trocar favicon" : "Enviar favicon"
                  ] }),
                  cfg.marca.favicon_url && /* @__PURE__ */ jsxs3("button", { type: "button", onClick: () => setMarca("favicon_url", null), className: "flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600", children: [
                    /* @__PURE__ */ jsx3(Trash2, { size: 13 }),
                    " Remover"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400 mt-1", children: "Use um PNG quadrado (ex: 512\xD7512), com fundo transparente." }),
              /* @__PURE__ */ jsx3("input", { ref: inputFavicon, type: "file", accept: "image/png,image/webp", className: "hidden", onChange: (e) => handleFavicon(e.target.files?.[0]) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs3("section", { className: "space-y-3 pt-5 border-t border-gray-100", children: [
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("p", { className: "text-sm font-semibold text-gray-900", children: "Menu no topo" }),
                /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-500", children: "No computador: logo \xE0 esquerda e um bot\xE3o \xE0 direita. No celular: s\xF3 o logo, centralizado." })
              ] }),
              /* @__PURE__ */ jsx3(Interruptor, { ligado: cfg.menu.ativo, onChange: (v) => setMenu("ativo", v), label: "Ativar menu no topo" })
            ] }),
            cfg.menu.ativo && /* @__PURE__ */ jsxs3("div", { className: "space-y-3", children: [
              !cfg.marca.logo_url && /* @__PURE__ */ jsx3("p", { className: "text-xs text-amber-700", children: 'Envie o logo em "Identidade de marca" para ele aparecer no menu.' }),
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsxs3("div", { children: [
                  /* @__PURE__ */ jsx3("p", { className: "text-xs font-medium text-gray-700", children: "Menu fixo no topo" }),
                  /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400", children: "O menu continua vis\xEDvel no topo da tela enquanto o visitante rola a p\xE1gina." })
                ] }),
                /* @__PURE__ */ jsx3(Interruptor, { ligado: cfg.menu.fixo === true, onChange: (v) => setMenu("fixo", v), label: "Manter o menu fixo no topo" })
              ] }),
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsxs3("div", { children: [
                  /* @__PURE__ */ jsx3("p", { className: "text-xs font-medium text-gray-700", children: "Anima\xE7\xE3o no bot\xE3o" }),
                  /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400", children: "O bot\xE3o balan\xE7a de leve a cada poucos segundos, para chamar a aten\xE7\xE3o do visitante." })
                ] }),
                /* @__PURE__ */ jsx3(Interruptor, { ligado: cfg.menu.cta_tilt === true, onChange: (v) => setMenu("cta_tilt", v), label: "Animar o bot\xE3o do menu" })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Texto do bot\xE3o" }),
                /* @__PURE__ */ jsx3(
                  "input",
                  {
                    value: cfg.menu.cta_texto,
                    onChange: (e) => setMenu("cta_texto", e.target.value),
                    placeholder: "Ex: Fale conosco",
                    className: inputCls
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "O bot\xE3o leva para" }),
                /* @__PURE__ */ jsx3("div", { className: "flex gap-2", children: [["whatsapp", "WhatsApp"], ["contato", "Se\xE7\xE3o de contato"], ["url", "Um link"]].map(([valor, rotulo]) => /* @__PURE__ */ jsx3(
                  "button",
                  {
                    type: "button",
                    onClick: () => setMenu("cta_destino", valor),
                    className: `flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${cfg.menu.cta_destino === valor ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`,
                    children: rotulo
                  },
                  valor
                )) }),
                cfg.menu.cta_destino === "whatsapp" && /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400 mt-1", children: 'Usa o n\xFAmero e a mensagem da se\xE7\xE3o "Bot\xE3o de WhatsApp" (funciona mesmo com o bot\xE3o flutuante desligado).' }),
                cfg.menu.cta_destino === "contato" && /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400 mt-1", children: 'Rola a p\xE1gina, com transi\xE7\xE3o suave, at\xE9 a se\xE7\xE3o de contato. Cada p\xE1gina escolhe a sua no editor (campo "Se\xE7\xE3o de contato"); sem escolha, vai para o formul\xE1rio do modelo.' })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Cor do bot\xE3o" }),
                /* @__PURE__ */ jsx3("div", { className: "grid grid-cols-3 gap-2", children: [["padrao", "Padr\xE3o"], ["principal", "Cor principal da p\xE1gina"], ["destaque", "Cor de destaque da p\xE1gina"]].map(([valor, rotulo]) => /* @__PURE__ */ jsx3(
                  "button",
                  {
                    type: "button",
                    onClick: () => setMenu("cta_cor", valor),
                    className: `rounded-lg border-2 px-2 py-2 text-xs font-medium leading-tight transition-colors ${(cfg.menu.cta_cor || "padrao") === valor ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`,
                    children: rotulo
                  },
                  valor
                )) }),
                /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-400 mt-1", children: "Padr\xE3o: verde quando leva ao WhatsApp, escuro nos outros casos. As cores da p\xE1gina acompanham as cores escolhidas em cada landing page (modelos sem cor pr\xF3pria usam o escuro)." })
              ] }),
              cfg.menu.cta_destino === "url" && /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Link" }),
                /* @__PURE__ */ jsx3(
                  "input",
                  {
                    value: cfg.menu.cta_url,
                    onChange: (e) => setMenu("cta_url", e.target.value),
                    placeholder: "https://...",
                    className: inputCls
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        erro && /* @__PURE__ */ jsx3("p", { className: "text-xs text-red-600", children: erro })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2", children: [
        salvo && /* @__PURE__ */ jsx3("span", { className: "text-xs text-emerald-600 mr-auto", children: "Configura\xE7\xF5es salvas" }),
        /* @__PURE__ */ jsx3("button", { type: "button", onClick: onClose, className: "px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100", children: "Fechar" }),
        /* @__PURE__ */ jsx3(
          "button",
          {
            type: "button",
            onClick: handleSalvar,
            disabled: !cfg || salvando || enviandoLogo || enviandoFavicon,
            className: "px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50",
            children: salvando ? "Salvando..." : "Salvar"
          }
        )
      ] })
    ] })
  ] });
}

// js/landing-pages/src/LandingPagesLista.jsx
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var STATUS_ESTILO = {
  rascunho: "bg-gray-100 text-gray-600",
  publicada: "bg-emerald-100 text-emerald-700",
  pausada: "bg-amber-100 text-amber-700"
};
var STATUS_LABEL = { rascunho: "Rascunho", publicada: "Publicada", pausada: "Pausada" };
function AvatarIniciais({ nome }) {
  const iniciais = (nome ?? "?").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return /* @__PURE__ */ jsx4("div", { className: "w-5 h-5 text-[10px] rounded-full bg-violet-100 text-violet-700 font-semibold flex items-center justify-center shrink-0", children: iniciais });
}
function LandingPagesLista() {
  const navigate = useNavigate();
  const { rotaPainel, rotaPublica } = getConfig();
  const Avatar = getConfig().Avatar || AvatarIniciais;
  const [itens, setItens] = useState3([]);
  const [carregando, setCarregando] = useState3(true);
  const [modalCriar, setModalCriar] = useState3(false);
  const [modalConfig, setModalConfig] = useState3(false);
  const [copiado, setCopiado] = useState3(null);
  function carregar() {
    setCarregando(true);
    listarLandingPages().then(setItens).catch(() => {
    }).finally(() => setCarregando(false));
  }
  useEffect3(() => {
    carregar();
  }, []);
  async function handlePublicarPausar(lp) {
    try {
      if (lp.status === "publicada") await pausarLandingPage(lp.id);
      else await publicarLandingPage(lp.id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }
  async function handleDuplicar(lp) {
    try {
      const nova = await duplicarLandingPage(lp.id);
      carregar();
      navigate(`${rotaPainel}/${nova.id}`);
    } catch (e) {
      alert(e.message);
    }
  }
  async function handleExcluir(lp) {
    if (!window.confirm(`Excluir "${lp.nome}"? Essa a\xE7\xE3o n\xE3o pode ser desfeita.`)) return;
    try {
      await deletarLandingPage(lp.id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }
  function copiarLink(slug) {
    const url = `${window.location.origin}${rotaPublica}/${slug}`;
    navigator.clipboard?.writeText(url);
    setCopiado(slug);
    setTimeout(() => setCopiado(null), 1500);
  }
  return /* @__PURE__ */ jsxs4("div", { className: "min-h-full bg-gray-50", children: [
    /* @__PURE__ */ jsx4("div", { className: "bg-white border-b border-gray-200 px-4 sm:px-6 py-4", children: /* @__PURE__ */ jsxs4("div", { className: "max-w-5xl mx-auto flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2.5 min-w-0", children: [
        /* @__PURE__ */ jsx4("div", { className: "p-2 rounded-xl bg-violet-50 shrink-0", children: /* @__PURE__ */ jsx4(Rocket, { size: 18, className: "text-violet-600", strokeWidth: 2 }) }),
        /* @__PURE__ */ jsxs4("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx4("h1", { className: "text-base font-bold text-gray-900 leading-tight", children: "Landing Pages" }),
          /* @__PURE__ */ jsx4("p", { className: "text-xs text-gray-400 hidden sm:block", children: "P\xE1ginas de captura por template" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxs4(
          "button",
          {
            onClick: () => setModalConfig(true),
            className: "flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors",
            children: [
              /* @__PURE__ */ jsx4(Settings, { size: 15 }),
              /* @__PURE__ */ jsx4("span", { className: "hidden sm:inline", children: "Configura\xE7\xF5es" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs4(
          "button",
          {
            onClick: () => setModalCriar(true),
            className: "flex items-center gap-2 bg-violet-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors shrink-0",
            children: [
              /* @__PURE__ */ jsx4(Plus, { size: 15, strokeWidth: 2.5 }),
              /* @__PURE__ */ jsx4("span", { className: "hidden sm:inline", children: "Nova landing page" }),
              /* @__PURE__ */ jsx4("span", { className: "sm:hidden", children: "Nova" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx4("div", { className: "max-w-5xl mx-auto p-4 sm:p-6", children: carregando ? /* @__PURE__ */ jsx4("p", { className: "text-sm text-gray-400 text-center py-10", children: "Carregando..." }) : itens.length === 0 ? /* @__PURE__ */ jsxs4("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsx4(Rocket, { size: 32, className: "mx-auto text-gray-300 mb-3" }),
      /* @__PURE__ */ jsx4("p", { className: "text-sm text-gray-500", children: "Nenhuma landing page ainda." }),
      /* @__PURE__ */ jsx4("button", { onClick: () => setModalCriar(true), className: "mt-3 text-sm font-medium text-violet-600 hover:text-violet-700", children: "Criar a primeira" })
    ] }) : /* @__PURE__ */ jsx4("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: itens.map((lp) => /* @__PURE__ */ jsxs4("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxs4(
          "button",
          {
            onClick: () => navigate(`${rotaPainel}/${lp.id}`),
            className: "text-left min-w-0",
            children: [
              /* @__PURE__ */ jsx4("p", { className: "text-sm font-semibold text-gray-900 truncate hover:text-violet-600", children: lp.nome }),
              /* @__PURE__ */ jsxs4("p", { className: "text-xs text-gray-400 truncate", children: [
                rotaPublica,
                "/",
                lp.slug
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx4("span", { className: `text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_ESTILO[lp.status]}`, children: STATUS_LABEL[lp.status] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [
        /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx4(Eye, { size: 13 }),
          " ",
          lp.visualizacoes
        ] }),
        /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx4(Users, { size: 13 }),
          " ",
          lp.total_leads
        ] }),
        lp.criado_por_nome && /* @__PURE__ */ jsx4("span", { className: "flex items-center gap-1.5 ml-auto", children: /* @__PURE__ */ jsx4(Avatar, { nome: lp.criado_por_nome, fotoUrl: lp.criado_por_foto_url, size: "xs" }) })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-1.5 pt-2 border-t border-gray-100", children: [
        /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: () => handlePublicarPausar(lp),
            title: lp.status === "publicada" ? "Pausar" : "Publicar",
            className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500",
            children: lp.status === "publicada" ? /* @__PURE__ */ jsx4(Pause, { size: 14 }) : /* @__PURE__ */ jsx4(Play, { size: 14 })
          }
        ),
        lp.status === "publicada" && /* @__PURE__ */ jsxs4(Fragment2, { children: [
          /* @__PURE__ */ jsx4("button", { onClick: () => copiarLink(lp.slug), title: "Copiar link", className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500", children: copiado === lp.slug ? /* @__PURE__ */ jsx4(Check, { size: 14, className: "text-emerald-600" }) : /* @__PURE__ */ jsx4(Copy, { size: 14 }) }),
          /* @__PURE__ */ jsx4("a", { href: `${rotaPublica}/${lp.slug}`, target: "_blank", rel: "noopener noreferrer", title: "Abrir p\xE1gina", className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsx4(ExternalLink, { size: 14 }) })
        ] }),
        /* @__PURE__ */ jsx4("button", { onClick: () => handleDuplicar(lp), title: "Duplicar", className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsx4(CopyPlus, { size: 14 }) }),
        /* @__PURE__ */ jsx4("button", { onClick: () => handleExcluir(lp), title: "Excluir", className: "p-1.5 rounded-lg hover:bg-red-50 text-red-500 ml-auto", children: /* @__PURE__ */ jsx4(Trash22, { size: 14 }) })
      ] })
    ] }, lp.id)) }) }),
    modalConfig && /* @__PURE__ */ jsx4(ModalConfiguracoes, { onClose: () => setModalConfig(false) }),
    modalCriar && /* @__PURE__ */ jsx4(
      ModalEscolherTemplate,
      {
        onClose: () => setModalCriar(false),
        onCriado: (lp) => navigate(`${rotaPainel}/${lp.id}`)
      }
    )
  ] });
}
function ModalEscolherTemplate({ onClose, onCriado }) {
  const [nome, setNome] = useState3("");
  const [templateId, setTemplateId] = useState3(null);
  const [salvando, setSalvando] = useState3(false);
  const [erro, setErro] = useState3("");
  async function handleCriar() {
    if (!nome.trim() || !templateId) return;
    setSalvando(true);
    setErro("");
    try {
      const lp = await criarLandingPage({ nome: nome.trim(), template: templateId });
      onCriado(lp);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }
  return /* @__PURE__ */ jsxs4("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4", children: [
    /* @__PURE__ */ jsx4("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxs4("div", { className: "relative bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-100", children: [
        /* @__PURE__ */ jsx4("h2", { className: "text-base font-bold text-gray-900", children: "Nova landing page" }),
        /* @__PURE__ */ jsx4("button", { onClick: onClose, className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-400", children: /* @__PURE__ */ jsx4(X2, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "p-5 overflow-y-auto space-y-4", children: [
        /* @__PURE__ */ jsxs4("div", { children: [
          /* @__PURE__ */ jsx4("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Nome da p\xE1gina" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              value: nome,
              onChange: (e) => setNome(e.target.value),
              placeholder: "Ex: Promo\xE7\xE3o Dia das M\xE3es",
              className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { children: [
          /* @__PURE__ */ jsx4("label", { className: "text-xs font-medium text-gray-500 mb-2 block", children: "Escolha um template" }),
          /* @__PURE__ */ jsx4("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: TEMPLATE_LIST.map((t) => /* @__PURE__ */ jsxs4(
            "button",
            {
              onClick: () => setTemplateId(t.id),
              className: `text-left rounded-xl border-2 p-3 transition-colors ${templateId === t.id ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`,
              children: [
                /* @__PURE__ */ jsx4(TemplateCardPreview, { templateId: t.id }),
                /* @__PURE__ */ jsx4("p", { className: "text-sm font-semibold text-gray-900 mt-2", children: t.nome }),
                /* @__PURE__ */ jsx4("p", { className: "text-xs text-gray-500 mt-0.5", children: t.descricao })
              ]
            },
            t.id
          )) })
        ] }),
        erro && /* @__PURE__ */ jsx4("p", { className: "text-xs text-red-600", children: erro })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "px-5 py-4 border-t border-gray-100 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx4("button", { type: "button", onClick: onClose, className: "px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100", children: "Cancelar" }),
        /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            onClick: handleCriar,
            disabled: !nome.trim() || !templateId || salvando,
            className: "px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50",
            children: salvando ? "Criando..." : "Criar e editar"
          }
        )
      ] })
    ] })
  ] });
}

// js/landing-pages/src/LandingPageEditor.jsx
import { useEffect as useEffect4, useState as useState4, useRef as useRef3, useCallback } from "react";
import { useParams, useNavigate as useNavigate2 } from "react-router-dom";
import { ArrowLeft, Save, Play as Play2, Pause as Pause2, Copy as Copy2, Check as Check2, Upload as Upload2, X as X3, Plus as Plus2, Trash2 as Trash23 } from "lucide-react";
import { Fragment as Fragment3, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function LandingPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate2();
  const { rotaPainel, rotaPublica } = getConfig();
  const [lp, setLp] = useState4(null);
  const [nome, setNome] = useState4("");
  const [conteudo, setConteudo] = useState4({});
  const [carregando, setCarregando] = useState4(true);
  const [salvando, setSalvando] = useState4(false);
  const [copiado, setCopiado] = useState4(false);
  const saveTimeout = useRef3(null);
  const [configuracoes, setConfiguracoes] = useState4(null);
  useEffect4(() => {
    obterConfiguracoes().then(setConfiguracoes).catch(() => {
    });
  }, []);
  useEffect4(() => {
    obterLandingPage(id).then((data) => {
      setLp(data);
      setNome(data.nome);
      setConteudo(data.conteudo || {});
    }).catch(() => {
    }).finally(() => setCarregando(false));
  }, [id]);
  const salvar = useCallback((novoNome, novoConteudo) => {
    setSalvando(true);
    atualizarLandingPage(id, { nome: novoNome, conteudo: novoConteudo }).then(setLp).catch(() => {
    }).finally(() => setSalvando(false));
  }, [id]);
  function agendarSalvar(novoNome, novoConteudo) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => salvar(novoNome, novoConteudo), 900);
  }
  function handleCampoChange(chave, valor) {
    const novo = { ...conteudo, [chave]: valor };
    setConteudo(novo);
    agendarSalvar(nome, novo);
  }
  function handleNomeChange(valor) {
    setNome(valor);
    agendarSalvar(valor, conteudo);
  }
  async function handlePublicarPausar() {
    try {
      const atualizado = lp.status === "publicada" ? await pausarLandingPage(id) : await publicarLandingPage(id);
      setLp(atualizado);
    } catch (e) {
      alert(e.message);
    }
  }
  function copiarLink() {
    navigator.clipboard?.writeText(`${window.location.origin}${rotaPublica}/${lp.slug}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }
  if (carregando) return /* @__PURE__ */ jsx5("div", { className: "p-10 text-center text-sm text-gray-400", children: "Carregando..." });
  if (!lp) return /* @__PURE__ */ jsx5("div", { className: "p-10 text-center text-sm text-gray-400", children: "Landing page n\xE3o encontrada." });
  const template = LANDING_PAGE_TEMPLATES[lp.template];
  return /* @__PURE__ */ jsxs5("div", { className: "min-h-full bg-gray-50 flex flex-col", children: [
    /* @__PURE__ */ jsx5("div", { className: "bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10", children: /* @__PURE__ */ jsxs5("div", { className: "max-w-6xl mx-auto flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx5("button", { onClick: () => navigate(rotaPainel), className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0", children: /* @__PURE__ */ jsx5(ArrowLeft, { size: 18 }) }),
        /* @__PURE__ */ jsx5(
          "input",
          {
            value: nome,
            onChange: (e) => handleNomeChange(e.target.value),
            className: "text-sm font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 truncate"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsx5("span", { className: "text-xs text-gray-400 hidden sm:inline", children: salvando ? "Salvando..." : "Salvo" }),
        lp.status === "publicada" && /* @__PURE__ */ jsx5("button", { onClick: copiarLink, className: "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500", title: "Copiar link p\xFAblico", children: copiado ? /* @__PURE__ */ jsx5(Check2, { size: 16, className: "text-emerald-600" }) : /* @__PURE__ */ jsx5(Copy2, { size: 16 }) }),
        /* @__PURE__ */ jsx5(
          "button",
          {
            onClick: handlePublicarPausar,
            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lp.status === "publicada" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`,
            children: lp.status === "publicada" ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
              /* @__PURE__ */ jsx5(Pause2, { size: 14 }),
              " Pausar"
            ] }) : /* @__PURE__ */ jsxs5(Fragment3, { children: [
              /* @__PURE__ */ jsx5(Play2, { size: 14 }),
              " Publicar"
            ] })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs5("div", { className: "flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs5("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx5(CamposPagina, { lp, nome, onNomeChange: handleNomeChange, onSalvo: setLp, rotaPublica }),
        template.secoes?.length > 0 && /* @__PURE__ */ jsxs5("div", { children: [
          /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Se\xE7\xE3o de contato" }),
          /* @__PURE__ */ jsx5(
            "select",
            {
              value: secaoContatoDaPagina(lp.template, conteudo) || "",
              onChange: (e) => handleCampoChange("secao_contato", e.target.value),
              className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400",
              children: template.secoes.map((sec) => /* @__PURE__ */ jsx5("option", { value: sec.id, children: sec.nome }, sec.id))
            }
          ),
          /* @__PURE__ */ jsx5("p", { className: "text-xs text-gray-400 mt-1", children: 'Para onde a p\xE1gina rola quando o bot\xE3o do menu est\xE1 configurado para "levar \xE0 se\xE7\xE3o de contato".' })
        ] }),
        template.campos.map((campo) => /* @__PURE__ */ jsx5(CampoEditor, { campo, valor: conteudo[campo.chave], onChange: (v) => handleCampoChange(campo.chave, v) }, campo.chave))
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: "mt-4 lg:mt-0", children: [
        /* @__PURE__ */ jsx5("p", { className: "text-xs font-medium text-gray-500 mb-2", children: "Pr\xE9-visualiza\xE7\xE3o" }),
        /* @__PURE__ */ jsxs5("div", { className: "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsxs5("div", { className: "bg-gray-100 px-3 py-2 flex items-center gap-1.5 border-b border-gray-200", children: [
            /* @__PURE__ */ jsx5("span", { className: "w-2.5 h-2.5 rounded-full bg-red-300" }),
            /* @__PURE__ */ jsx5("span", { className: "w-2.5 h-2.5 rounded-full bg-yellow-300" }),
            /* @__PURE__ */ jsx5("span", { className: "w-2.5 h-2.5 rounded-full bg-green-300" })
          ] }),
          /* @__PURE__ */ jsx5("div", { className: "max-h-[70vh] overflow-y-auto", children: /* @__PURE__ */ jsx5(
            MolduraLandingPage,
            {
              configuracoes,
              preview: true,
              secaoContato: secaoContatoDaPagina(lp.template, conteudo),
              coresPagina: coresDaPagina(lp.template, conteudo),
              children: /* @__PURE__ */ jsx5(template.Render, { conteudo })
            }
          ) })
        ] })
      ] })
    ] })
  ] });
}
function normalizarSlug(texto, final = false) {
  let s = (texto || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (final) s = s.replace(/^-+|-+$/g, "").slice(0, 80);
  return s;
}
function CamposPagina({ lp, nome, onNomeChange, onSalvo, rotaPublica }) {
  const [slug, setSlug] = useState4(lp.slug);
  const [salvandoSlug, setSalvandoSlug] = useState4(false);
  const [erroSlug, setErroSlug] = useState4("");
  const slugFinal = normalizarSlug(slug, true);
  const mudou = slugFinal && slugFinal !== lp.slug;
  async function salvarSlug() {
    if (!mudou || salvandoSlug) return;
    setSalvandoSlug(true);
    setErroSlug("");
    try {
      const atualizado = await atualizarLandingPage(lp.id, { slug: slugFinal });
      onSalvo(atualizado);
      setSlug(atualizado.slug);
    } catch (e) {
      setErroSlug(e.message);
    } finally {
      setSalvandoSlug(false);
    }
  }
  return /* @__PURE__ */ jsxs5("div", { className: "rounded-lg border border-gray-200 bg-white p-3 space-y-3", children: [
    /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Nome da p\xE1gina" }),
      /* @__PURE__ */ jsx5(
        "input",
        {
          value: nome,
          onChange: (e) => onNomeChange(e.target.value),
          placeholder: "Ex: Promo\xE7\xE3o Dia das M\xE3es",
          className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Endere\xE7o da p\xE1gina" }),
      /* @__PURE__ */ jsxs5("div", { className: "flex flex-col sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex flex-1 min-w-0 items-center rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-violet-400", children: [
          /* @__PURE__ */ jsxs5("span", { className: "pl-3 text-sm text-gray-400 whitespace-nowrap", children: [
            rotaPublica,
            "/"
          ] }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              value: slug,
              onChange: (e) => {
                setSlug(normalizarSlug(e.target.value));
                setErroSlug("");
              },
              onKeyDown: (e) => {
                if (e.key === "Enter") salvarSlug();
              },
              placeholder: "promocao-dia-das-maes",
              className: "flex-1 min-w-0 bg-transparent px-1 py-2 text-sm focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsx5(
          "button",
          {
            type: "button",
            onClick: salvarSlug,
            disabled: !mudou || salvandoSlug,
            className: "px-3 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 shrink-0",
            children: salvandoSlug ? "Salvando..." : "Salvar endere\xE7o"
          }
        )
      ] }),
      erroSlug && /* @__PURE__ */ jsx5("p", { className: "text-xs text-red-600 mt-1", children: erroSlug }),
      !erroSlug && mudou && lp.status === "publicada" && /* @__PURE__ */ jsx5("p", { className: "text-xs text-amber-700 mt-1", children: "A p\xE1gina est\xE1 publicada: links j\xE1 divulgados com o endere\xE7o antigo v\xE3o parar de funcionar." }),
      /* @__PURE__ */ jsxs5("p", { className: "text-xs text-gray-400 mt-1 break-all", children: [
        window.location.origin,
        rotaPublica,
        "/",
        slugFinal || lp.slug
      ] })
    ] }),
    /* @__PURE__ */ jsx5(MetaCampos, { lp, nome, onSalvo })
  ] });
}
function MetaCampos({ lp, nome, onSalvo }) {
  const [metaTitulo, setMetaTitulo] = useState4(lp.meta_titulo || "");
  const [metaDescricao, setMetaDescricao] = useState4(lp.meta_descricao || "");
  const timeout = useRef3(null);
  function agendar(novoTitulo, novaDescricao) {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      atualizarLandingPage(lp.id, { meta_titulo: novoTitulo, meta_descricao: novaDescricao }).then(onSalvo).catch(() => {
      });
    }, 900);
  }
  return /* @__PURE__ */ jsxs5(Fragment3, { children: [
    /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "T\xEDtulo da p\xE1gina (aba do navegador)" }),
      /* @__PURE__ */ jsx5(
        "input",
        {
          value: metaTitulo,
          onChange: (e) => {
            setMetaTitulo(e.target.value);
            agendar(e.target.value, metaDescricao);
          },
          placeholder: nome || "Ex: Promo\xE7\xE3o de inverno",
          maxLength: 200,
          className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        }
      ),
      /* @__PURE__ */ jsx5("p", { className: "text-xs text-gray-400 mt-1", children: "Tamb\xE9m aparece no Google. Em branco, a aba mostra o nome da p\xE1gina." })
    ] }),
    /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: "Descri\xE7\xE3o da p\xE1gina" }),
      /* @__PURE__ */ jsx5(
        "textarea",
        {
          value: metaDescricao,
          onChange: (e) => {
            setMetaDescricao(e.target.value);
            agendar(metaTitulo, e.target.value);
          },
          placeholder: "Descri\xE7\xE3o curta que aparece no Google",
          maxLength: 400,
          rows: 2,
          className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        }
      )
    ] })
  ] });
}
function CampoEditor({ campo, valor, onChange }) {
  if (campo.tipo === "texto_curto") {
    return /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
      /* @__PURE__ */ jsx5(
        "input",
        {
          value: valor ?? "",
          onChange: (e) => onChange(e.target.value),
          placeholder: campo.placeholder,
          className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        }
      )
    ] });
  }
  if (campo.tipo === "texto_longo") {
    return /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
      /* @__PURE__ */ jsx5(
        "textarea",
        {
          value: valor ?? "",
          onChange: (e) => onChange(e.target.value),
          placeholder: campo.placeholder,
          rows: 4,
          className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        }
      )
    ] });
  }
  if (campo.tipo === "imagem") {
    return /* @__PURE__ */ jsx5(CampoImagem, { campo, valor, onChange });
  }
  if (campo.tipo === "lista") {
    return /* @__PURE__ */ jsx5(CampoLista, { campo, valor, onChange });
  }
  if (campo.tipo === "lista_faq") {
    return /* @__PURE__ */ jsx5(CampoFaq, { campo, valor, onChange });
  }
  if (campo.tipo === "cor") {
    return /* @__PURE__ */ jsx5(CampoCor, { campo, valor, onChange });
  }
  if (campo.tipo === "intensidade") {
    return /* @__PURE__ */ jsx5(CampoIntensidade, { campo, valor, onChange });
  }
  if (campo.tipo === "bloco") {
    return /* @__PURE__ */ jsx5(CampoBloco, { campo, valor, onChange });
  }
  if (campo.tipo === "lista_features") {
    return /* @__PURE__ */ jsx5(CampoListaFeatures, { campo, valor, onChange });
  }
  if (campo.tipo === "lista_depoimentos") {
    return /* @__PURE__ */ jsx5(CampoListaDepoimentos, { campo, valor, onChange });
  }
  return null;
}
function CampoIntensidade({ campo, valor, onChange }) {
  const atual = valor === void 0 || valor === null || valor === "" ? campo.padrao : Number(valor);
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500", children: campo.label }),
      /* @__PURE__ */ jsxs5("span", { className: "text-xs font-semibold text-gray-700 tabular-nums", children: [
        atual,
        campo.unidade || ""
      ] })
    ] }),
    /* @__PURE__ */ jsx5(
      "input",
      {
        type: "range",
        min: campo.min ?? 0,
        max: campo.max ?? 100,
        step: campo.passo ?? 1,
        value: atual,
        onChange: (e) => onChange(Number(e.target.value)),
        className: "w-full accent-violet-600",
        "aria-label": campo.label
      }
    ),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between text-[11px] text-gray-400", children: [
      /* @__PURE__ */ jsx5("span", { children: campo.rotuloMin }),
      atual !== campo.padrao && /* @__PURE__ */ jsxs5("button", { type: "button", onClick: () => onChange(campo.padrao), className: "text-violet-600 hover:text-violet-700", children: [
        "Voltar ao padr\xE3o (",
        campo.padrao,
        campo.unidade || "",
        ")"
      ] }),
      /* @__PURE__ */ jsx5("span", { children: campo.rotuloMax })
    ] })
  ] });
}
function CampoCor({ campo, valor, onChange }) {
  const cor = valor || campo.padrao || "#000000";
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx5(
        "input",
        {
          type: "color",
          value: cor,
          onChange: (e) => onChange(e.target.value),
          className: "w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
        }
      ),
      /* @__PURE__ */ jsx5(
        "input",
        {
          value: cor,
          onChange: (e) => onChange(e.target.value),
          className: "flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        }
      )
    ] })
  ] });
}
function CampoBloco({ campo, valor, onChange }) {
  const v = valor || {};
  function set(chave, texto) {
    onChange({ ...v, [chave]: texto });
  }
  return /* @__PURE__ */ jsxs5("div", { className: "rounded-lg border border-gray-200 p-3 space-y-2", children: [
    /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 block", children: campo.label }),
    /* @__PURE__ */ jsx5(
      "input",
      {
        value: v.titulo || "",
        onChange: (e) => set("titulo", e.target.value),
        placeholder: "T\xEDtulo do bloco",
        className: "w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
      }
    ),
    /* @__PURE__ */ jsx5(
      "textarea",
      {
        value: v.texto || "",
        onChange: (e) => set("texto", e.target.value),
        placeholder: "Texto (opcional)",
        rows: 2,
        className: "w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
      }
    ),
    campo.semCta !== true && /* @__PURE__ */ jsxs5("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx5(
        "input",
        {
          value: v.cta_texto || "",
          onChange: (e) => set("cta_texto", e.target.value),
          placeholder: "Texto do bot\xE3o (opcional)",
          className: "flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        }
      ),
      /* @__PURE__ */ jsx5(
        "input",
        {
          value: v.cta_url || "",
          onChange: (e) => set("cta_url", e.target.value),
          placeholder: "Link (opcional)",
          className: "flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        }
      )
    ] })
  ] });
}
function listaOuPadrao(valor, campo) {
  if (Array.isArray(valor) && valor.length > 0) return valor;
  return Array.isArray(campo.padrao) ? campo.padrao : [];
}
function CampoListaFeatures({ campo, valor, onChange }) {
  const itens = listaOuPadrao(valor, campo);
  const [enviando, setEnviando] = useState4(null);
  const inputIcone = useRef3(null);
  const alvoIcone = useRef3(null);
  async function handleIcone(file) {
    const i = alvoIcone.current;
    if (!file || i == null) return;
    setEnviando(i);
    try {
      const { url } = await uploadImagemLandingPage(file);
      atualizarItem(i, "icone_url", url);
    } catch (e) {
      alert(e.message);
    } finally {
      setEnviando(null);
      if (inputIcone.current) inputIcone.current.value = "";
    }
  }
  function atualizarItem(i, chave, texto) {
    const novo = [...itens];
    novo[i] = { ...novo[i] || {}, [chave]: texto };
    onChange(novo);
  }
  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i));
  }
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
    /* @__PURE__ */ jsxs5("div", { className: "space-y-2", children: [
      itens.map((item, i) => /* @__PURE__ */ jsxs5("div", { className: "rounded-lg border border-gray-200 p-2.5 space-y-1.5", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx5(
            IconeSelo,
            {
              item,
              IconePadrao: campo.icones?.[i % campo.icones.length],
              enviando: enviando === i,
              onTrocar: () => {
                alvoIcone.current = i;
                inputIcone.current?.click();
              },
              onRemover: () => atualizarItem(i, "icone_url", null)
            }
          ),
          /* @__PURE__ */ jsx5(
            "input",
            {
              value: item?.titulo || "",
              onChange: (e) => atualizarItem(i, "titulo", e.target.value),
              placeholder: "T\xEDtulo curto (ex: FEITO \xC0 M\xC3O)",
              className: "flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            }
          ),
          /* @__PURE__ */ jsx5("button", { onClick: () => removerItem(i), className: "p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0", children: /* @__PURE__ */ jsx5(Trash23, { size: 14 }) })
        ] }),
        /* @__PURE__ */ jsx5(
          "textarea",
          {
            value: item?.descricao || "",
            onChange: (e) => atualizarItem(i, "descricao", e.target.value),
            placeholder: "Descri\xE7\xE3o curta",
            rows: 2,
            className: "w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          }
        )
      ] }, i)),
      /* @__PURE__ */ jsxs5(
        "button",
        {
          type: "button",
          onClick: () => onChange([...itens, { titulo: "", descricao: "" }]),
          className: "flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700",
          children: [
            /* @__PURE__ */ jsx5(Plus2, { size: 13 }),
            " Adicionar"
          ]
        }
      ),
      /* @__PURE__ */ jsx5("p", { className: "text-xs text-gray-400", children: "Clique no \xEDcone para trocar. Use PNG com fundo transparente: qualquer tamanho \xE9 ajustado automaticamente." })
    ] }),
    /* @__PURE__ */ jsx5("input", { ref: inputIcone, type: "file", accept: "image/png,image/webp,image/jpeg", className: "hidden", onChange: (e) => handleIcone(e.target.files?.[0]) })
  ] });
}
function IconeSelo({ item, IconePadrao, enviando, onTrocar, onRemover }) {
  return /* @__PURE__ */ jsxs5("div", { className: "relative shrink-0", children: [
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        onClick: onTrocar,
        disabled: enviando,
        title: "Trocar \xEDcone",
        className: "flex items-center justify-center w-9 h-9 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-violet-400 hover:text-violet-600",
        children: enviando ? /* @__PURE__ */ jsx5(Upload2, { size: 14, className: "animate-pulse" }) : item?.icone_url ? /* @__PURE__ */ jsx5("img", { src: item.icone_url, alt: "", className: "w-6 h-6 object-contain" }) : IconePadrao ? /* @__PURE__ */ jsx5(IconePadrao, { size: 18, strokeWidth: 1.75 }) : /* @__PURE__ */ jsx5(Upload2, { size: 14 })
      }
    ),
    item?.icone_url && !enviando && /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        onClick: onRemover,
        title: "Voltar ao \xEDcone padr\xE3o",
        className: "absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow border border-gray-200 text-gray-500 hover:text-red-600",
        children: /* @__PURE__ */ jsx5(X3, { size: 10 })
      }
    )
  ] });
}
function CampoListaDepoimentos({ campo, valor, onChange }) {
  const itens = listaOuPadrao(valor, campo);
  function atualizarItem(i, chave, texto) {
    const novo = [...itens];
    novo[i] = { ...novo[i] || {}, [chave]: texto };
    onChange(novo);
  }
  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i));
  }
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
    /* @__PURE__ */ jsxs5("div", { className: "space-y-2", children: [
      itens.map((item, i) => /* @__PURE__ */ jsxs5("div", { className: "rounded-lg border border-gray-200 p-2.5 space-y-1.5", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx5(
            "textarea",
            {
              value: item?.texto || "",
              onChange: (e) => atualizarItem(i, "texto", e.target.value),
              placeholder: "Texto do depoimento",
              rows: 2,
              className: "flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            }
          ),
          /* @__PURE__ */ jsx5("button", { onClick: () => removerItem(i), className: "p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0", children: /* @__PURE__ */ jsx5(Trash23, { size: 14 }) })
        ] }),
        /* @__PURE__ */ jsx5(
          "input",
          {
            value: item?.nome || "",
            onChange: (e) => atualizarItem(i, "nome", e.target.value),
            placeholder: "Nome de quem falou",
            className: "w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          }
        )
      ] }, i)),
      /* @__PURE__ */ jsxs5(
        "button",
        {
          type: "button",
          onClick: () => onChange([...itens, { texto: "", nome: "" }]),
          className: "flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700",
          children: [
            /* @__PURE__ */ jsx5(Plus2, { size: 13 }),
            " Adicionar depoimento"
          ]
        }
      )
    ] })
  ] });
}
function CampoImagem({ campo, valor, onChange }) {
  const [enviando, setEnviando] = useState4(false);
  const inputRef = useRef3(null);
  async function handleFile(file) {
    if (!file) return;
    setEnviando(true);
    try {
      const { url } = await uploadImagemLandingPage(file);
      onChange(url);
    } catch (e) {
      alert(e.message);
    } finally {
      setEnviando(false);
    }
  }
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
    valor ? /* @__PURE__ */ jsxs5("div", { className: "relative inline-block", children: [
      /* @__PURE__ */ jsx5("img", { src: valor, alt: "", className: "h-24 rounded-lg border border-gray-200 object-cover" }),
      /* @__PURE__ */ jsx5(
        "button",
        {
          onClick: () => onChange(null),
          className: "absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-gray-200 text-gray-500 hover:text-red-600",
          children: /* @__PURE__ */ jsx5(X3, { size: 12 })
        }
      )
    ] }) : /* @__PURE__ */ jsxs5(
      "button",
      {
        type: "button",
        onClick: () => inputRef.current?.click(),
        disabled: enviando,
        className: "flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600",
        children: [
          /* @__PURE__ */ jsx5(Upload2, { size: 14 }),
          enviando ? "Enviando..." : "Enviar imagem"
        ]
      }
    ),
    /* @__PURE__ */ jsx5("input", { ref: inputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => handleFile(e.target.files?.[0]) })
  ] });
}
function CampoLista({ campo, valor, onChange }) {
  const itens = Array.isArray(valor) ? valor : [];
  function atualizarItem(i, texto) {
    const novo = [...itens];
    novo[i] = texto;
    onChange(novo);
  }
  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i));
  }
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
    /* @__PURE__ */ jsxs5("div", { className: "space-y-1.5", children: [
      itens.map((item, i) => /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx5(
          "input",
          {
            value: item,
            onChange: (e) => atualizarItem(i, e.target.value),
            placeholder: campo.placeholder,
            className: "flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          }
        ),
        /* @__PURE__ */ jsx5("button", { onClick: () => removerItem(i), className: "p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0", children: /* @__PURE__ */ jsx5(Trash23, { size: 14 }) })
      ] }, i)),
      /* @__PURE__ */ jsxs5(
        "button",
        {
          type: "button",
          onClick: () => onChange([...itens, ""]),
          className: "flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700",
          children: [
            /* @__PURE__ */ jsx5(Plus2, { size: 13 }),
            " Adicionar"
          ]
        }
      )
    ] })
  ] });
}
function CampoFaq({ campo, valor, onChange }) {
  const itens = Array.isArray(valor) ? valor : [];
  function atualizarItem(i, campoNome, texto) {
    const novo = [...itens];
    novo[i] = { ...novo[i] || {}, [campoNome]: texto };
    onChange(novo);
  }
  function removerItem(i) {
    onChange(itens.filter((_, idx) => idx !== i));
  }
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsx5("label", { className: "text-xs font-medium text-gray-500 mb-1 block", children: campo.label }),
    /* @__PURE__ */ jsxs5("div", { className: "space-y-3", children: [
      itens.map((item, i) => /* @__PURE__ */ jsxs5("div", { className: "rounded-lg border border-gray-200 p-2.5 space-y-1.5", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx5(
            "input",
            {
              value: item?.pergunta || "",
              onChange: (e) => atualizarItem(i, "pergunta", e.target.value),
              placeholder: "Pergunta",
              className: "flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            }
          ),
          /* @__PURE__ */ jsx5("button", { onClick: () => removerItem(i), className: "p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0", children: /* @__PURE__ */ jsx5(Trash23, { size: 14 }) })
        ] }),
        /* @__PURE__ */ jsx5(
          "textarea",
          {
            value: item?.resposta || "",
            onChange: (e) => atualizarItem(i, "resposta", e.target.value),
            placeholder: "Resposta",
            rows: 2,
            className: "w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          }
        )
      ] }, i)),
      /* @__PURE__ */ jsxs5(
        "button",
        {
          type: "button",
          onClick: () => onChange([...itens, { pergunta: "", resposta: "" }]),
          className: "flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700",
          children: [
            /* @__PURE__ */ jsx5(Plus2, { size: 13 }),
            " Adicionar pergunta"
          ]
        }
      )
    ] })
  ] });
}

// js/landing-pages/src/LandingPageView.jsx
import { useEffect as useEffect5, useState as useState5 } from "react";
import { useParams as useParams2 } from "react-router-dom";
import { jsx as jsx6 } from "react/jsx-runtime";
function useFavicon(url) {
  useEffect5(() => {
    if (!url) return;
    const originais = [...document.querySelectorAll('link[rel~="icon"]')];
    originais.forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = url;
    document.head.appendChild(link);
    return () => {
      link.remove();
      originais.forEach((el) => document.head.appendChild(el));
    };
  }, [url]);
}
function LandingPageView() {
  const { slug } = useParams2();
  const [lp, setLp] = useState5(null);
  const [erro, setErro] = useState5(false);
  const [carregando, setCarregando] = useState5(true);
  useEffect5(() => {
    buscarLandingPagePublica(slug).then((data) => {
      setLp(data);
      document.title = data.meta_titulo || data.nome || getConfig().tituloPadrao;
      if (data.meta_descricao) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "description";
          document.head.appendChild(meta);
        }
        meta.content = data.meta_descricao;
      }
      registrarVisualizacao(slug);
    }).catch(() => setErro(true)).finally(() => setCarregando(false));
  }, [slug]);
  useFavicon(lp?.configuracoes?.marca?.favicon_url);
  async function handleLead(payload) {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid") || void 0;
    await enviarLeadLandingPage(slug, { ...payload, fbclid });
  }
  if (carregando) {
    return /* @__PURE__ */ jsx6("div", { className: "min-h-screen flex items-center justify-center text-sm text-gray-400", children: "Carregando..." });
  }
  if (erro || !lp) {
    return /* @__PURE__ */ jsx6("div", { className: "min-h-screen flex items-center justify-center text-center px-6", children: /* @__PURE__ */ jsx6("p", { className: "text-sm text-gray-500", children: "Essa p\xE1gina n\xE3o est\xE1 mais dispon\xEDvel." }) });
  }
  const template = LANDING_PAGE_TEMPLATES[lp.template];
  if (!template) {
    return /* @__PURE__ */ jsx6("div", { className: "min-h-screen flex items-center justify-center text-center px-6", children: /* @__PURE__ */ jsx6("p", { className: "text-sm text-gray-500", children: "Essa p\xE1gina n\xE3o est\xE1 mais dispon\xEDvel." }) });
  }
  return /* @__PURE__ */ jsx6("div", { className: "min-h-screen bg-white", children: /* @__PURE__ */ jsx6(
    MolduraLandingPage,
    {
      configuracoes: lp.configuracoes,
      secaoContato: secaoContatoDaPagina(lp.template, lp.conteudo),
      coresPagina: coresDaPagina(lp.template, lp.conteudo),
      children: /* @__PURE__ */ jsx6(template.Render, { conteudo: lp.conteudo || {}, onLead: handleLead })
    }
  ) });
}
export {
  LANDING_PAGE_TEMPLATES,
  LandingPageEditor,
  LandingPageView,
  LandingPagesLista,
  MolduraLandingPage,
  TEMPLATE_LIST,
  TemplateCardPreview,
  configurarLandingPages,
  api_exports as landingPagesApi
};
