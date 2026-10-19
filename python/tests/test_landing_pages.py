"""Testes do pacote de landing pages num app FastAPI mínimo com SQLite em memória."""
import pytest
from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from otica_shared.landing_pages import criar_modelos, criar_routers

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100))


LandingPage, LandingPageLead = criar_modelos(Base, tabela_usuarios="usuarios", modelo_usuario="Usuario")

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
    assert ids == ["simples", "promocao", "agendar_consulta", "greats"]
