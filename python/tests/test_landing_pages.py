"""Testes do pacote de landing pages num app FastAPI mínimo com SQLite em memória."""
import pytest
from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from otica_shared.landing_pages import criar_modelo_config, criar_modelos, criar_routers

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100))


LandingPage, LandingPageLead = criar_modelos(Base, tabela_usuarios="usuarios", modelo_usuario="Usuario")
LandingPagesConfig = criar_modelo_config(Base)

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_usuario_atual(authorization: str = Header(default="")):
    if authorization != "Bearer ok":
        raise HTTPException(401, "Não autenticado")
    db = SessionLocal()
    try:
        return db.get(Usuario, 1)
    finally:
        db.close()


uploads = []


def upload_imagem(conteudo, nome, request):
    uploads.append((conteudo, nome))
    return f"https://cdn.exemplo/{nome}"


router, router_publico = criar_routers(
    LandingPage, LandingPageLead,
    get_db=get_db, get_usuario_atual=get_usuario_atual, upload_imagem=upload_imagem,
    LandingPagesConfig=LandingPagesConfig,
)
app = FastAPI()
app.include_router(router_publico, prefix="/api")
app.include_router(router, prefix="/api")

AUTH = {"Authorization": "Bearer ok"}


@pytest.fixture(autouse=True)
def banco_limpo():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    db.add(Usuario(id=1, nome="Daniel"))
    db.commit()
    db.close()
    yield


@pytest.fixture
def client():
    return TestClient(app)


def _criar(client, nome="Promoção de Agosto", template="simples"):
    r = client.post("/api/landing-pages", json={"nome": nome, "template": template}, headers=AUTH)
    assert r.status_code == 201, r.text
    return r.json()


def test_exige_auth(client):
    assert client.get("/api/landing-pages").status_code == 401


def test_criar_e_listar(client):
    lp = _criar(client)
    assert lp["slug"] == "promocao-de-agosto"
    assert lp["status"] == "rascunho"
    assert lp["criado_por_nome"] == "Daniel"
    lista = client.get("/api/landing-pages", headers=AUTH).json()
    assert [x["id"] for x in lista] == [lp["id"]]


def test_template_invalido(client):
    r = client.post("/api/landing-pages", json={"nome": "x", "template": "nao-existe"}, headers=AUTH)
    assert r.status_code == 422


def test_slug_com_colisao(client):
    a = _criar(client, "Oferta")
    b = _criar(client, "Oferta")
    assert (a["slug"], b["slug"]) == ("oferta", "oferta-2")
    r = client.put(f"/api/landing-pages/{b['id']}", json={"slug": "oferta"}, headers=AUTH)
    assert r.status_code == 409


def test_editar_nome_e_slug(client):
    lp = _criar(client, "Oferta")
    r = client.put(f"/api/landing-pages/{lp['id']}", json={"nome": "Óculos de Sol", "slug": " Verão Ótica! "}, headers=AUTH)
    assert r.status_code == 200
    assert (r.json()["nome"], r.json()["slug"]) == ("Óculos de Sol", "verao-otica")
    client.post(f"/api/landing-pages/{lp['id']}/publicar", headers=AUTH)
    assert client.get("/api/publico/landing-pages/verao-otica").status_code == 200
    assert client.get("/api/publico/landing-pages/oferta").status_code == 404
    # slug vazio é ignorado (não apaga o endereço)
    r = client.put(f"/api/landing-pages/{lp['id']}", json={"slug": ""}, headers=AUTH)
    assert r.json()["slug"] == "verao-otica"


def test_atualizar_conteudo(client):
    lp = _criar(client)
    r = client.put(f"/api/landing-pages/{lp['id']}", json={"conteudo": {"titulo": "Oi"}, "meta_titulo": "T"}, headers=AUTH)
    assert r.status_code == 200
    assert r.json()["conteudo"] == {"titulo": "Oi"}
    assert r.json()["meta_titulo"] == "T"


def test_publica_404_em_rascunho_e_200_publicada(client):
    lp = _criar(client)
    assert client.get(f"/api/publico/landing-pages/{lp['slug']}").status_code == 404
    client.post(f"/api/landing-pages/{lp['id']}/publicar", headers=AUTH)
    r = client.get(f"/api/publico/landing-pages/{lp['slug']}")
    assert r.status_code == 200
    assert "criado_por_id" not in r.json()


def test_visualizacao_e_lead(client):
    lp = _criar(client)
    client.post(f"/api/landing-pages/{lp['id']}/publicar", headers=AUTH)
    client.post(f"/api/publico/landing-pages/{lp['slug']}/visualizacao")
    r = client.post(f"/api/publico/landing-pages/{lp['slug']}/lead", json={"nome": " Ana ", "telefone": "+5548999999999", "fbclid": "abc"})
    assert r.status_code == 201
    dados = client.get(f"/api/landing-pages/{lp['id']}", headers=AUTH).json()
    assert dados["visualizacoes"] == 1
    assert dados["total_leads"] == 1
    leads = client.get(f"/api/landing-pages/{lp['id']}/leads", headers=AUTH).json()
    assert leads[0]["nome"] == "Ana" and leads[0]["fbclid"] == "abc"


def test_lead_em_pagina_pausada_404(client):
    lp = _criar(client)
    client.post(f"/api/landing-pages/{lp['id']}/publicar", headers=AUTH)
    client.post(f"/api/landing-pages/{lp['id']}/pausar", headers=AUTH)
    r = client.post(f"/api/publico/landing-pages/{lp['slug']}/lead", json={"nome": "Ana", "telefone": "1"})
    assert r.status_code == 404


def test_excluir_sem_leads(client):
    lp = _criar(client)
    assert client.delete(f"/api/landing-pages/{lp['id']}", headers=AUTH).status_code == 204
    assert client.get(f"/api/landing-pages/{lp['id']}", headers=AUTH).status_code == 404


def test_excluir_com_leads_recusa(client):
    lp = _criar(client)
    client.post(f"/api/landing-pages/{lp['id']}/publicar", headers=AUTH)
    client.post(f"/api/publico/landing-pages/{lp['slug']}/lead", json={"nome": "Ana", "telefone": "1"})
    r = client.delete(f"/api/landing-pages/{lp['id']}", headers=AUTH)
    assert r.status_code == 422
    assert client.get(f"/api/landing-pages/{lp['id']}", headers=AUTH).status_code == 200


def test_duplicar(client):
    lp = _criar(client, "Oferta")
    client.put(f"/api/landing-pages/{lp['id']}", json={"conteudo": {"titulo": "X"}}, headers=AUTH)
    r = client.post(f"/api/landing-pages/{lp['id']}/duplicar", headers=AUTH)
    assert r.status_code == 201
    assert r.json()["slug"] == "oferta-copia"
    assert r.json()["conteudo"] == {"titulo": "X"}
    assert r.json()["status"] == "rascunho"


def test_upload_imagem(client):
    r = client.post("/api/landing-pages/upload-imagem", files={"imagem": ("a.png", b"123", "image/png")}, headers=AUTH)
    assert r.json() == {"url": "https://cdn.exemplo/a.png"}
    assert client.post("/api/landing-pages/upload-imagem", files={"imagem": ("v.png", b"", "image/png")}, headers=AUTH).status_code == 400


def test_templates(client):
    ids = [t["id"] for t in client.get("/api/landing-pages/templates", headers=AUTH).json()]
    assert ids == ["simples", "promocao", "agendar_consulta", "greats", "leader"]


def _publicar(client, nome="Oferta"):
    lp = _criar(client, nome)
    client.post(f"/api/landing-pages/{lp['id']}/publicar", headers=AUTH)
    return lp


def test_configuracoes_padrao_desligadas(client):
    assert client.get("/api/landing-pages/configuracoes").status_code == 401
    cfg = client.get("/api/landing-pages/configuracoes", headers=AUTH).json()
    assert cfg["whatsapp"]["ativo"] is False and cfg["marca"]["logo_url"] is None
    lp = _publicar(client)
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub == {
        "whatsapp": {"ativo": False, "numero": "", "mensagem": "", "notificacao": False},
        "marca": {"logo_url": None, "favicon_url": None},
        "menu": {"ativo": False, "cta_texto": "", "cta_destino": "whatsapp", "cta_url": "", "cta_cor": "padrao", "fixo": False, "cta_tilt": False},
    }
    assert cfg["whatsapp"]["notificacao"] is True and cfg["menu"]["ativo"] is False


def test_configuracoes_whatsapp_e_logo(client):
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={
        "whatsapp": {"ativo": True, "numero": "(11) 99999-8888", "mensagem": "  Oi!  "},
    })
    assert r.status_code == 200
    assert r.json()["whatsapp"] == {"ativo": True, "numero": "5511999998888", "mensagem": "Oi!", "notificacao": True}
    # atualizar só a marca não mexe no WhatsApp
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"marca": {"logo_url": "https://cdn/logo.png"}})
    assert r.json()["whatsapp"]["ativo"] is True
    lp = _publicar(client)
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["whatsapp"] == {"ativo": True, "numero": "5511999998888", "mensagem": "Oi!", "notificacao": True}
    assert pub["marca"]["logo_url"] == "https://cdn/logo.png"
    # desligar esconde o número da página pública
    client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"whatsapp": {"ativo": False, "numero": "5511999998888", "mensagem": "Oi!"}})
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["whatsapp"]["ativo"] is False and pub["whatsapp"]["numero"] == ""


def test_configuracoes_whatsapp_sem_numero_valido(client):
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"whatsapp": {"ativo": True, "numero": "123"}})
    assert r.status_code == 422


def test_rota_configuracoes_nao_conflita_com_id(client):
    lp = _criar(client)
    assert client.get(f"/api/landing-pages/{lp['id']}", headers=AUTH).status_code == 200
    assert client.get("/api/landing-pages/configuracoes", headers=AUTH).status_code == 200


def test_notificacao_ligada_para_config_antiga_salva(client):
    # config salva antes da v0.4.0 (sem a chave) → notificação nasce ligada
    db = SessionLocal()
    db.add(LandingPagesConfig(id=1, dados='{"whatsapp": {"ativo": true, "numero": "5511999998888", "mensagem": "Oi"}}'))
    db.commit(); db.close()
    lp = _publicar(client)
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["whatsapp"]["notificacao"] is True
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"whatsapp": {"ativo": True, "numero": "5511999998888", "mensagem": "Oi", "notificacao": False}})
    assert r.json()["whatsapp"]["notificacao"] is False


def test_menu_cta_whatsapp_e_url(client):
    # menu com WhatsApp sem número → 422
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"menu": {"ativo": True, "cta_texto": "Fale", "cta_destino": "whatsapp"}})
    assert r.status_code == 422
    client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"whatsapp": {"ativo": False, "numero": "11999998888", "mensagem": "Olá, tudo bem?"}})
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"menu": {"ativo": True, "cta_texto": " Fale conosco ", "cta_destino": "whatsapp"}})
    assert r.status_code == 200
    lp = _publicar(client)
    menu = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]["menu"]
    # funciona mesmo com o botão flutuante desligado
    assert menu == {"ativo": True, "cta_texto": "Fale conosco", "cta_destino": "whatsapp",
                    "cta_url": "https://wa.me/5511999998888?text=Ol%C3%A1%2C%20tudo%20bem%3F", "cta_cor": "padrao", "fixo": False, "cta_tilt": False}
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"menu": {"ativo": True, "cta_texto": "Loja", "cta_destino": "url", "cta_url": ""}})
    assert r.status_code == 422
    client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"menu": {"ativo": True, "cta_texto": "Loja", "cta_destino": "url", "cta_url": "loja.com.br/x"}})
    menu = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]["menu"]
    assert menu["cta_url"] == "https://loja.com.br/x"
    assert client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"menu": {"ativo": False, "cta_destino": "fax"}}).status_code == 422


def test_menu_cta_secao_contato_e_cor_da_pagina(client):
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={
        "menu": {"ativo": True, "cta_texto": "Quero o meu", "cta_destino": "contato", "cta_cor": "principal"},
    })
    assert r.status_code == 200  # não exige número de WhatsApp nem link
    lp = _publicar(client)
    menu = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]["menu"]
    assert menu == {"ativo": True, "cta_texto": "Quero o meu", "cta_destino": "contato", "cta_url": "#contato", "cta_cor": "principal", "fixo": False, "cta_tilt": False}
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"menu": {"ativo": True, "cta_texto": "X", "cta_destino": "contato", "cta_cor": "roxo"}})
    assert r.status_code == 422


def test_secao_contato_e_escurecimento_salvos_no_conteudo(client):
    lp = _criar(client, "Greats", template="greats")
    r = client.put(f"/api/landing-pages/{lp['id']}", headers=AUTH, json={"conteudo": {"secao_contato": "colecoes", "hero_escurecimento": 60}})
    assert r.json()["conteudo"] == {"secao_contato": "colecoes", "hero_escurecimento": 60}


def test_menu_fixo(client):
    lp = _publicar(client)
    corpo = {"menu": {"ativo": True, "cta_texto": "Fale", "cta_destino": "url", "cta_url": "exemplo.com", "fixo": True}}
    assert client.put("/api/landing-pages/configuracoes", headers=AUTH, json=corpo).json()["menu"]["fixo"] is True
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["menu"]["fixo"] is True and pub["menu"]["cta_tilt"] is False
    # menu desligado → nunca fixo na página pública
    corpo["menu"]["ativo"] = False
    client.put("/api/landing-pages/configuracoes", headers=AUTH, json=corpo)
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["menu"]["fixo"] is False


def test_favicon(client):
    lp = _publicar(client)
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"marca": {"logo_url": "/uploads/l.png", "favicon_url": " /uploads/f.png "}})
    assert r.json()["marca"] == {"logo_url": "/uploads/l.png", "favicon_url": "/uploads/f.png"}
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["marca"]["favicon_url"] == "/uploads/f.png"
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"marca": {"logo_url": "/uploads/l.png", "favicon_url": ""}})
    assert r.json()["marca"]["favicon_url"] is None


def test_menu_cta_tilt(client):
    lp = _publicar(client)
    corpo = {"menu": {"ativo": True, "cta_texto": "Fale", "cta_destino": "url", "cta_url": "exemplo.com", "cta_tilt": True}}
    assert client.put("/api/landing-pages/configuracoes", headers=AUTH, json=corpo).json()["menu"]["cta_tilt"] is True
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["menu"]["cta_tilt"] is True
    corpo["menu"]["ativo"] = False
    client.put("/api/landing-pages/configuracoes", headers=AUTH, json=corpo)
    pub = client.get(f"/api/publico/landing-pages/{lp['slug']}").json()["configuracoes"]
    assert pub["menu"]["cta_tilt"] is False


# ─── Avaliações do Google (v0.15.0) ─────────────────────────────────────────

from otica_shared.landing_pages import google_avaliacoes

RESPOSTA_GOOGLE = {
    "displayName": {"text": "Ótica Exemplo"},
    "rating": 4.8,
    "userRatingCount": 120,
    "googleMapsUri": "https://maps.google.com/?cid=1",
    "reviews": [
        {"rating": 5, "text": {"text": "Ótimo atendimento"}, "authorAttribution": {"displayName": "Ana"}, "relativePublishTimeDescription": "há 1 mês"},
        {"rating": 2, "text": {"text": "Demorou"}, "authorAttribution": {"displayName": "Beto"}},
        {"rating": 5, "authorAttribution": {"displayName": "Sem texto"}},
    ],
}


def _app_com_chave(chave):
    r, rp = criar_routers(
        LandingPage, LandingPageLead,
        get_db=get_db, get_usuario_atual=get_usuario_atual, upload_imagem=upload_imagem,
        LandingPagesConfig=LandingPagesConfig, google_places_api_key=chave,
    )
    a = FastAPI()
    a.include_router(rp, prefix="/api")
    a.include_router(r, prefix="/api")
    return TestClient(a)


@pytest.fixture
def google_falso(monkeypatch):
    chamadas = []

    def requisicao(url, chave, campos, corpo=None):
        chamadas.append(url)
        if corpo is not None:
            return {"places": [{"id": "ChIJexemplo0000000000000"}]}
        return RESPOSTA_GOOGLE

    monkeypatch.setattr(google_avaliacoes, "_requisicao", requisicao)
    return chamadas


def test_google_desligado_por_padrao(client):
    assert client.get("/api/publico/landing-pages/avaliacoes-google").json() == {"ativo": False}
    assert client.get("/api/landing-pages/configuracoes", headers=AUTH).json()["google"] == {"busca": "", "nota_minima": 4}
    assert client.get("/api/landing-pages/avaliacoes-google/teste?busca=x", headers=AUTH).status_code == 400


def test_google_avaliacoes_publicas_com_cache(google_falso):
    c = _app_com_chave("chave")
    # sem busca configurada: desligado, sem chamar o Google
    assert c.get("/api/publico/landing-pages/avaliacoes-google").json() == {"ativo": False}
    c.put("/api/landing-pages/configuracoes", headers=AUTH, json={"google": {"busca": " Ótica Exemplo, Cidade ", "nota_minima": 4}})
    r = c.get("/api/publico/landing-pages/avaliacoes-google").json()
    assert r["ativo"] is True and r["nota"] == 4.8 and r["total"] == 120
    # só nota >= 4 e com texto
    assert [a["autor"] for a in r["avaliacoes"]] == ["Ana"]
    assert "place_id" not in r
    # busca de texto (achar o ID) + detalhes; a segunda visita vem do cache
    assert len(google_falso) == 2
    c.get("/api/publico/landing-pages/avaliacoes-google")
    assert len(google_falso) == 2


def test_google_place_id_direto_e_teste_no_painel(google_falso):
    c = _app_com_chave("chave")
    r = c.get("/api/landing-pages/avaliacoes-google/teste?busca=ChIJabcdefghijklmnopqrstu", headers=AUTH)
    assert r.status_code == 200 and r.json()["nome"] == "Ótica Exemplo"
    assert len(google_falso) == 1 and "places/ChIJabcdefghijklmnopqrstu" in google_falso[0]
    assert c.get("/api/landing-pages/avaliacoes-google/teste?busca=x").status_code == 401


def test_google_erro_serve_ultimo_resultado(monkeypatch):
    cache = google_avaliacoes.CacheAvaliacoes()
    monkeypatch.setattr(google_avaliacoes, "buscar_no_google", lambda b, k: google_avaliacoes._formatar("id", RESPOSTA_GOOGLE))
    assert cache.obter("x", "k")["nome"] == "Ótica Exemplo"

    def falha(b, k):
        raise google_avaliacoes.ErroGoogle("fora do ar")

    monkeypatch.setattr(google_avaliacoes, "buscar_no_google", falha)
    cache._itens["x"]["em"] -= google_avaliacoes.TTL_CACHE + 1  # cache vencido
    assert cache.obter("x", "k")["nome"] == "Ótica Exemplo"  # serve o velho
    assert cache.obter("nunca-deu-certo", "k") is None


def test_dominio_proprio_padrao_vazio_e_normaliza(client):
    cfg = client.get("/api/landing-pages/configuracoes", headers=AUTH).json()
    assert cfg["dominio"] == {"endereco": "", "pagina_inicial": ""}
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"dominio": {"endereco": "https://LP.Loja.com.br/promo"}})
    assert r.status_code == 200 and r.json()["dominio"]["endereco"] == "lp.loja.com.br"
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"dominio": {"endereco": "não é domínio"}})
    assert r.status_code == 422


def test_dominio_proprio_pagina_inicial(client):
    assert client.get("/api/publico/landing-pages/_inicio").status_code == 404
    lp = _criar(client)
    r = client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"dominio": {"endereco": "lp.loja.com.br", "pagina_inicial": "nao-existe"}})
    assert r.status_code == 422
    client.put("/api/landing-pages/configuracoes", headers=AUTH, json={"dominio": {"endereco": "lp.loja.com.br", "pagina_inicial": lp["slug"]}})
    assert client.get("/api/publico/landing-pages/_inicio").status_code == 404  # rascunho
    client.post(f"/api/landing-pages/{lp['id']}/publicar", headers=AUTH)
    r = client.get("/api/publico/landing-pages/_inicio")
    assert r.status_code == 200 and r.json()["slug"] == lp["slug"]
    # Trocar o endereço da página inicial leva a config junto
    client.put(f"/api/landing-pages/{lp['id']}", headers=AUTH, json={"slug": "nova"})
    assert client.get("/api/landing-pages/configuracoes", headers=AUTH).json()["dominio"]["pagina_inicial"] == "nova"
    assert client.get("/api/publico/landing-pages/_inicio").json()["slug"] == "nova"
    # A config pública não expõe o domínio
    assert "dominio" not in client.get("/api/publico/landing-pages/nova").json()["configuracoes"]
