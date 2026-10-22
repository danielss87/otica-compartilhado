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


class ConfigWhatsapp(BaseModel):
    ativo: bool = False
    numero: str = ""
    mensagem: str = ""
    notificacao: bool = True


class ConfigMarca(BaseModel):
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None


class ConfigMenu(BaseModel):
    ativo: bool = False
    cta_texto: str = ""
    cta_destino: str = "whatsapp"  # whatsapp | url | contato
    cta_url: str = ""
    cta_cor: str = "padrao"  # padrao | principal | destaque
    fixo: bool = False  # menu preso no topo ao rolar
    cta_tilt: bool = False  # botão do menu balança de leve de tempos em tempos


class ConfigGoogle(BaseModel):
    busca: str = ""  # Place ID ou "nome da loja, cidade"; vazio = desligado
    nota_minima: int = 4


class ConfigPublicaOut(BaseModel):
    """Parte das configurações que a página pública recebe (ver `config.publica`)."""
    whatsapp: ConfigWhatsapp
    marca: ConfigMarca
    menu: ConfigMenu


class LandingPagesConfigOut(ConfigPublicaOut):
    """Configurações que valem para todas as landing pages."""
    google: ConfigGoogle = ConfigGoogle()


class LandingPagesConfigUpdate(BaseModel):
    whatsapp: Optional[ConfigWhatsapp] = None
    marca: Optional[ConfigMarca] = None
    menu: Optional[ConfigMenu] = None
    google: Optional[ConfigGoogle] = None


class LandingPagePublicaOut(BaseModel):
    """Campos servidos pela rota pública — nunca vaza criado_por_id/status interno."""
    nome: str
    template: str
    conteudo: Optional[Dict[str, Any]] = None
    meta_titulo: Optional[str] = None
    meta_descricao: Optional[str] = None
    configuracoes: Optional[ConfigPublicaOut] = None


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
