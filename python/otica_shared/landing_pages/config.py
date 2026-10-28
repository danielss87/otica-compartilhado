"""Formato das configurações gerais das landing pages (todas as páginas).

Guardado como JSON em `landing_pages_config.dados`. Ao ler, sempre mesclar
com `PADRAO` — assim chave nova nasce com valor padrão nos dois apps sem
migração. Tudo desligado por padrão (subir de versão não muda nenhuma página).
"""
import copy
import json
import re
from typing import Optional
from urllib.parse import quote

FONTES_MARCA = ("Open Sans", "Inter", "Poppins", "Montserrat", "Nunito", "Raleway")

PADRAO = {
    "whatsapp": {
        "ativo": False, "numero": "", "mensagem": "Olá! Vim pela página e gostaria de mais informações.",
        # Bolinha vermelha pulsante simulando notificação no botão (v0.4.0) — ligada por
        # padrão por pedido do Daniel, inclusive pra quem já tinha salvo a config antes.
        "notificacao": True,
    },
    # favicon_url (v0.7.0): ícone da aba do navegador em todas as páginas públicas.
    # titulo (v0.22.0): título da aba usado quando a página não tem o próprio (meta_titulo).
    # fonte (v0.23.0): família do Google Fonts da empresa ("" = a do modelo). Só as de `FONTES_MARCA`
    # (todas com os pesos 400–800), por ser o nome que vai parar num link de fonte.
    "marca": {"logo_url": None, "favicon_url": None, "titulo": "", "fonte": ""},
    # Empresa (v0.22.0): nome da empresa dona desta linha de configuração. Vazio na empresa 1 =
    # "Principal". Cada empresa tem logo, favicon, título, menu, WhatsApp, domínio e rastreamento próprios.
    "empresa": {"nome": ""},
    # Menu no topo (v0.4.0): logo à esquerda + botão CTA à direita no desktop; só o
    # logo centralizado no celular. cta_destino: "whatsapp" (número configurado) | "url" |
    # "contato" (rola até a seção de contato da própria página, v0.5.0). cta_cor (v0.5.0):
    # "padrao" | "principal" | "destaque" (cores da própria página, resolvidas no frontend).
    # fixo (v0.6.0): menu preso no topo da tela ao rolar (sticky).
    # cta_tilt (v0.8.0): botão do menu balança de leve a cada poucos segundos (chamar atenção).
    "menu": {"ativo": False, "cta_texto": "Fale conosco", "cta_destino": "whatsapp", "cta_url": "", "cta_cor": "padrao", "fixo": False, "cta_tilt": False},
    # Avaliações do Google (v0.15.0): `busca` = Place ID ou "nome da loja, cidade" como no
    # Google Maps (vazio = desligado). Só entram na página avaliações com nota >= nota_minima.
    # Cada página liga ou não no editor (ex: Leader → "Prova social: avaliações do Google").
    "google": {"busca": "", "nota_minima": 4},
    # Domínio próprio (v0.19.0): subdomínio da loja (ex: "lp.minhaotica.com.br") apontado
    # para o frontend. Os links do painel passam a usar `https://<endereco>/<slug>` e a raiz
    # do domínio abre `pagina_inicial` (slug; vazio = "página não disponível"). O DNS e o
    # cadastro do domínio na hospedagem são feitos fora daqui (ver CLAUDE.md de cada app).
    "dominio": {"endereco": "", "pagina_inicial": ""},
    # Rastreamento (v0.20.0): só IDs, validados por formato (`normalizar_rastreamento`) — nunca
    # script livre. Vazio = não carrega. A página pública monta os scripts (rastreamento.js).
    # ads_rotulo_*: rótulo da ação de conversão do Google Ads ("AW-123/rotulo" → "rotulo").
    "rastreamento": {
        "ga4_id": "", "ads_id": "", "ads_rotulo_lead": "", "ads_rotulo_whatsapp": "",
        "hotjar_id": "", "clarity_id": "",
    },
}


def mesclar_com_padrao(dados: Optional[dict]) -> dict:
    cfg = copy.deepcopy(PADRAO)
    for secao, valores in (dados or {}).items():
        if secao in cfg and isinstance(valores, dict):
            cfg[secao].update({k: v for k, v in valores.items() if k in cfg[secao]})
    return cfg


def ler(texto: Optional[str]) -> dict:
    try:
        return mesclar_com_padrao(json.loads(texto) if texto else {})
    except (TypeError, ValueError):
        return mesclar_com_padrao({})


def normalizar_numero_whatsapp(numero: str) -> str:
    """Só dígitos, com DDI. 10/11 dígitos (DDD + número) = Brasil → prefixa 55."""
    digitos = re.sub(r"\D", "", numero or "")
    if len(digitos) in (10, 11):
        digitos = "55" + digitos
    return digitos


def normalizar_url(url: str) -> str:
    url = (url or "").strip()
    if url and not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    return url


def normalizar_dominio(valor: str) -> str:
    """"https://LP.Loja.com.br/x" → "lp.loja.com.br". Vazio continua vazio."""
    d = (valor or "").strip().lower()
    d = re.sub(r"^[a-z]+://", "", d).split("/")[0].split("?")[0].split("#")[0]
    return d.split(":")[0].strip(".")


def dominio_valido(d: str) -> bool:
    return bool(re.fullmatch(r"(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}", d))


# Formato aceito de cada ID de rastreamento (o valor vai parar num <script> da página pública).
FORMATOS_RASTREAMENTO = {
    "ga4_id": (r"G-[A-Z0-9]{4,20}", "ID do Google Analytics inválido (ex: G-AB12CD34EF)."),
    "ads_id": (r"AW-\d{6,15}", "ID do Google Ads inválido (ex: AW-123456789)."),
    "ads_rotulo_lead": (r"[A-Za-z0-9_-]{4,64}", "Rótulo de conversão (lead) inválido."),
    "ads_rotulo_whatsapp": (r"[A-Za-z0-9_-]{4,64}", "Rótulo de conversão (WhatsApp) inválido."),
    "hotjar_id": (r"\d{5,12}", "ID do Hotjar inválido (só números, ex: 3456789)."),
    "clarity_id": (r"[a-z0-9]{6,20}", "ID do Microsoft Clarity inválido (ex: abcd1234ef)."),
}


def normalizar_rastreamento(r: dict) -> dict:
    """Limpa e valida os IDs; levanta ValueError com a mensagem para o usuário.

    Aceita o que se costuma colar: "AW-123/rotulo" no campo de rótulo vira "rotulo" (e
    preenche o ID do Ads se estiver vazio), maiúsculas no GA4/Ads, minúsculas no Clarity.
    """
    r = {k: str(r.get(k) or "").strip() for k in PADRAO["rastreamento"]}
    for chave in ("ads_rotulo_lead", "ads_rotulo_whatsapp"):
        if "/" in r[chave]:
            prefixo, r[chave] = r[chave].split("/", 1)
            if not r["ads_id"]:
                r["ads_id"] = prefixo.strip()
            r[chave] = r[chave].strip()
    r["ga4_id"] = r["ga4_id"].upper()
    r["ads_id"] = r["ads_id"].upper()
    r["clarity_id"] = r["clarity_id"].lower()
    for chave, (padrao, msg) in FORMATOS_RASTREAMENTO.items():
        if r[chave] and not re.fullmatch(padrao, r[chave]):
            raise ValueError(msg)
    if (r["ads_rotulo_lead"] or r["ads_rotulo_whatsapp"]) and not r["ads_id"]:
        raise ValueError("Para usar os rótulos de conversão, preencha o ID do Google Ads (AW-...).")
    return r


def link_whatsapp(numero: str, mensagem: str) -> str:
    # quote (espaço → %20): "+" o WhatsApp pode mostrar literal. Igual a `linkWhatsApp` no Moldura.jsx.
    return f"https://wa.me/{numero}" + (f"?text={quote(mensagem, safe='')}" if mensagem else "")


def publica(cfg: dict) -> dict:
    """Parte da configuração que a página pública recebe (só o que ela usa).

    O link final do CTA do menu já sai pronto daqui (`cta_url`), seja WhatsApp ou URL.
    """
    w = cfg["whatsapp"]
    ativo = bool(w["ativo"] and w["numero"])
    m = cfg["menu"]
    if m["cta_destino"] == "whatsapp":
        cta_url = link_whatsapp(w["numero"], w["mensagem"]) if w["numero"] else ""
    elif m["cta_destino"] == "contato":
        cta_url = "#contato"  # o frontend intercepta e rola até a seção de contato
    else:
        cta_url = m["cta_url"]
    menu_ativo = bool(m["ativo"])
    return {
        "whatsapp": {
            "ativo": ativo,
            "numero": w["numero"] if ativo else "",
            "mensagem": w["mensagem"] if ativo else "",
            "notificacao": bool(w["notificacao"]) if ativo else False,
        },
        "marca": {"logo_url": cfg["marca"]["logo_url"], "favicon_url": cfg["marca"]["favicon_url"], "fonte": cfg["marca"]["fonte"]},
        "menu": {
            "ativo": menu_ativo,
            "cta_texto": m["cta_texto"] if menu_ativo and cta_url else "",
            "cta_destino": m["cta_destino"],
            "cta_url": cta_url if menu_ativo else "",
            "cta_cor": m["cta_cor"],
            "fixo": bool(m["fixo"]) if menu_ativo else False,
            "cta_tilt": bool(m["cta_tilt"]) if menu_ativo else False,
        },
        # IDs públicos por natureza (aparecem no HTML de qualquer site que usa essas ferramentas).
        "rastreamento": dict(cfg["rastreamento"]),
    }
