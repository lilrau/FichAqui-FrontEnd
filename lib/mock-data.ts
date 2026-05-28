// Tipos
export interface MenuVariant {
  id: string;
  label: string;
  price: number;
  available: boolean;
  badge?: string;
}

export interface MenuProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  badge?: string;
  available: boolean;
  stallId: string;
  variants: MenuVariant[];
}

export interface MenuItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  badge?: string;
  available: boolean;
  stallId: string;
  variantLabel?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Stall {
  id: string;
  name: string;
  category: string;
  responsible: string;
  color: string;
  status: 'open' | 'closed';
  stock: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface Order {
  id: string;
  number: string;
  items: { item: MenuItem; quantity: number }[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  qrCode: string;
}

export interface Ficha {
  id: string;
  orderId: string;
  itemName: string;
  itemImage: string;
  stallId: string;
  qrCode: string;
  status: OrderStatus;
}

export function getFichasFromOrder(order: Order): Ficha[] {
  return order.items.map((cartItem, index) => ({
    id: `${order.id}-ficha-${index}`,
    orderId: order.id,
    itemName: cartItem.item.name,
    itemImage: cartItem.item.image,
    stallId: cartItem.item.stallId,
    qrCode: `${order.qrCode}-${cartItem.item.id}`,
    status: order.status,
  }));
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  banner: string;
  status: 'draft' | 'published' | 'active' | 'finished';
  capacity: number;
  primaryColor: string;
}

// Dados mockados
export const currentEvent: Event = {
  id: '1',
  name: 'Festa de São João',
  description: 'A maior festa junina da comunidade! Venha celebrar com comidas típicas, jogos e muita diversão.',
  date: '2026-06-24',
  startTime: '18:00',
  endTime: '23:00',
  location: 'Paróquia São João Batista',
  banner: '/festa-banner.jpg',
  status: 'active',
  capacity: 500,
  primaryColor: '#d97706',
};

export const categories: Category[] = [
  { id: 'comidas', name: 'Comidas', icon: 'UtensilsCrossed', color: '#ef4444' },
  { id: 'doces', name: 'Doces', icon: 'Candy', color: '#ec4899' },
  { id: 'bebidas', name: 'Bebidas', icon: 'GlassWater', color: '#3b82f6' },
  { id: 'jogos', name: 'Jogos', icon: 'Gamepad2', color: '#22c55e' },
  { id: 'brincadeiras', name: 'Brincadeiras', icon: 'PartyPopper', color: '#f59e0b' },
];

export const stalls: Stall[] = [
  { id: 'stall-1', name: 'Barraca do Pastel', category: 'comidas', responsible: 'Maria Silva', color: '#ef4444', status: 'open', stock: 150 },
  { id: 'stall-2', name: 'Barraca do Milho', category: 'comidas', responsible: 'João Santos', color: '#f59e0b', status: 'open', stock: 200 },
  { id: 'stall-3', name: 'Doces da Vovó', category: 'doces', responsible: 'Ana Costa', color: '#ec4899', status: 'open', stock: 100 },
  { id: 'stall-4', name: 'Cantinho das Bebidas', category: 'bebidas', responsible: 'Pedro Lima', color: '#3b82f6', status: 'open', stock: 300 },
  { id: 'stall-5', name: 'Pescaria', category: 'jogos', responsible: 'Carlos Oliveira', color: '#22c55e', status: 'open', stock: 50 },
  { id: 'stall-6', name: 'Bingo', category: 'brincadeiras', responsible: 'Lucia Ferreira', color: '#8b5cf6', status: 'open', stock: 100 },
  { id: 'stall-7', name: 'Correio Elegante', category: 'brincadeiras', responsible: 'Fernanda Rocha', color: '#f43f5e', status: 'open', stock: 200 },
];

export const menuProducts: MenuProduct[] = [
  {
    id: 'pastel',
    name: 'Pastel',
    description: 'Pastel crocante frito na hora, recheado à sua escolha',
    category: 'comidas',
    image: '🥟',
    badge: 'Mais vendido',
    available: true,
    stallId: 'stall-1',
    variants: [
      { id: 'pastel-carne', label: 'Carne', price: 8.0, available: true, badge: 'Mais vendido' },
      { id: 'pastel-queijo', label: 'Queijo', price: 7.0, available: true },
    ],
  },
  {
    id: 'milho-verde',
    name: 'Milho Verde',
    description: 'Espiga de milho fresquinho com manteiga',
    category: 'comidas',
    image: '🌽',
    badge: 'Tradicional',
    available: true,
    stallId: 'stall-2',
    variants: [{ id: 'milho-verde-unidade', label: 'Unidade', price: 6.0, available: true }],
  },
  {
    id: 'cachorro-quente',
    name: 'Cachorro Quente',
    description: 'Pão, salsicha, molho, batata palha e muito mais',
    category: 'comidas',
    image: '🌭',
    available: true,
    stallId: 'stall-2',
    variants: [{ id: 'cachorro-quente-unidade', label: 'Unidade', price: 10.0, available: true }],
  },
  {
    id: 'espetinho-carne',
    name: 'Espetinho de Carne',
    description: 'Espetinho grelhado na hora, bem temperado',
    category: 'comidas',
    image: '🍢',
    badge: 'Popular',
    available: true,
    stallId: 'stall-2',
    variants: [{ id: 'espetinho-carne-unidade', label: 'Unidade', price: 12.0, available: true }],
  },
  {
    id: 'caldo-verde',
    name: 'Caldo Verde',
    description: 'Caldo quentinho de couve com linguiça',
    category: 'comidas',
    image: '🥣',
    available: true,
    stallId: 'stall-2',
    variants: [{ id: 'caldo-verde-copo', label: 'Copo', price: 8.0, available: true }],
  },
  {
    id: 'maca-amor',
    name: 'Maçã do Amor',
    description: 'Maçã coberta com calda vermelha crocante',
    category: 'doces',
    image: '🍎',
    badge: 'Clássico',
    available: true,
    stallId: 'stall-3',
    variants: [{ id: 'maca-amor-unidade', label: 'Unidade', price: 8.0, available: true }],
  },
  {
    id: 'canjica',
    name: 'Canjica',
    description: 'Canjica cremosa com canela e coco',
    category: 'doces',
    image: '🥛',
    available: true,
    stallId: 'stall-3',
    variants: [{ id: 'canjica-copo', label: 'Copo', price: 7.0, available: true }],
  },
  {
    id: 'pacoca',
    name: 'Paçoca',
    description: 'Doce de amendoim tradicional',
    category: 'doces',
    image: '🥜',
    available: true,
    stallId: 'stall-3',
    variants: [{ id: 'pacoca-unidade', label: 'Unidade', price: 3.0, available: true }],
  },
  {
    id: 'pe-de-moleque',
    name: 'Pé de Moleque',
    description: 'Rapadura com amendoim crocante',
    category: 'doces',
    image: '🍬',
    available: true,
    stallId: 'stall-3',
    variants: [{ id: 'pe-de-moleque-unidade', label: 'Unidade', price: 4.0, available: true }],
  },
  {
    id: 'cocada',
    name: 'Cocada',
    description: 'Doce de coco caramelizado',
    category: 'doces',
    image: '🥥',
    available: true,
    stallId: 'stall-3',
    variants: [{ id: 'cocada-unidade', label: 'Unidade', price: 5.0, available: true }],
  },
  {
    id: 'quentao',
    name: 'Quentão',
    description: 'Bebida quente com gengibre e especiarias',
    category: 'bebidas',
    image: '🍵',
    badge: 'Esquenta!',
    available: true,
    stallId: 'stall-4',
    variants: [{ id: 'quentao-copo', label: 'Copo', price: 6.0, available: true }],
  },
  {
    id: 'vinho-quente',
    name: 'Vinho Quente',
    description: 'Vinho temperado com canela e cravo',
    category: 'bebidas',
    image: '🍷',
    available: true,
    stallId: 'stall-4',
    variants: [{ id: 'vinho-quente-copo', label: 'Copo', price: 8.0, available: true }],
  },
  {
    id: 'refrigerante',
    name: 'Refrigerante',
    description: 'Lata 350ml gelada',
    category: 'bebidas',
    image: '🥤',
    available: true,
    stallId: 'stall-4',
    variants: [
      { id: 'refrigerante-coca', label: 'Coca-Cola', price: 5.0, available: true },
      { id: 'refrigerante-guarana', label: 'Guaraná', price: 5.0, available: true },
      { id: 'refrigerante-fanta', label: 'Fanta Laranja', price: 5.0, available: true },
    ],
  },
  {
    id: 'agua-mineral',
    name: 'Água Mineral',
    description: 'Garrafa 500ml',
    category: 'bebidas',
    image: '💧',
    available: true,
    stallId: 'stall-4',
    variants: [{ id: 'agua-mineral-garrafa', label: 'Garrafa', price: 3.0, available: true }],
  },
  {
    id: 'suco-natural',
    name: 'Suco Natural',
    description: 'Copo 300ml feito na hora',
    category: 'bebidas',
    image: '🧃',
    available: true,
    stallId: 'stall-4',
    variants: [
      { id: 'suco-laranja', label: 'Laranja', price: 6.0, available: true },
      { id: 'suco-limao', label: 'Limão', price: 6.0, available: true },
    ],
  },
  {
    id: 'pescaria',
    name: 'Pescaria',
    description: 'Pesque um peixe e ganhe um prêmio!',
    category: 'jogos',
    image: '🎣',
    badge: 'Diversão',
    available: true,
    stallId: 'stall-5',
    variants: [{ id: 'pescaria-jogada', label: 'Jogada', price: 5.0, available: true }],
  },
  {
    id: 'argolas',
    name: 'Argolas',
    description: 'Acerte as argolas e ganhe brindes',
    category: 'jogos',
    image: '🎯',
    available: true,
    stallId: 'stall-5',
    variants: [{ id: 'argolas-jogada', label: 'Jogada', price: 5.0, available: true }],
  },
  {
    id: 'tiro-ao-alvo',
    name: 'Tiro ao Alvo',
    description: 'Teste sua pontaria!',
    category: 'jogos',
    image: '🎯',
    available: true,
    stallId: 'stall-5',
    variants: [{ id: 'tiro-ao-alvo-jogada', label: 'Jogada', price: 5.0, available: true }],
  },
  {
    id: 'bingo',
    name: 'Cartela de Bingo',
    description: 'Concorra a prêmios incríveis!',
    category: 'brincadeiras',
    image: '🎱',
    badge: 'Prêmios!',
    available: true,
    stallId: 'stall-6',
    variants: [{ id: 'bingo-cartela', label: 'Cartela', price: 5.0, available: true }],
  },
  {
    id: 'correio-elegante',
    name: 'Correio Elegante',
    description: 'Envie uma mensagem secreta para alguém especial',
    category: 'brincadeiras',
    image: '💌',
    badge: 'Romântico',
    available: true,
    stallId: 'stall-7',
    variants: [{ id: 'correio-elegante-mensagem', label: 'Mensagem', price: 3.0, available: true }],
  },
  {
    id: 'quadrilha',
    name: 'Quadrilha',
    description: 'Participe da dança tradicional',
    category: 'brincadeiras',
    image: '💃',
    badge: 'Grátis',
    available: true,
    stallId: 'stall-7',
    variants: [{ id: 'quadrilha-participacao', label: 'Participação', price: 0, available: true }],
  },
];

function buildMenuItemsFromProducts(products: MenuProduct[]): MenuItem[] {
  return products.flatMap((product) =>
    product.variants.map((variant) => {
      const name =
        product.variants.length > 1
          ? `${product.name} — ${variant.label}`
          : product.name;

      return {
        id: variant.id,
        productId: product.id,
        name,
        description: product.description,
        price: variant.price,
        category: product.category,
        image: product.image,
        badge: variant.badge ?? product.badge,
        available: product.available && variant.available,
        stallId: product.stallId,
        variantLabel: variant.label,
      };
    })
  );
}

export const menuItems: MenuItem[] = buildMenuItemsFromProducts(menuProducts);

// Função para gerar número de pedido
export function generateOrderNumber(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

// Função para gerar QR Code mock (apenas um placeholder)
export function generateQRCode(): string {
  return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
