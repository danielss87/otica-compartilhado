"""Modelos das landing pages.

As tabelas (`landing_pages`, `landing_page_leads`) e colunas são IDÊNTICAS às
que a 4 Olhos já tinha em produção antes de virar pacote — nunca mudar nome
ou tipo de coluna aqui sem migração nos dois sistemas. Coluna nova: só
aditiva, com ALTER TABLE ADD COLUMN em runtime em cada app.

`conteudo` guarda os valores por campo do template como JSON solto; a
definição visual dos templates mora só no frontend (pacote js).
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship


def criar_modelos(Base, *, tabela_usuarios: str, modelo_usuario: str):
    """Declara os dois modelos no `Base` do app hospedeiro.

    - `tabela_usuarios`: nome da tabela de usuários do app (FK de `criado_por_id`).
    - `modelo_usuario`: nome da classe SQLAlchemy de usuário (relationship).

    Chamar uma única vez por app (cada chamada registra classes novas no Base).
    """

    class LandingPage(Base):
        __tablename__ = "landing_pages"

        id             = Column(Integer, primary_key=True, index=True)
        nome           = Column(String(200), nullable=False)
        slug           = Column(String(200), unique=True, index=True, nullable=False)
        template       = Column(String(50), nullable=False)
        conteudo       = Column(Text, nullable=True)
        status         = Column(String(20), nullable=False, default="rascunho")  # rascunho | publicada | pausada
        meta_titulo    = Column(String(200), nullable=True)
        meta_descricao = Column(String(400), nullable=True)
        visualizacoes  = Column(Integer, nullable=False, default=0)
        criado_por_id  = Column(Integer, ForeignKey(f"{tabela_usuarios}.id"), nullable=True)
        criado_em      = Column(DateTime(timezone=True), server_default=func.now())
        atualizado_em  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
        publicada_em   = Column(DateTime(timezone=True), nullable=True)

        criado_por = relationship(modelo_usuario)
        # Sem cascade de deleção de propósito: lead é dado permanente. O router
        # recusa (422) excluir página que já tem lead — pausar em vez disso.
        leads      = relationship("LandingPageLead", back_populates="landing_page")

    class LandingPageLead(Base):
        __tablename__ = "landing_page_leads"

        id              = Column(Integer, primary_key=True, index=True)
        landing_page_id = Column(Integer, ForeignKey("landing_pages.id"), nullable=False)
        nome            = Column(String(200), nullable=False)
        telefone        = Column(String(30), nullable=False)
        mensagem        = Column(String(1000), nullable=True)
        fbclid          = Column(String(255), nullable=True)
        criado_em       = Column(DateTime(timezone=True), server_default=func.now())

        landing_page = relationship("LandingPage", back_populates="leads")

    return LandingPage, LandingPageLead
