"""Formato das configurações gerais das landing pages (todas as páginas).

Guardado como JSON em `landing_pages_config.dados`. Ao ler, sempre mesclar
com `PADRAO` — assim chave nova nasce com valor padrão nos dois apps sem
migração. Tudo desligado por padrão (subir de versão não muda nenhuma página).
"""
import copy
import json
import re
from typing import Optional

PADRAO = {
    "whatsapp": {"ativo": False, "numero": "", "mensagem": "Olá! Vim pela página e gostaria de mais informações."},
    "marca": {"logo_url": None},
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


def publica(cfg: dict) -> dict:
    """Parte da configuração que a página pública recebe (só o que ela usa)."""
    w = cfg["whatsapp"]
    ativo = bool(w["ativo"] and w["numero"])
    return {
        "whatsapp": {"ativo": ativo, "numero": w["numero"] if ativo else "", "mensagem": w["mensagem"] if ativo else ""},
        "marca": {"logo_url": cfg["marca"]["logo_url"]},
    }
