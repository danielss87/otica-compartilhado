# Estratégia de Google Ads — Armazém dos Óculos + 4 Olhos

Combinada com o Daniel em 11/11/2026. Ler no passo 0 de qualquer sessão de Google Ads, nas duas contas. Mudança de
estratégia é decisão do Daniel: registrar aqui com data. Cada alteração nas contas continua seguindo o fluxo da skill
(propor → simular → OK do Daniel), exceto concorrente (autorização permanente, ver `README.md`).

## Por que uma estratégia só

- **Mesmo shopping, mesmo leilão.** A loja principal da 4 Olhos (Camelão, loja 185) e o Armazém (Camelão, loja 91) ficam
  no mesmo prédio em Campinas, São José. Se as duas contas anunciam na mesma busca, uma sobe o preço do clique da outra
  e o Daniel paga duas vezes pelo mesmo cliente.
- **Empresas diferentes, contas diferentes.** Não é para juntar campanhas, e sim para cada conta ficar com a fatia em que
  ganha mais e deixar a outra fatia para a irmã.

| | Armazém dos Óculos | 4 Olhos |
|---|---|---|
| Posição | ótica de bairro com ZEISS, atendimento e urgência (1 dia útil) | preço baixo (R$ 250 armação + lente), loja + site |
| Ticket | ~R$ 990 (venda com cliente, `ariel/docs/PLANO_CONVERSAO_OFFLINE.md`) | ~R$ 340 (~250 O.S./mês, sistema 4 Olhos, jun–out/2026) |
| Lojas | Camelão (Campinas, São José) | Camelão (Campinas, São José) e Centro de Florianópolis (Galeria Jaqueline, desde 22/10/2026) |
| Google Ads hoje | 4 campanhas de pesquisa, ~R$ 27/dia; Bairro é a melhor (R$ 13,43 por conversão principal) | 1 campanha de pesquisa, R$ 30/dia ("[ASTER] [VISITA EM LOJA]"); as Smart de ago–set (~R$ 1.350 em set) estão pausadas |
| Venda medida vinda do Google | 1 confirmada (+1 provável) em 30 dias (ROAS 0,79 a 3,5) | 3 vendas em set e 5 em out com origem `google_ads` no sistema |

## 1. Quem fica com cada busca (decisão do Daniel, 11/11/2026: por intenção)

| Grupo de busca | Dono | A outra conta |
|---|---|---|
| Preço, promoção, "barato", "popular", "R$ 250", "custo benefício", "óculos de grau preço" | **4 Olhos** | Armazém negativa (exceto "ótica popular", que já tem regra própria lá; decidir caso a caso) |
| Florianópolis Centro / ilha ("ótica centro florianópolis", "ótica Florianópolis") | **4 Olhos** (loja do Centro) | Armazém não anuncia na ilha |
| Multifocal "a partir de R$ 499" (preço) | **4 Olhos** | Armazém negativa "multifocal preço/barato" |
| ZEISS, Varilux e marca premium de lente; multifocal sem preço | **Armazém** | 4 Olhos negativa "zeiss" e "varilux" nas campanhas de busca |
| Urgência ("pronto hoje", "na hora", "24 horas", "1 dia") | **Armazém** | 4 Olhos negativa |
| Leitura pronta | **Armazém** | 4 Olhos negativa |
| "Ótica + bairro / perto de mim / aberta agora" em São José, Palhoça, Biguaçu, Kobrasol, Campinas | **Armazém** (campanha que já converte) | 4 Olhos não anuncia com essas palavras nessas cidades |
| Marca da outra empresa | — | já negativada nas duas (lista de concorrentes) |
| Concorrentes | ninguém | lista compartilhada (`concorrentes.json`) |

**O que o volume diz (Planejador, Grande Florianópolis, média mensal, 11/11/2026):** "ótica perto de mim" 260; "ótica
centro florianópolis" e variações ~180 somadas; "lente zeiss" 110; "óculos multifocal" 70+70; "ótica são josé" ~250
somadas; "ótica barata", "óculos de grau barato", "óculos de grau preço" ~10 cada. Ou seja, **busca local por preço é
pequena**: a fatia da 4 Olhos no Google local é sobretudo Florianópolis/Centro; preço rende mais como argumento no
anúncio do que como palavra-chave. Venda pelo site (Brasil) fica fora deste plano (foco da 4 Olhos no Google: loja física,
decisão de 11/11).

Aplicar a divisão = negativas por fatia em cada conta, uma proposta por conta, pelo fluxo da skill. A 4 Olhos hoje
tem palavras que são do Armazém ("óculos pronto na hora/em 24h/urgente", "lentes zeiss", "ótica são josé"): sair delas
faz parte da proposta.

**Marca no orgânico (Search Console, 11/11/2026):** a 4 Olhos já é a 1ª posição grátis para a própria marca ("4 olhos",
"4olhos", "ótica 4 olhos": ~480 cliques orgânicos em 90 dias). Não pagar por busca da própria marca em nenhuma das
duas contas, a menos que um concorrente passe a anunciar nela. Já "ótica + cidade/Camelão" quase não traz clique
orgânico: é onde o pago faz diferença.

## 2. Verba pelo retorno (decisão do Daniel, 11/11/2026)

Nenhuma conta tem verba fixa: começa baixo e sobe só onde o custo por venda paga.

- **Custo máximo por venda** = ticket × parte do ticket que o Daniel aceita gastar em anúncio.
  - **4 Olhos: até 40% do ticket** (decisão do Daniel, 11/11/2026) → ~R$ 340 × 40% = **~R$ 136 por venda**.
  - **Armazém: 15% do ticket (provisório, falta o Daniel definir)** → ~R$ 990 × 15% = ~R$ 150 por venda.
- **Custo máximo por contato** = custo máximo por venda × taxa contato→venda medida de cada empresa (enquanto não houver
  medida, usar 1 venda a cada 4 contatos → 4 Olhos ~R$ 34, Armazém ~R$ 37). Com os 40%, as duas aguentam um custo por
  contato parecido; a divisão das buscas (seção 1) é o que impede que essa folga vire leilão entre as duas.
- Recalcular os tetos quando o ticket médio mudar (4 Olhos: `origem_marketing`/O.S. no sistema; Armazém: SSÓtica).
- **Subir**: +20% por semana na campanha que ficou abaixo do teto por 2 semanas seguidas, com pelo menos 10 contatos.
- **Cortar ou pausar**: só com dado suficiente (≥ 30 cliques ou o teto de custo gasto 2 vezes sem venda) e nunca por uma
  métrica só (regra das duas skills).
- **Teto técnico** continua sendo o `GOOGLE_ADS_TETO_DIARIO` de cada CLI (R$ 50/dia por campanha).

## 3. Medição: o que conta como resultado

- **Rota no Maps, visita ao site e "outros engajamentos" não são venda.** As conversões das Smart da 4 Olhos eram quase
  todas rotas (141 de 149 principais): não servem para comparar com o Armazém.
- **Contato real**: WhatsApp/ligação/formulário. **Venda**: O.S. com origem no Google.
- Armazém: já cruza contato novo × clique pelo horário e manda a venda de volta ao Google (conversão offline).
- 4 Olhos, para ter o mesmo nível: (a) marcar `origem_marketing = google_ads` com consistência no CRM/wizard (hoje só
  3–5 vendas/mês aparecem); (b) trazer o cruzamento "contatos novos × cliques" do Ariel; (c) conversão offline pela Data
  Manager, como fase seguinte. Até lá, comparar as duas contas por custo por contato, não por ROAS.

## 4. Fila de experimentos (cada um com revisão marcada no diário da conta)

**4 Olhos**
1. Campanha de pesquisa **Centro Florianópolis** (raio da loja do Centro, ótica centro/florianópolis, anúncio com R$ 250
   e o endereço), no lugar da Smart. Critério: custo por contato ≤ R$ 34 em 2 semanas (teto de 40% do ticket).
2. Tirar da "[ASTER] [VISITA EM LOJA]" as palavras que são do Armazém e trocar o objetivo de rota por contato.
3. Lista de concorrentes: revisão em 25/11 (E1 do diário).

**Armazém**
1. Manter Bairro como base; negativar preço/barato onde não há campanha de preço.
2. Isolar **ZEISS/multifocal** num grupo ou campanha própria com anúncio de ZEISS (110 + 140 buscas/mês na região), já
   que é a busca de ticket alto que só ele atende bem.
3. Urgência e Leitura seguem com os critérios do diário dele.

## 5. Rotina

- **Revisão semanal conjunta** (uma sessão olha as duas contas): termos de pesquisa das duas pela lista de concorrentes
  (`concorrentes.py termos`), quem está invadindo a fatia da outra, custo por contato/venda contra o teto, foto semanal
  nos dois diários e aprendizado geral em `aprendizados-comuns.md`.
- **Volume de busca**: pelo Planejador do Armazém (acesso Basic), que vale para as duas porque é dado da região:
  `cd ~/Desktop/ariel/backend && venv/bin/python scripts/google_ads_volumes.py "semente" ... --regiao grande-floripa`.
- **Orgânico**: Search Console e GA4 de cada site (`google_dados_cli.py` nos dois repos) antes de pagar por uma busca em
  que o site já está no topo.
