# Google Ads — o que Ariel e 4 Olhos compartilham

As duas óticas do Daniel anunciam na **mesma região (Grande Florianópolis)** e disputam os mesmos concorrentes. O que
uma conta aprende sobre concorrente ou sobre o Google Ads serve para a outra. Esta pasta é o ponto único disso; cada
projeto tem a própria skill `google-ads` (`.claude/skills/google-ads/SKILL.md`) com a conta, as campanhas e o diário
dela.

| | Ariel (Armazém dos Óculos) | 4 Olhos |
|---|---|---|
| Conta de anúncios | 417-954-3435 | 551-027-1145 (dentro da gerente 883-973-9166) |
| Lista de negativas da conta (concorrentes) | `10844201005` | `12311584030` |
| Diário da conta | `ariel/docs/GOOGLE_ADS_APRENDIZADOS.md` | `4 Olhos gestão App/docs/google-ads/APRENDIZADOS.md` |

Arquivos:
- `concorrentes.json`: a lista de concorrentes (fonte única). Editar só com `concorrentes.py adicionar`.
- `concorrentes.py`: compara a lista com a conta e com os termos de pesquisa (só Python, sem dependência).
- `aprendizados-comuns.md`: o que vale para qualquer conta de ótica (comportamento do Google, da API, critérios).

Sem versão nem pacote: as skills leem estes arquivos direto em `~/Desktop/otica-compartilhado/google-ads/`.

## A regra (vale igual para as duas: Ariel 27/10/2026, 4 Olhos 11/11/2026)

Busca pelo nome de outra ótica não vale o clique: quase sempre é gente querendo o endereço ou o telefone da
concorrente. Nome **claro** de concorrente (ótica, rede, laboratório, loja online de óculos) que aparece nos termos de
pesquisa é negativado **sem pedir OK** ao Daniel: simular, aplicar, avisar depois. Caso duvidoso, perguntar antes.

- **Onde**: na lista de negativas **da conta** (vale para todas as campanhas, inclusive as futuras). Limite do Google:
  **1.000 termos** por lista da conta.
- **Forma**: frase, só a parte distintiva ("orasis", não "ótica orasis"). Nome que é palavra comum entra como
  "ótica X" / "otica X" / "óticas X" / "oticas X", nunca solto.
- **Grafias**: a negativa não pega variação. Sempre com e sem acento, e atenção a "óptica/optica" (escapou "optica
  luna" com "otica luna" na lista) e a singular/plural ("hospital do oculos" × "hospital dos oculos").
- **Teste da palavra comum**: "alguém pesquisaria 'ótica X' sem querer a loja X?". Só é sim quando X descreve o tipo de
  ótica (popular, especialista, barata, perto, aberta, 24h, express) ou é lugar onde a empresa anuncia. Nome de pessoa,
  cidade de fora, marca ou substantivo qualquer = loja concorrente.
- **Cada empresa tira o próprio nome**: o campo `dono` marca a marca de uma das duas ("4 olhos" só é negativado no
  Ariel; "armazém dos óculos" só na 4 Olhos). As duas se negativam de propósito, para não disputarem o mesmo clique.
- **Fora desta lista**: marcas de armação/lente e termos genéricos (conserto, vagas, grátis). O que o Ariel não vende
  pode ser o que a 4 Olhos vende; isso fica na conta de cada uma.
- **`nao_negativar`**: casos já decididos pelo Daniel em que o nome parece concorrente mas não se negativa na lista da
  conta (adjetivo, lugar, produto nosso). O comando `termos` marca esses termos como `NAO_NEGATIVAR`.

## Uso (de dentro de cada projeto, com a CLI dele)

```bash
G=~/Desktop/otica-compartilhado/google-ads/concorrentes.py

# 1. Toda análise de termos de pesquisa: quais são concorrente (e qual negativa da lista pega)
<cli> termos-pesquisa --dias 14 | python3 $G termos --empresa 4olhos
#    termo que é concorrente e NÃO aparece aqui = nome novo → passo 2

# 2. Nome novo achado: entra na lista compartilhada (as duas grafias!) e na conta
python3 $G adicionar --empresa 4olhos --nota "Ótica Klins, Tijucas" klins
<cli> lista-negativa-add <id da lista da conta> '"klins"' --aplicar

# 3. De vez em quando (e no começo de cada sessão de Google Ads): o que a outra empresa achou e esta conta não tem
<cli> listas-negativas --lista <id> | python3 $G faltando --empresa 4olhos --nota
#    → negativar o que faltar (mesma autorização), simulando antes
```

`<cli>` = `cd backend && ~/.venvs/gads/bin/python scripts/google_ads_cli.py` (4 Olhos) ou
`cd backend && venv/bin/python scripts/google_ads_cli.py` (Ariel).

Depois de mexer: commitar `concorrentes.json` aqui (`git -C ~/Desktop/otica-compartilhado commit`), para a outra
sessão ver.
