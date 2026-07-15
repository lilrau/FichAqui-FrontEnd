# FichAqui Frontend

App de pedidos para festas juninas e eventos similares. Consumidores compram itens de barracas; cada compra gera fichas para retirada no local.

## Language

**Carteira**:
Saldo pré-pago do Consumidor na plataforma, usado para pagamentos no evento. Pode incluir cartões salvos para cobrança — referências tokenizadas (Mercado Pago), nunca PAN completo. O Consumidor pode **cadastrar cartão** em fluxo dedicado (sem Pedido) ou optar por salvar após pagamento no checkout.
_Avoid_: Wallet, conta

**Recarga**:
Crédito adicionado ao saldo da Carteira via Mercado Pago (PIX ou cartão), em fluxo dedicado — separado do checkout de um Pedido. Confirmação assíncrona (PIX) segue a mesma regra de polling de pagamento pendente.
_Avoid_: Top-up, depósito, add funds

**Consumidor**:
Pessoa autenticada que compra no evento — navega o Cardápio do Evento, faz Pedidos e retira Fichas nas Barracas. Perfil com nome e telefone editáveis via API; e-mail, CPF e data de nascimento somente leitura.
_Avoid_: Cliente, client, user

**Organizador**:
Pessoa que cria e gerencia Eventos, Barracas e Ofertas. Pode também ser Consumidor no mesmo login.
_Avoid_: Admin (no sentido de operador de barraca), owner

**Evento**:
Uma festa ou evento com cardápio, barracas e pedidos próprios.
_Avoid_: Festa, show

**Cidade**:
Município onde Eventos são listados e filtrados na plataforma. Lista mantida pelo backend (`GET /api/cities`); o consumidor escolhe uma Cidade para ver Eventos da região.
_Avoid_: City, região, localidade

**Barraca**:
Um ponto de venda físico dentro de um evento, operado por um responsável. Pode estar aberta ou fechada; Barracas fechadas não aparecem para o consumidor.
_Avoid_: Loja, vendor, stall

**Produto**:
Definição compartilhada de um item do cardápio — nome, descrição, imagem e categoria. Catálogo pré-definido pelo backend; o organizador não cria produtos. A imagem vem da API (URL); se indisponível ou com erro de carregamento, o front exibe emoji genérico de fallback — não catálogo local.
_Avoid_: Item, SKU

**Catálogo Global**:
Lista pré-definida de Produtos mantida pelo backend. Fonte única de identidade (nome, foto, descrição, categoria) e variantes sugeridas de cada Produto.
_Avoid_: Menu master, cardápio base

**Variante**:
Uma opção comprável dentro de uma Oferta (ex.: Pastel de Carne, Copo 300ml). Pertence à Oferta, não ao Produto diretamente. Os rótulos vêm da lista pré-definida do Produto no Catálogo Global; o organizador ativa quais variantes oferece e define o preço de cada uma.
_Avoid_: SKU, option

**Oferta**:
A disponibilidade de um Produto em uma Barraca específica, com variantes ativas, preços e estoque próprios. O organizador monta Ofertas na Configuração de Barraca.
_Avoid_: Listing, anúncio

**Pedido**:
Uma compra do consumidor, podendo conter itens de Barracas diferentes no mesmo pedido. Gera Fichas conforme confirmação do pagamento (ver regra por meio abaixo). Pagamento recusado ou expirado gera Pedido registrado para auditoria, **sem** Fichas (ex.: status de falha de pagamento).
_Avoid_: Order, compra

**Pagamento**:
Cobrança de um Pedido. Meios: saldo da Carteira, cartão (Mercado Pago) ou PIX (Mercado Pago). A confirmação determina quando as Fichas ficam disponíveis. Cartão novo pode ser **salvo na Carteira** apenas com opt-in explícito do Consumidor após pagamento aprovado.
_Avoid_: Payment, cobrança, checkout

**Ficha**:
Comprovante de retirada de uma unidade comprada. Vinculada à Barraca da Oferta escolhida. Cada unidade comprada gera uma Ficha com QR próprio; o status passa a entregue na Retirada.

**Disponibilidade da Ficha (por meio de pagamento):**
- **Carteira:** imediata — saldo já está na plataforma.
- **Cartão (MP):** imediata quando o pagamento retorna `approved` na mesma requisição. Se `rejected`, Pedido fica registrado em falha, sem Fichas.
- **PIX (MP):** somente após `approved` (webhook); enquanto pendente, o Pedido existe mas **sem** Fichas. PIX expirado ou rejeitado → Pedido em falha (estado terminal), sem Fichas.

_Avoid_: Ticket, voucher, QR

**Retirada**:
O momento em que o consumidor apresenta a Ficha na Barraca e recebe o item. A confirmação é automática (backend), não manual pelo admin.
_Avoid_: Entrega, delivery, confirmar entrega

**Atendente**:
Pessoa com acesso à Barraca que executa a Retirada — lê o QR da Ficha e confirma no backend. Opera em `/retirada` (mobile-first); sua Barraca vem do perfil autenticado, não escolhida na UI.
_Avoid_: stall_manager (em copy de produto), operador, scanner

**Painel de Pedidos**:
Tela do admin para monitoramento e auditoria de pedidos e fichas. Somente leitura — sem ações manuais de confirmação.
_Avoid_: Gestão de entregas, fila de preparo

**Relatório do Evento**:
Visão agregada de vendas do Evento para o Organizador — receita, quantidade de Pedidos, ticket médio, vendas por hora/categoria e produtos mais vendidos. Derivado de Pedidos reais; não inclui contagem de visitantes físicos.
_Avoid_: Analytics, dashboard, visitantes

**Cardápio do Evento**:
Visão do consumidor com todos os Produtos que possuem ao menos uma Oferta ativa em Barraca aberta no evento. Um card por Produto. Quando há preços diferentes entre Barracas, o card mostra "A partir de R$ X".
_Avoid_: Menu, cardápio completo

**Configuração de Barraca**:
Tela do admin onde o organizador gerencia uma Barraca e suas Ofertas — seleciona Produtos do Catálogo Global e define variantes e preços.
_Avoid_: Gestão de cardápio, menu editor
