"""Avaliações do Google (Perfil da Empresa) para a prova social das páginas (v0.15.0).

Usa a Places API (New) do Google com a chave do app (`google_places_api_key` em
`criar_routers`). A API devolve no máximo 5 avaliações ("mais relevantes"), mais a nota
média e o total. Sem dependência nova: HTTP pelo urllib da biblioteca padrão.

Custo: o resultado fica em cache na memória por `TTL_CACHE` (6 h), então a página
pública consulta o Google poucas vezes por dia, qualquer que seja o tráfego. Se o Google
falhar, serve o último resultado bom (até `TTL_VELHO`) e espera `TTL_ERRO` antes de tentar
de novo.

`busca` (configurações gerais → google.busca) aceita o Place ID ("ChIJ...") ou o nome e a
cidade da loja, como se digita no Google Maps; nesse caso o ID é achado uma vez pela busca
de texto (só ID, SKU gratuito).
"""
import json
import logging
import re
import threading
import time
import urllib.error
import urllib.request
from typing import Optional

logger = logging.getLogger(__name__)

URL_BASE = "https://places.googleapis.com/v1"
TTL_CACHE = 6 * 3600
TTL_VELHO = 7 * 24 * 3600
TTL_ERRO = 10 * 60
TIMEOUT = 8


class ErroGoogle(Exception):
    pass


def parece_place_id(texto: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9_-]{20,}", texto or "")) and " " not in texto


def _requisicao(url: str, chave: str, campos: str, corpo: Optional[dict] = None) -> dict:
    dados = json.dumps(corpo).encode() if corpo is not None else None
    req = urllib.request.Request(url, data=dados, method="POST" if corpo is not None else "GET")
    req.add_header("X-Goog-Api-Key", chave)
    req.add_header("X-Goog-FieldMask", campos)
    if corpo is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode()).get("error", {}).get("message") or str(e)
        except ValueError:
            msg = str(e)
        raise ErroGoogle(f"Google respondeu {e.code}: {msg}") from e
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        raise ErroGoogle(f"Sem resposta do Google: {e}") from e


def _achar_place_id(busca: str, chave: str) -> str:
    r = _requisicao(f"{URL_BASE}/places:searchText", chave, "places.id", {"textQuery": busca, "languageCode": "pt-BR"})
    lugares = r.get("places") or []
    if not lugares:
        raise ErroGoogle(f'Nenhum lugar encontrado no Google para "{busca}".')
    return lugares[0]["id"]


def _formatar(place_id: str, r: dict) -> dict:
    avaliacoes = []
    for a in r.get("reviews") or []:
        texto = ((a.get("text") or {}).get("text") or (a.get("originalText") or {}).get("text") or "").strip()
        autor = a.get("authorAttribution") or {}
        avaliacoes.append({
            "autor": autor.get("displayName") or "Cliente do Google",
            "autor_url": autor.get("uri"),
            "foto_url": autor.get("photoUri"),
            "nota": a.get("rating") or 0,
            "texto": texto,
            "quando": a.get("relativePublishTimeDescription") or "",
            "publicado_em": a.get("publishTime"),
            "url": a.get("googleMapsUri"),
        })
    return {
        "place_id": place_id,
        "nome": (r.get("displayName") or {}).get("text") or "",
        "nota": r.get("rating"),
        "total": r.get("userRatingCount") or 0,
        "url": r.get("googleMapsUri"),
        "avaliacoes": avaliacoes,
    }


def buscar_no_google(busca: str, chave: str) -> dict:
    """Consulta o Google agora (sem cache). Levanta ErroGoogle."""
    busca = (busca or "").strip()
    place_id = busca if parece_place_id(busca) else _achar_place_id(busca, chave)
    r = _requisicao(
        f"{URL_BASE}/places/{place_id}?languageCode=pt-BR",
        chave,
        "displayName,rating,userRatingCount,googleMapsUri,reviews",
    )
    return _formatar(place_id, r)


class CacheAvaliacoes:
    def __init__(self):
        self._itens = {}  # busca -> {"em": ts, "dados": dict | None, "erro_em": ts}
        self._trava = threading.Lock()

    def obter(self, busca: str, chave: str) -> Optional[dict]:
        """Dados do cache ou do Google; None se não há nada bom para mostrar."""
        agora = time.time()
        with self._trava:
            item = self._itens.get(busca) or {}
            fresco = item.get("dados") and agora - item["em"] < TTL_CACHE
            esperando = item.get("erro_em") and agora - item["erro_em"] < TTL_ERRO
            if fresco or esperando:
                return self._utilizavel(item, agora)
            try:
                dados = buscar_no_google(busca, chave)
                self._itens[busca] = {"em": agora, "dados": dados}
                return dados
            except ErroGoogle as e:
                logger.warning("Avaliações do Google indisponíveis: %s", e)
                item["erro_em"] = agora
                self._itens[busca] = item
                return self._utilizavel(item, agora)

    def guardar(self, busca: str, dados: dict):
        with self._trava:
            self._itens[busca] = {"em": time.time(), "dados": dados}

    @staticmethod
    def _utilizavel(item: dict, agora: float) -> Optional[dict]:
        if item.get("dados") and agora - item["em"] < TTL_VELHO:
            return item["dados"]
        return None


def para_pagina(dados: dict, nota_minima: int) -> dict:
    """O que a página pública recebe: só avaliações com texto e nota >= nota_minima."""
    avaliacoes = [a for a in dados["avaliacoes"] if a["texto"] and (a["nota"] or 0) >= nota_minima]
    return {
        "ativo": bool(avaliacoes),
        "nome": dados["nome"],
        "nota": dados["nota"],
        "total": dados["total"],
        "url": dados["url"],
        "avaliacoes": avaliacoes,
    }
