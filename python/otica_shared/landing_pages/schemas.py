from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class LandingPageCreate(BaseModel):
    nome: str
    template: str
    empresa_id: Optional[int] = None  # None = empresa 1


class LandingPageUpdate(BaseModel):
    nome: Optional[str] = None
    slug: Optional[str] = None
    conteudo: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    meta_titulo: Optional[str] = None
    meta_descricao: Optional[str] = None
    empresa_id: Optional[int] = None


class LandingPageOut(BaseModel):
    id: int
    empresa_id: int = 1
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
    cliques_whatsapp: int = 0
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
    titulo: str = ""  # título da aba quando a página não tem o próprio
    fonte: str = ""  # família do Google Fonts (ver `FONTES_MARCA`); vazio = a do modelo


class ConfigEmpresa(BaseModel):
    nome: str = ""


class EmpresaOut(BaseModel):
    id: int
    nome: str
    total_paginas: int = 0
    dominio: str = ""  # endereço do domínio próprio ("" = sem); o painel monta os links com ele


class EmpresaCreate(BaseModel):
    nome: str


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


class ConfigDominio(BaseModel):
    endereco: str = ""  # ex: "lp.minhaotica.com.br" (sem https://); vazio = sem domínio próprio
    pagina_inicial: str = ""  # slug aberto na raiz do domínio


class ConfigRastreamento(BaseModel):
    ga4_id: str = ""  # G-XXXXXXX
    ads_id: str = ""  # AW-123456789
    ads_rotulo_lead: str = ""  # rótulo da conversão "lead enviado"
    ads_rotulo_whatsapp: str = ""  # rótulo da conversão "clique no WhatsApp"
    hotjar_id: str = ""
    clarity_id: str = ""


class ConfigPublicaOut(BaseModel):
    """Parte das configurações que a página pública recebe (ver `config.publica`)."""
    whatsapp: ConfigWhatsapp
    marca: ConfigMarca
    menu: ConfigMenu
    rastreamento: ConfigRastreamento = ConfigRastreamento()


class LandingPagesConfigOut(ConfigPublicaOut):
    """Configurações que valem para todas as landing pages."""
    google: ConfigGoogle = ConfigGoogle()
    dominio: ConfigDominio = ConfigDominio()
    empresa: ConfigEmpresa = ConfigEmpresa()
    empresa_id: int = 1


class LandingPagesConfigUpdate(BaseModel):
    whatsapp: Optional[ConfigWhatsapp] = None
    marca: Optional[ConfigMarca] = None
    menu: Optional[ConfigMenu] = None
    google: Optional[ConfigGoogle] = None
    dominio: Optional[ConfigDominio] = None
    rastreamento: Optional[ConfigRastreamento] = None
    empresa: Optional[ConfigEmpresa] = None


class LandingPagePublicaOut(BaseModel):
    """Campos servidos pela rota pública — nunca vaza criado_por_id/status interno."""
    nome: str
    slug: Optional[str] = None  # a raiz do domínio próprio precisa saber qual página abriu
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
    gclid: Optional[str] = None
    gbraid: Optional[str] = None
    wbraid: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None


class LandingPageLeadOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    nome: str
    telefone: str
    mensagem: Optional[str] = None
    fbclid: Optional[str] = None
    gclid: Optional[str] = None
    gbraid: Optional[str] = None
    wbraid: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None
    criado_em: datetime


class LandingPageTemplateMeta(BaseModel):
    id: str
    nome: str
    descricao: str
