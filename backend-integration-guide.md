# Guia de Integração Frontend/Backend (API & DTOs)

Este documento é um guia para alinhar o **Swagger OpenAPI** atualmente definido com as estruturas (`DTOs`) e regras de domínio implementadas no Frontend. Ele ajudará o dev Backend (Laravel + Inertia / API REST) a fechar qualquer _gap_ entre o que o banco tem e o que o UI espera.

---

## 1. Glossário e Nomenclatura (Domain Driven) 📖

Segundo o nosso `CONTEXT.md`, os termos cruciais são:

*   **Produto (Catálogo Global)**: O cadastro base (Ex: Pastel, Refrigerante) contendo nome, imagem, descrição. O organizador do evento **não cria** produtos.
*   **Oferta (`Offering`)**: É a união de um **Produto** dentro de uma **Barraca** (`Stall`). A Oferta possui um preço e um status de disponibilidade.
*   **Variante (`OfferingVariant`)**: As opções da oferta (ex: "Carne", "Queijo", "Copo 300ml").
*   **Ficha**: A unidade de retirada gerada com um Pedido. Se o Pedido tem `quantity: 3`, o sistema gera **3 fichas**, pois cada uma representa a retirada em uma barraca.

*(Importante: No Front-end, tipos como `MenuProduct` e `MenuVariant` foram marcados como **@deprecated**, sendo substituídos pela composição de `CatalogProduct + Offering`).*

---

## 2. Endpoints e DTOs Recomendados 🛠️

### 2.1 Bootstrap & Catálogo Global
No endpoint `GET /api/bootstrap` ou criando uma nova rota `GET /api/catalog`, o backend deve carregar o "Catálogo Global". As "Categorias" também podem vir aqui.

**DTO de um `CatalogProduct`** (esperado pelo TS do frontend):
```json
{
  "id": "prod-1",
  "name": "Pastel",
  "description": "Pastel frito na hora",
  "category": "comidas",
  "image": "url-da-imagem",
  "badge": "Novo",
  "variantTemplates": [
    { "id": "var-tmpl-carne", "label": "Carne" },
    { "id": "var-tmpl-queijo", "label": "Queijo" }
  ]
}
```

### 2.2 Eventos (Events)
`GET /api/events` e `GET /api/events/{id}`

O Frontend usa a interface `Event`. Para o Laravel Resource mapear da melhor forma, o JSON esperado é:
```json
{
  "id": "evt-123",
  "name": "Festa Junina Teste",
  "description": "A melhor festa",
  "date": "2024-06-24",
  "startTime": "18:00",
  "endTime": "02:00",
  "location": "Praça Central",
  "cityId": "sp-sp",
  "organizerId": "org-1",
  "banner": "url-imagem...",
  "status": "published", // Opções: draft, published, active, finished
  "capacity": 500,
  "primaryColor": "#D93B3B" // O UI reflete a cor primária do evento
}
```

### 2.3 Barracas (Stalls)
`GET /api/events/{eventId}/stalls`

O Frontend lista e configura as barracas. (No Swagger tá "Listar barracas / Atualizar").
**DTO `Stall`**:
```json
{
  "id": "stall-1",
  "eventId": "evt-123",
  "name": "Barraca do Pastel",
  "category": "comidas",
  "responsible": "Nome do Responsável",
  "color": "yellow", // para pílulas e tags do tema
  "status": "open", // open ou closed (frontend oculta as closed do usuário)
  "stock": 100
}
```

### 2.4 Cardápio da Barraca / Ofertas
`GET /api/events/{eventId}/menu-products` ⚠️ *(Considerar mudar nome para /offerings ou usar esse mapeamento)*

A resposta não deve ser apenas uma lista de "produtos" crus, mas também qual é o preço daquele produto *naquela barraca*.
**DTO `Offering`**:
```json
[
  {
    "id": "offering-1",
    "eventId": "evt-123",
    "stallId": "stall-1",
    "productId": "prod-1", // Relaciona com o Catálogo Global
    "available": true,
    "variants": [
      {
        "templateId": "var-tmpl-carne",
        "price": 8.00,
        "available": true,
        "badge": "Últimos"
      }
    ]
  }
]
```

### 2.5 Pedidos (Orders) e Fichas
`POST /api/events/{eventId}/pedidos`

**Request:** O Front manda as referências da *Offering* (Oferta de uma barraca) e da *Variante*.
```json
{
  "items": [
    {
      "offeringId": "offering-1",
      "variantId": "var-tmpl-carne",
      "quantity": 2
    }
  ],
  "paymentMethod": "credit_card",
  "cardId": "uuid-opicional-do-cartao-salvo"
}
```

**Response (Order e Geração de Fichas Automática!!):**  
Uma regra core no **Event App** é que quando 1 Pedido é criado, logo que ele cai como `available` ou "pago", **Fichas são geradas por unidade automaticamente**. Não há tempo de preparo. (Um pedido de 2 pastéis = 2 itens na tabela de Fichas).

**DTO `Order` + `Ficha`**:
```json
{
  "id": "order-123",
  "eventId": "evt-123",
  "number": "5432", 
  "status": "available", // available, delivered
  "total": 16.00,
  "createdAt": "2024-06-24T18:30:00Z",
  "qrCode": "QR-PEDIDO-PAI-123",
  "items": [
      // array pro historico do pedido
  ],
  "fichas": [
    {
      "id": "ficha-1A",
      "orderId": "order-123",
      "itemName": "Pastel — Carne", // (Produto + Variante)
      "itemImage": "url...",
      "stallId": "stall-1",
      "stallName": "Barraca do Pastel",
      "qrCode": "QR-UNICO-FICHA-1A",
      "status": "available"
    },
    {
      "id": "ficha-1B",
      "orderId": "order-123",
      "itemName": "Pastel — Carne",
      "itemImage": "url...",
      "stallId": "stall-1",
      "stallName": "Barraca do Pastel",
      "qrCode": "QR-UNICO-FICHA-1B",
      "status": "available"
    }
  ]
}
```

### 2.6 Retirada de Fichas
`PATCH /api/pedidos/{pedidoId}/status` no Swagger.
*Importante*: O Frontend interage com a entidade `Ficha`. Se o usuário apresenta 1 Ficha de pastel na barraca, apenas aquele "qrcode" de ficha se consome.
**Sugestão ao Dev Backend:**
Adicionar uma rota: `PATCH /api/fichas/{fichaId}/status` ou `POST /api/fichas/{fichaId}/consume` para marcar uma ficha individual como `delivered` (já consumida). Uma vez que as fichas de um order estão `delivered`, o *Order* inteiro fica `delivered`.

---

**Resumo de Ajustes no Back para o Dev de Laravel**:
1. Abstrair *MenuItems/MenuProducts* para a relação composta: `Products (Global) + Offerings (Barraca)`.
2. O "Carrinho" envia os identificadores da "Offering", e o back valida o preço. O Back deve gerar registros de `Fichas` proporcionais às quantidades.
3. Se os dados de Evento e Barracas puderem seguir as chaves como *startTime*, *capacity*, *primaryColor* e *responsible*, a interface em React irá processar perfeitamente sem modificações no UI.