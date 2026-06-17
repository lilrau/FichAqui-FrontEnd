# Documentação Completa da API (Frontend/Backend)

Este guia define a especificação completa de **rotas e DTOs** (Data Transfer Objects) que o frontend (React) espera consumir do backend (Laravel + Inertia/API). O Swagger atual serve de base, mas este documento estende as rotas necessárias para cobrir todo o ciclo de vida do domínio, desde a autenticação até o consumo individual de fichas na barraca.

---

## 1. Glossário e Nomenclatura (Domain Driven) 📖

Segundo nosso \`CONTEXT.md\`:
*   **Produto (Catálogo Global)**: Cadastro base mantido pela plataforma (nome, imagem, categoria). O organizador do evento *não* cria produtos, apenas os seleciona.
*   **Oferta (\`Offering\`)**: A precificação e disponibilização de um Produto dentro de uma **Barraca** (\`Stall\`). Uma oferta possui preço, disponibilidade e estoque.
*   **Variante (\`OfferingVariant\`)**: Variações da oferta baseadas em templates (ex: "Carne", "Queijo").
*   **Ficha**: Unidade individual de retirada gerada com um Pedido. Se o Pedido (Order) tem \`quantity: 3\`, gera **3 fichas**, permitindo ao usuário retirar cada item independentemente.

---

## 2. Autenticação e Perfil do Usuário 👤

### 2.1 \`POST /api/auth/login\`
Espera credenciais e retorna o token de acesso (Laravel Sanctum) e os dados base do usuário.

### 2.2 \`GET /api/auth/me\`
Retorna o perfil do usuário logado.
\`\`\`json
{
  "id": "user-1",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "role": "consumer" // ou 'admin', 'organizer', 'stall_manager'
}
\`\`\`

### 2.3 \`GET /api/user/wallet\`
Retorna os dados financeiros do usuário: saldo na carteira e cartões salvos.
\`\`\`json
{
  "balance": 46.00,
  "savedCards": [
    {
      "id": "card-1",
      "brand": "visa",
      "lastFour": "4242",
      "holderName": "Maria Silva",
      "isDefault": true
    }
  ]
}
\`\`\`

---

## 3. Bootstrap e Catálogo Global 🌍

### 3.1 \`GET /api/bootstrap\` (ou \`/api/catalog\`)
Rota pública para carregar dados iniciais essenciais para o frontend.
\`\`\`json
{
  "categories": [
    { "id": "comidas", "name": "Comidas", "icon": "Burger", "color": "#FC9E4F" }
  ],
  "catalogProducts": [
    {
      "id": "prod-1",
      "name": "Pastel",
      "description": "Pastel frito na hora",
      "category": "comidas",
      "image": "/images/pastel.png",
      "variantTemplates": [
        { "id": "var-carne", "label": "Carne" },
        { "id": "var-queijo", "label": "Queijo" }
      ]
    }
  ]
}
\`\`\`

---

## 4. Eventos (\`Event\`) 🎪

### 4.1 \`GET /api/events\`
Retorna a lista de eventos. No front, consumidores usam para ver os eventos ativos.
\`\`\`json
[
  {
    "id": "evt-123",
    "name": "Festa Junina Teste",
    "date": "2024-06-24",
    "startTime": "18:00",
    "endTime": "02:00",
    "location": "Praça Central",
    "cityId": "sp-sp",
    "organizerId": "org-1",
    "banner": "url-imagem...",
    "status": "published",
    "capacity": 500,
    "primaryColor": "#D93B3B"
  }
]
\`\`\`

### 4.2 \`GET /api/events/{eventId}\`
Retorna todos os detalhes de um evento específico (mesmo DTO do objeto individual acima).

### 4.3 Gestão Admin de Eventos
*   \`POST /api/events\`: Criar novo evento.
*   \`PATCH /api/events/{eventId}\`: Atualizar propriedades do evento.

---

## 5. Barracas (\`Stalls\`) 🏪

### 5.1 \`GET /api/events/{eventId}/stalls\`
Retorna as barracas de um evento. O front-end oculta barracas com \`status: closed\` para o consumidor.
\`\`\`json
[
  {
    "id": "stall-1",
    "eventId": "evt-123",
    "name": "Barraca do Pastel",
    "category": "comidas",
    "responsible": "João das Neves",
    "color": "yellow",
    "status": "open",
    "stock": 100
  }
]
\`\`\`

### 5.2 Gestão Admin de Barracas
*   \`POST /api/events/{eventId}/stalls\`: Organizar nova barraca.
*   \`PATCH /api/events/{eventId}/stalls/{stallId}\`: Abrir, fechar ou mudar responsável da barraca.

---

## 6. Cardápio e Ofertas (\`Offerings\`) 🍔

### 6.1 \`GET /api/events/{eventId}/offerings\` (Antigo menu-products)
O frontend precisa cruzar o \`productId\` das Ofertas com o Catálogo Global. Esta rota traz preços e disponibilidade exclusivos daquela barraca no evento.
\`\`\`json
[
  {
    "id": "offering-1",
    "eventId": "evt-123",
    "stallId": "stall-1",
    "productId": "prod-1", 
    "available": true,
    "variants": [
      {
        "templateId": "var-carne",
        "price": 8.00,
        "available": true
      }
    ]
  }
]
\`\`\`

### 6.2 \`PUT /api/events/{eventId}/stalls/{stallId}/offerings\` (Admin)
Salva o cardápio que a barraca está oferecendo. Recebe um Array de Ofertas (Offerings).

---

## 7. Pedidos (\`Orders\`) e Fichas individuais 🎟️

### 7.1 \`POST /api/events/{eventId}/pedidos\` (Checkout Consumidor)
O consumidor cria um pedido informando **apenas a Oferta e Variante** e método de pagamento.
**Request:**
\`\`\`json
{
  "items": [
    {
      "offeringId": "offering-1",
      "variantId": "var-carne",
      "quantity": 2
    }
  ],
  "paymentMethod": "credit_card",
  "cardId": "card-1" // null se for pix/pix_code
}
\`\`\`

**Response:**
O backend processa e já retorna o Pedido acompanhado do **Array de Fichas** (2 fichas neste caso).
\`\`\`json
{
  "id": "order-1",
  "eventId": "evt-123",
  "number": "5432", 
  "status": "available",
  "total": 16.00,
  "createdAt": "2024-06-24T18:30:00Z",
  "qrCode": "QR-PEDIDO-PAI-123",
  "items": [
     // Resumo de items para o histórico do pedido
     { "name": "Pastel — Carne", "quantity": 2, "stallName": "Barraca do Pastel" }
  ],
  "fichas": [
    {
      "id": "ficha-1A",
      "orderId": "order-1",
      "itemName": "Pastel — Carne",
      "itemImage": "/images/pastel.png",
      "stallId": "stall-1",
      "stallName": "Barraca do Pastel",
      "qrCode": "QR-UNICO-FICHA-1A",
      "status": "available"
    },
    {
      "id": "ficha-1B",
      "orderId": "order-1",
      "itemName": "Pastel — Carne",
      "itemImage": "/images/pastel.png",
      "stallId": "stall-1",
      "stallName": "Barraca do Pastel",
      "qrCode": "QR-UNICO-FICHA-1B",
      "status": "available"
    }
  ]
}
\`\`\`

### 7.2 \`GET /api/user/pedidos\` (Histórico do Consumidor)
Retorna todos os pedidos daquele usuário (DTO similar à raiz de Order, podendo omitir as fichas dependendo do nível de detalhe desejado na UI).

### 7.3 \`GET /api/user/fichas\` (Fichas do Consumidor)
Retorna **todas as fichas ativas (available)** do usuário. É isso que preenche a página "Minha Carteira" > Aba Fichas.

### 7.4 \`GET /api/events/{eventId}/pedidos\` (Painel Admin)
Usado pelo painel gerencial do evento para lista geral de todos os pedidos já feitos. Visão somente leitura de auditoria.

### 7.5 \`PATCH /api/fichas/{fichaId}/status\` ou \`POST /api/fichas/{fichaId}/consume\`
Rota hiper-crítica. Em um momento de Retirada na barraquinha de pastel, o atendente faz a leitura do \`qrCode\` de APENAS 1 ficha.
Essa rota marca SOMENTE ESSA FICHA como \`delivered\`.

**Regra Core do Back-End:**
Sempre que uma ficha muda para \`delivered\`, o banco checa se **todas as fichas correspondentes àquele \`orderId\`** também estão \`delivered\`. Se sim, a coluna \`status\` da tabela \`orders\` também muda automaticamente para \`delivered\`.
