export interface MenuVariant {
  id: string;
  label: string;
  price: number;
  available: boolean;
  badge?: string;
}

export interface MenuProduct {
  id: string;
  eventId: string;
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
  eventId: string;
  name: string;
  category: string;
  responsible: string;
  color: string;
  status: 'open' | 'closed';
  stock: number;
}

export type OrderStatus = 'available' | 'delivered';

export interface Order {
  id: string;
  eventId: string;
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
  code?: string;
  icon?: string;
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

export function isFichaValid(ficha: Ficha): boolean {
  return ficha.status !== 'delivered';
}

export function generateOrderNumber(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

export function generateQRCode(): string {
  return `QR-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
