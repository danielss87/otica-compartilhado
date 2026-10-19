from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class LandingPageCreate(BaseModel):
    nome: str
    template: str


class LandingPageUpdate(BaseModel):
    nome: Optional[str] = None
    slug: Optional[str] = None
    conteudo: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    meta_titulo: Optional[str] = None
    meta_descricao: Optional[str] = None


class LandingPageOut(BaseModel):
    id: int
    nome: str
    slug: str
    template: str
    conteudo: Optional[Dict[str, Any]] = None
    status: str
    meta_titulo: Optional[str] = None
    meta_descricao: Optional[str] = None
    visualizacoes: int
    criado_por_id: Optional[int] = None
    criado_por_nome: Optional[str] = None
    criado_por_foto_url: Optional[str] = None
    total_leads: int = 0
    criado_em: datetime
    atualizado_em: datetime
    publicada_em: Optional[datetime] = None


class LandingPagePublicaOut(BaseModel):
    """Campos servidos pela rota pública — nunca vaza criado_por_id/status interno."""
    nome: str
    template: str
    conteudo: Optional[Dict[str, Any]] = None
    meta_titulo: Optional[str] = None
    meta_descricao: Optional[str] = None


class LandingPageLeadCreate(BaseModel):
    nome: str
    telefone: str
    mensagem: Optional[str] = None
    fbclid: Optional[str] = None


class LandingPageLeadOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    nome: str
    telefone: str
    mensagem: Optional[str] = None
    fbclid: Optional[str] = None
    criado_em: datetime


class LandingPageTemplateMeta(BaseModel):
    id: str
    nome: str
    descricao: str
