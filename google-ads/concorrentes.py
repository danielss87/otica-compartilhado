#!/usr/bin/env python3
"""Lista de concorrentes compartilhada entre Ariel (Armazém dos Óculos) e 4 Olhos no Google Ads.

Sem dependência: só lê `concorrentes.json` (ao lado deste arquivo) e texto da saída das CLIs de cada projeto.

  # o que a lista compartilhada tem e a lista de conta da empresa ainda não tem
  <cli> listas-negativas --lista ID | python3 concorrentes.py faltando --empresa 4olhos

  # quais termos de pesquisa são busca por concorrente (e qual negativa da lista os bloqueia)
  <cli> termos-pesquisa --dias 30 | python3 concorrentes.py termos --empresa 4olhos

  # adicionar à lista compartilhada (achado numa das contas)
  python3 concorrentes.py adicionar --empresa 4olhos --nota "Ótica Klins, Tijucas" klins

A regra de negócio (quando negativar, exceções) está em README.md.
"""
import argparse
import json
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

ARQ = Path(__file__).with_name("concorrentes.json")
EMPRESAS = ("ariel", "4olhos")


def carregar():
    return json.loads(ARQ.read_text())


def salvar(dados):
    dados["concorrentes"].sort(key=lambda c: sem_acento(c["termo"]))
    ARQ.write_text(json.dumps(dados, ensure_ascii=False, indent=1) + "\n")


def sem_acento(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(ch) != "Mn")


def tokens(s):
    return re.findall(r"[\w&'+-]+", s.lower())


def bloqueia(neg, corresp, termo):
    """Regra do Google para negativas: sem plural, sinônimo nem variação de acento."""
    n, t = tokens(neg), tokens(termo)
    if not n:
        return False
    if corresp == "exata":
        return n == t
    if corresp == "ampla":
        return all(x in t for x in n)
    return any(t[i:i + len(n)] == n for i in range(len(t) - len(n) + 1))


def da_empresa(dados, empresa):
    """Concorrentes que valem para a empresa (tira o próprio nome dela)."""
    return [c for c in dados["concorrentes"] if c.get("dono") != empresa]


def ler_termos_cli(texto):
    """Lê a tabela das CLIs (cabeçalho + linha de traços + colunas com 2+ espaços). 1ª coluna = termo."""
    linhas = [l for l in texto.splitlines() if l.strip()]
    out = []
    for l in linhas:
        if set(l.strip()) <= set("- ") or l.lower().startswith(("termo", "lista", "(nenhum")):
            continue
        cols = re.split(r"\s{2,}", l.strip())
        termo = cols[0].strip().strip('"[]')
        if termo:
            out.append((termo, cols))
    return out


def cmd_faltando(a):
    dados = carregar()
    atuais = {t.lower() for t, _ in ler_termos_cli(sys.stdin.read())}
    falta = [c for c in da_empresa(dados, a.empresa) if c["termo"] not in atuais]
    if a.so_vistos_por:
        falta = [c for c in falta if a.so_vistos_por in c.get("visto_em", [])]
    for c in falta:
        print(formatar(c) if not a.nota else f"{formatar(c)}\t{c.get('nota', '')}")
    print(f"# {len(falta)} faltando", file=sys.stderr)


def formatar(c):
    return {"frase": f'"{c["termo"]}"', "exata": f'[{c["termo"]}]'}.get(c["corresp"], c["termo"])


def cmd_termos(a):
    dados = carregar()
    conc = da_empresa(dados, a.empresa)
    duvidas = dados.get("nao_negativar", [])
    for termo, cols in ler_termos_cli(sys.stdin.read()):
        hits = [c for c in conc if bloqueia(c["termo"], c["corresp"], termo)]
        duv = [d for d in duvidas if bloqueia(d["termo"], "frase", termo)]
        if hits or duv:
            marca = "CONCORRENTE" if hits else "NAO_NEGATIVAR"
            via = ", ".join(formatar(c) for c in hits) or "; ".join(f'{d["termo"]}: {d["motivo"]}' for d in duv)
            print(f"{marca}\t{termo}\t{' | '.join(cols[1:])}\t<- {via}")


def cmd_adicionar(a):
    dados = carregar()
    por_termo = {c["termo"]: c for c in dados["concorrentes"]}
    hoje = date.today().isoformat()
    for t in a.termos:
        t = t.lower().strip()
        if t in por_termo:
            c = por_termo[t]
            if a.empresa not in c.setdefault("visto_em", []):
                c["visto_em"].append(a.empresa)
            print(f"já estava: {t}")
            continue
        c = {"termo": t, "corresp": a.corresp, "visto_em": [a.empresa], "desde": hoje}
        if a.nota:
            c["nota"] = a.nota
        dados["concorrentes"].append(c)
        por_termo[t] = c
        print(f"novo: {formatar(c)}")
        if sem_acento(t) != t and sem_acento(t) not in por_termo:
            print(f"  atenção: falta a grafia sem acento ({sem_acento(t)})")
    salvar(dados)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("faltando")
    s.add_argument("--empresa", choices=EMPRESAS, required=True)
    s.add_argument("--so-vistos-por", choices=EMPRESAS)
    s.add_argument("--nota", action="store_true")
    s = sub.add_parser("termos")
    s.add_argument("--empresa", choices=EMPRESAS, required=True)
    s = sub.add_parser("adicionar")
    s.add_argument("--empresa", choices=EMPRESAS, required=True)
    s.add_argument("--corresp", choices=("frase", "ampla", "exata"), default="frase")
    s.add_argument("--nota")
    s.add_argument("termos", nargs="+")
    a = p.parse_args()
    {"faltando": cmd_faltando, "termos": cmd_termos, "adicionar": cmd_adicionar}[a.cmd](a)


if __name__ == "__main__":
    main()
