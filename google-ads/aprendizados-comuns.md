# Google Ads — aprendizados que valem para as duas contas

O que uma conta descobriu e não depende dela: comportamento do Google, da API, critérios de análise. O que é da conta
(números, campanhas, experimentos) fica no diário de cada projeto (ver README). Ao aprender algo geral numa das contas,
escrever aqui com data e de qual conta veio.

Ideias de skills da comunidade (classificação de termos, investigação por hipóteses, checagem de saúde da conta):
`ariel/.claude/skills/google-ads/referencias/ideias-da-comunidade.md`.

## Negativas

| Data | Conta | Aprendizado |
|---|---|---|
| 27/10/2026 | Ariel | A negativa **não pega variação**: "ótica mondadori" na lista e "otica mondadori" passou. Sempre com e sem acento. |
| 11/11/2026 | 4 Olhos | Também não pega **"óptica/optica"** ("optica luna" passou por "otica luna") nem **singular/plural** ("hospital do oculos" × "dos"). |
| 03/11/2026 | Ariel | Negativa de frase antiga numa campanha pode **bloquear um grupo novo inteiro** ("quanto tempo demora" barrou as 9 palavras do grupo novo). Conferir negativas da campanha e das listas antes de criar grupo. |
| 06/11/2026 | Ariel | Cuidado com a forma: "ótica mais" bloquearia "ótica mais próxima"; "cristal" solto bloquearia "lente cristal"; "catarina" solto bloquearia Santa Catarina. Palavra comum só como "ótica X". |
| 05/11/2026 | Ariel | Sub-marca de lente que vendemos não é negativa (Nulux = Hoya, Transitions/Varilux/Crizal = Essilor). Característica de lente ("que não arranha", antirreflexo) também é produto. |
| 11/11/2026 | 4 Olhos | **Lista de negativas da conta pela API**: criar o `shared_set` do tipo `ACCOUNT_LEVEL_NEGATIVE_KEYWORDS` **e** ligá-lo à conta com um `customer_negative_criterion` (`negative_keyword_list.shared_set`). Sem o vínculo a lista existe mas a tela diz "você não tem palavras-chave negativas". Na CLI da 4 Olhos: `lista-negativa-criar --da-conta` (já liga) e `lista-negativa-ligar-conta ID`. Limite: 1.000 termos. |

## Concorrentes na região

| Data | Conta | Aprendizado |
|---|---|---|
| 11/11/2026 | 4 Olhos | Em 90 dias, **~30% do gasto da 4 Olhos** (R$ 31 de ~R$ 104) foi em busca por concorrente (Mondadori R$ 9,64, Mercadão dos Óculos R$ 7,70, Rio Branco R$ 5,59, Família Urso, 99 Óticas, Carol), e 2 das 5 conversões com termo visível vieram dessas buscas (provavelmente gente atrás do endereço do concorrente). A conta não tinha negativa nenhuma. A lista do Ariel já cobria quase todos os nomes; faltavam Klins, Sidy, "nine nine" (99), "sunhut", "hospital do oculos" e "optica luna", que entraram na lista compartilhada. |
| 27/10/2026 | Ariel | Concorrentes mais buscados na região: Mondadori, Mercadão dos Óculos, Carol, Diniz, Chilli Beans, 99 Óticas, Família Urso, Ferri. |

## Conta, API e medição

| Data | Conta | Aprendizado |
|---|---|---|
| 09/09/2026 | ambas | Developer token aposentado: o acesso à API é do **projeto do Google Cloud** dono do OAuth (nível Explorer sai na hora e já permite alterar). |
| 23/10/2026 | Ariel | Desde set/2026 o Google recusa **idioma manual** em campanha de Pesquisa (`OPERATION_NOT_PERMITTED_FOR_CONTEXT`). Smart campaign não pode mais ser criada pela API (23/09/2026). |
| 26/10/2026 | Ariel | O **Planejador subestima muito** volume em região pequena: serve para comparar termos, não para prever. |
| 30/10/2026 | Ariel | A maior parte dos cliques de campanha local vai para a **ficha no Maps** (`click_type = LOCATION_EXPANSION`), não para a página: o contato que sai dali não passa pela tag. Avaliar por todas as conversões + cliques no Maps + contatos reais. |
| 30/10/2026 | Ariel | O botão de WhatsApp da ficha do Google só aceita `wa.me` e descarta o texto pronto. |
| 11/11/2026 | 4 Olhos | A conta 883-973-9166 ("4 Olhos") é **gerente**; os anúncios rodam na 551-027-1145. Na API: `customer_id` = conta de anúncios, `login_customer_id` = gerente. |
