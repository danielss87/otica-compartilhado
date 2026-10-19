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

PADRAO = {
    "whatsapp": {
        "ativo": False, "numero": "", "mensagem": "Olá! Vim pela página e gostaria de mais informações.",
        # Bolinha vermelha pulsante simulando notificação no botão (v0.4.0) — ligada por
        # padrão por pedido do Daniel, inclusive pra quem já tinha salvo a config antes.
        "notificacao": True,
    },
    "marca": {"logo_url": None},
    # Menu no topo (v0.4.0): logo à esquerda + botão CTA à direita no desktop; só o
    # logo centralizado no celular. cta_destino: "whatsapp" (número configurado) | "url".
    "menu": {"ativo": False, "cta_texto": "Fale conosco", "cta_destino": "whatsapp", "cta_url": ""},
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
        "marca": {"logo_url": cfg["marca"]["logo_url"]},
        "menu": {
            "ativo": menu_ativo,
            "cta_texto": m["cta_texto"] if menu_ativo and cta_url else "",
            "cta_destino": m["cta_destino"],
            "cta_url": cta_url if menu_ativo else "",
        },
    }
