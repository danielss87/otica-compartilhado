"""Routers das landing pages.

Dois routers de propósito:
- `router` (prefixo `/landing-pages`) — autenticado, consumido pelo painel.
- `router_publico` (prefixo `/publico/landing-pages`) — SEM auth, serve a
  página pública (/lp/:slug) e a captura de lead. Registrar ANTES do `router`
  no app hospedeiro.

Tudo que é específico de cada sistema entra por injeção em `criar_routers`
(banco, usuário logado, upload de imagem, nome/foto de quem criou).
"""
import json
import re
import unicodedata
from datetime import datetime, timezone
from typing import Callable, Optional, Tuple

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import config as cfg_lp
from .schemas import (
    LandingPageCreate,
    LandingPageLeadCreate,
    LandingPageLeadOut,
    LandingPageOut,
    LandingPagePublicaOut,
    LandingPageTemplateMeta,
    LandingPageUpdate,
    LandingPagesConfigOut,
    LandingPagesConfigUpdate,
)

TEMPLATES_VALIDOS = {"simples", "promocao", "agendar_consulta", "greats"}

TEMPLATES_META = [
    {"id": "simples", "nome": "Simples", "descricao": "Hero + texto livre + CTA — ideal para uma oferta única e direta."},
    {"id": "promocao", "nome": "Promoção", "descricao": "Hero + imagem de produto + lista de benefícios + CTA."},
    {"id": "agendar_consulta", "nome": "Agendar consulta", "descricao": "Hero + CTA de WhatsApp + FAQ."},
    {"id": "greats", "nome": "Greats", "descricao": "Layout premium de e-commerce (hero, mosaico de fotos, CTAs) — fiel a uma referência real."},
]

STATUS_VALIDOS = {"rascunho", "publicada", "pausada"}

# (conteudo, nome_arquivo, request) -> URL pública da imagem
UploadImagem = Callable[[bytes, str, Request], str]
# (db, usuario_id) -> (nome, foto_url)
InfoCriador = Callable[[Session, int], Tuple[Optional[str], Optional[str]]]


def _slug(nome: str) -> str:
    # Translitera acento ("Promoção" → "promocao"); o resto vira "-". Slug já
    # gravado nunca é recalculado, então mudar esta regra não quebra link publicado.
    # Mesma regra de `normalizarSlug` no frontend (LandingPageEditor.jsx).
    s = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode("ascii")
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:80] or "pagina"


def _info_criador_padrao(lp) -> Tuple[Optional[str], Optional[str]]:
    u = lp.criado_por
    if not u:
        return None, None
    nome = getattr(u, "nome", None) or getattr(u, "name", None)
    foto = getattr(u, "foto_url", None) or getattr(u, "photo_url", None)
    return nome, foto


def criar_routers(
    LandingPage,
    LandingPageLead,
    *,
    get_db: Callable,
    get_usuario_atual: Callable,
    upload_imagem: UploadImagem,
    info_criador: Optional[InfoCriador] = None,
    LandingPagesConfig=None,
) -> Tuple[APIRouter, APIRouter]:
    """Monta `(router, router_publico)` ligados aos modelos e dependências do app.

    `LandingPagesConfig` (de `criar_modelo_config`) liga as configurações gerais
    (botão de WhatsApp, logo). Sem ele, as rotas de configuração respondem 404 e
    as páginas saem sem logo/botão.
    """

    def _ler_config(db: Session) -> dict:
        if LandingPagesConfig is None:
            return cfg_lp.mesclar_com_padrao({})
        linha = db.query(LandingPagesConfig).filter(LandingPagesConfig.id == 1).first()
        return cfg_lp.ler(linha.dados if linha else None)

    def _gerar_slug_unico(db: Session, nome: str) -> str:
        base = _slug(nome)
        slug = base
        n = 2
        while db.query(LandingPage).filter(LandingPage.slug == slug).first():
            slug = f"{base}-{n}"
            n += 1
        return slug

    def _parse_conteudo(lp) -> Optional[dict]:
        if not lp.conteudo:
            return None
        try:
            return json.loads(lp.conteudo)
        except (TypeError, ValueError):
            return None

    def _contar_leads(db: Session, lp_id: int) -> int:
        return db.query(func.count(LandingPageLead.id)).filter(
            LandingPageLead.landing_page_id == lp_id
        ).scalar() or 0

    def _enrich(lp, db: Session) -> dict:
        if info_criador and lp.criado_por_id:
            criado_por_nome, criado_por_foto_url = info_criador(db, lp.criado_por_id)
        else:
            criado_por_nome, criado_por_foto_url = _info_criador_padrao(lp)
        return {
            "id": lp.id,
            "nome": lp.nome,
            "slug": lp.slug,
            "template": lp.template,
            "conteudo": _parse_conteudo(lp),
            "status": lp.status,
            "meta_titulo": lp.meta_titulo,
            "meta_descricao": lp.meta_descricao,
            "visualizacoes": lp.visualizacoes,
            "criado_por_id": lp.criado_por_id,
            "criado_por_nome": criado_por_nome,
            "criado_por_foto_url": criado_por_foto_url,
            "total_leads": _contar_leads(db, lp.id),
            "criado_em": lp.criado_em,
            "atualizado_em": lp.atualizado_em,
            "publicada_em": lp.publicada_em,
        }

    def _obter_ou_404(db: Session, lp_id: int):
        lp = db.query(LandingPage).filter(LandingPage.id == lp_id).first()
        if not lp:
            raise HTTPException(404, "Landing page não encontrada.")
        return lp

    router = APIRouter(
        prefix="/landing-pages",
        tags=["Landing Pages"],
        dependencies=[Depends(get_usuario_atual)],
    )

    @router.get("/templates", response_model=list[LandingPageTemplateMeta])
    def listar_templates():
        return TEMPLATES_META

    # Registradas antes de "/{lp_id}" para "configuracoes" não ser lido como id.
    @router.get("/configuracoes", response_model=LandingPagesConfigOut)
    def obter_configuracoes(db: Session = Depends(get_db)):
        if LandingPagesConfig is None:
            raise HTTPException(404, "Configurações não habilitadas neste sistema.")
        return _ler_config(db)

    @router.put("/configuracoes", response_model=LandingPagesConfigOut)
    def atualizar_configuracoes(payload: LandingPagesConfigUpdate, db: Session = Depends(get_db)):
        if LandingPagesConfig is None:
            raise HTTPException(404, "Configurações não habilitadas neste sistema.")
        atual = _ler_config(db)
        novo = payload.model_dump(exclude_unset=True)
        if "whatsapp" in novo:
            w = novo["whatsapp"]
            w["numero"] = cfg_lp.normalizar_numero_whatsapp(w.get("numero", ""))
            w["mensagem"] = (w.get("mensagem") or "").strip()
            if w.get("ativo") and not (12 <= len(w["numero"]) <= 15):
                raise HTTPException(422, "Informe o número do WhatsApp com DDD (ex: 11 99999-9999).")
        if "marca" in novo:
            for chave in ("logo_url", "favicon_url"):
                novo["marca"][chave] = (novo["marca"].get(chave) or "").strip() or None
        for secao, valores in novo.items():
            atual[secao].update(valores)
        if "menu" in novo:
            m = atual["menu"]
            m["cta_texto"] = (m.get("cta_texto") or "").strip()
            if m["cta_destino"] not in ("whatsapp", "url", "contato"):
                raise HTTPException(422, "Destino do botão do menu inválido.")
            if m.get("cta_cor") not in ("padrao", "principal", "destaque"):
                raise HTTPException(422, "Cor do botão do menu inválida.")
            m["cta_url"] = cfg_lp.normalizar_url(m.get("cta_url"))
            if m["ativo"]:
                if not m["cta_texto"]:
                    raise HTTPException(422, "Informe o texto do botão do menu.")
                if m["cta_destino"] == "url" and not m["cta_url"]:
                    raise HTTPException(422, "Informe o link do botão do menu.")
                if m["cta_destino"] == "whatsapp" and not atual["whatsapp"]["numero"]:
                    raise HTTPException(422, "Para o botão do menu abrir o WhatsApp, preencha o número na seção Botão de WhatsApp.")
        linha = db.query(LandingPagesConfig).filter(LandingPagesConfig.id == 1).first()
        if not linha:
            linha = LandingPagesConfig(id=1)
            db.add(linha)
        linha.dados = json.dumps(atual)
        db.commit()
        return atual

    @router.get("", response_model=list[LandingPageOut])
    def listar(db: Session = Depends(get_db)):
        itens = db.query(LandingPage).order_by(LandingPage.criado_em.desc()).all()
        return [_enrich(lp, db) for lp in itens]

    @router.post("", response_model=LandingPageOut, status_code=201)
    def criar(payload: LandingPageCreate, db: Session = Depends(get_db), usuario=Depends(get_usuario_atual)):
        if payload.template not in TEMPLATES_VALIDOS:
            raise HTTPException(422, f"Template inválido: {payload.template}")
        if not payload.nome.strip():
            raise HTTPException(422, "Nome é obrigatório.")
        lp = LandingPage(
            nome=payload.nome.strip(),
            slug=_gerar_slug_unico(db, payload.nome),
            template=payload.template,
            conteudo=json.dumps({}),
            status="rascunho",
            criado_por_id=getattr(usuario, "id", None),
        )
        db.add(lp)
        db.commit()
        db.refresh(lp)
        return _enrich(lp, db)

    @router.get("/{lp_id}", response_model=LandingPageOut)
    def obter(lp_id: int, db: Session = Depends(get_db)):
        return _enrich(_obter_ou_404(db, lp_id), db)

    @router.put("/{lp_id}", response_model=LandingPageOut)
    def atualizar(lp_id: int, payload: LandingPageUpdate, db: Session = Depends(get_db)):
        lp = _obter_ou_404(db, lp_id)
        data = payload.model_dump(exclude_unset=True)
        if "slug" in data and data["slug"]:
            novo_slug = _slug(data["slug"])
            conflito = db.query(LandingPage).filter(LandingPage.slug == novo_slug, LandingPage.id != lp_id).first()
            if conflito:
                raise HTTPException(409, "Esse endereço já está em uso por outra landing page.")
            lp.slug = novo_slug
        data.pop("slug", None)
        if "status" in data and data["status"] not in STATUS_VALIDOS:
            raise HTTPException(422, "Status inválido.")
        if "conteudo" in data:
            lp.conteudo = json.dumps(data.pop("conteudo") or {})
        for k, v in data.items():
            setattr(lp, k, v)
        db.commit()
        db.refresh(lp)
        return _enrich(lp, db)

    @router.post("/{lp_id}/publicar", response_model=LandingPageOut)
    def publicar(lp_id: int, db: Session = Depends(get_db)):
        lp = _obter_ou_404(db, lp_id)
        lp.status = "publicada"
        if not lp.publicada_em:
            lp.publicada_em = datetime.now(timezone.utc)
        db.commit()
        db.refresh(lp)
        return _enrich(lp, db)

    @router.post("/{lp_id}/pausar", response_model=LandingPageOut)
    def pausar(lp_id: int, db: Session = Depends(get_db)):
        lp = _obter_ou_404(db, lp_id)
        lp.status = "pausada"
        db.commit()
        db.refresh(lp)
        return _enrich(lp, db)

    @router.post("/{lp_id}/duplicar", response_model=LandingPageOut, status_code=201)
    def duplicar(lp_id: int, db: Session = Depends(get_db), usuario=Depends(get_usuario_atual)):
        original = _obter_ou_404(db, lp_id)
        copia = LandingPage(
            nome=f"{original.nome} (cópia)",
            slug=_gerar_slug_unico(db, f"{original.nome} copia"),
            template=original.template,
            conteudo=original.conteudo,
            status="rascunho",
            meta_titulo=original.meta_titulo,
            meta_descricao=original.meta_descricao,
            criado_por_id=getattr(usuario, "id", None),
        )
        db.add(copia)
        db.commit()
        db.refresh(copia)
        return _enrich(copia, db)

    @router.delete("/{lp_id}", status_code=204)
    def deletar(lp_id: int, db: Session = Depends(get_db)):
        lp = _obter_ou_404(db, lp_id)
        total = _contar_leads(db, lp.id)
        if total:
            raise HTTPException(
                422,
                f"Essa página já captou {total} lead(s) e não pode ser excluída — leads são histórico "
                "permanente. Pause a página em vez de excluir.",
            )
        db.delete(lp)
        db.commit()

    @router.get("/{lp_id}/leads", response_model=list[LandingPageLeadOut])
    def listar_leads(lp_id: int, db: Session = Depends(get_db)):
        _obter_ou_404(db, lp_id)
        return (
            db.query(LandingPageLead)
            .filter(LandingPageLead.landing_page_id == lp_id)
            .order_by(LandingPageLead.criado_em.desc())
            .all()
        )

    @router.post("/upload-imagem")
    async def upload(request: Request, imagem: UploadFile = File(...)):
        conteudo = await imagem.read()
        if not conteudo:
            raise HTTPException(400, "Arquivo vazio.")
        return {"url": upload_imagem(conteudo, imagem.filename or "imagem.jpg", request)}

    # ─── Público (sem auth) ─────────────────────────────────────────────────

    router_publico = APIRouter(prefix="/publico/landing-pages", tags=["Landing Pages (público)"])

    @router_publico.get("/{slug}", response_model=LandingPagePublicaOut)
    def obter_publica(slug: str, db: Session = Depends(get_db)):
        lp = db.query(LandingPage).filter(LandingPage.slug == slug).first()
        if not lp or lp.status != "publicada":
            raise HTTPException(404, "Página não encontrada.")
        return {
            "nome": lp.nome,
            "template": lp.template,
            "conteudo": _parse_conteudo(lp),
            "meta_titulo": lp.meta_titulo,
            "meta_descricao": lp.meta_descricao,
            "configuracoes": cfg_lp.publica(_ler_config(db)),
        }

    @router_publico.post("/{slug}/visualizacao")
    def registrar_visualizacao(slug: str, db: Session = Depends(get_db)):
        lp = db.query(LandingPage).filter(LandingPage.slug == slug, LandingPage.status == "publicada").first()
        if lp:
            lp.visualizacoes = (lp.visualizacoes or 0) + 1
            db.commit()
        return {"ok": True}

    @router_publico.post("/{slug}/lead", status_code=201)
    def criar_lead(slug: str, payload: LandingPageLeadCreate, db: Session = Depends(get_db)):
        lp = db.query(LandingPage).filter(LandingPage.slug == slug, LandingPage.status == "publicada").first()
        if not lp:
            raise HTTPException(404, "Página não encontrada.")
        if not payload.nome.strip() or not payload.telefone.strip():
            raise HTTPException(422, "Nome e telefone são obrigatórios.")
        lead = LandingPageLead(
            landing_page_id=lp.id,
            nome=payload.nome.strip(),
            telefone=payload.telefone.strip(),
            mensagem=payload.mensagem,
            fbclid=(payload.fbclid or "").strip() or None,
        )
        db.add(lead)
        db.commit()
        return {"ok": True}

    return router, router_publico
