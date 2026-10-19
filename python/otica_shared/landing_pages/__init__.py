"""Landing pages de captura por template (origem: 4 Olhos gestão, ago/2026).

Uso no app hospedeiro:

    from otica_shared.landing_pages import criar_modelos, criar_routers

    LandingPage, LandingPageLead = criar_modelos(Base, tabela_usuarios="users", modelo_usuario="User")
    LandingPagesConfig = criar_modelo_config(Base)
    router, router_publico = criar_routers(
        LandingPage, LandingPageLead,
        get_db=get_db, get_usuario_atual=..., upload_imagem=...,
        LandingPagesConfig=LandingPagesConfig,
    )
    app.include_router(router_publico, prefix="/api")
    app.include_router(router, prefix="/api")
"""
from .models import criar_modelos, criar_modelo_config
from .router import criar_routers, TEMPLATES_META, TEMPLATES_VALIDOS

__all__ = ["criar_modelos", "criar_modelo_config", "criar_routers", "TEMPLATES_META", "TEMPLATES_VALIDOS"]
