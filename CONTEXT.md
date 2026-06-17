# Event App

App de pedidos para festas juninas e eventos similares. Consumidores compram itens de barracas; cada compra gera fichas para retirada no local.

## Language

**Evento**:
Uma festa ou evento com cardápio, barracas e pedidos próprios.
_Avoid_: Festa, show

**Barraca**:
Um ponto de venda físico dentro de um evento, operado por um responsável. Pode estar aberta ou fechada; Barracas fechadas não aparecem para o consumidor.
_Avoid_: Loja, vendor, stall

**Produto**:
Definição compartilhada de um item do cardápio — nome, descrição, imagem e categoria. Catálogo pré-definido pelo backend; o organizador não cria produtos.
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
Uma compra do consumidor, podendo conter itens de Barracas diferentes no mesmo pedido. Gera uma ou mais Fichas, já disponíveis para retirada imediatamente após a compra.
_Avoid_: Order, compra

**Ficha**:
Comprovante de retirada de uma unidade comprada. Vinculada à Barraca da Oferta escolhida. Fica disponível para retirada assim que o Pedido é criado — não há tempo de espera nem preparo. No protótipo mock, o status permanece sempre disponível até o backend existir.
_Avoid_: Ticket, voucher, QR

**Retirada**:
O momento em que o consumidor apresenta a Ficha na Barraca e recebe o item. A confirmação é automática (backend), não manual pelo admin.
_Avoid_: Entrega, delivery, confirmar entrega

**Painel de Pedidos**:
Tela do admin para monitoramento e auditoria de pedidos e fichas. Somente leitura — sem ações manuais de confirmação.
_Avoid_: Gestão de entregas, fila de preparo

**Cardápio do Evento**:
Visão do consumidor com todos os Produtos que possuem ao menos uma Oferta ativa em Barraca aberta no evento. Um card por Produto. Quando há preços diferentes entre Barracas, o card mostra "A partir de R$ X".
_Avoid_: Menu, cardápio completo

**Configuração de Barraca**:
Tela do admin onde o organizador gerencia uma Barraca e suas Ofertas — seleciona Produtos do Catálogo Global e define variantes e preços.
_Avoid_: Gestão de cardápio, menu editor
