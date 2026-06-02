import { buildMenuItemsFromProducts, findMenuItemById } from '@/lib/catalog/menu-catalog';
import type { MenuProduct, Order } from '@/lib/types/event-domain';
import { seedMenuProducts } from '@/lib/seed/menu-products';

function item(
  products: MenuProduct[],
  eventId: string,
  variantId: string,
  quantity: number
) {
  const menuItem = findMenuItemById(products, variantId);
  if (!menuItem) {
    throw new Error(`Seed menu item not found for event ${eventId}: ${variantId}`);
  }
  return { item: menuItem, quantity };
}

function buildSeedOrders(): Order[] {
  const products = seedMenuProducts;

  return [
    {
      id: 'order-1',
      eventId: '1',
      number: '1234',
      items: [
        item(products, '1', 'pastel-carne', 1),
        item(products, '1', 'milho-verde-unidade', 1),
      ],
      total: 14,
      status: 'available',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      qrCode: 'QR-12345',
    },
    {
      id: 'order-2',
      eventId: '1',
      number: '1189',
      items: [item(products, '1', 'cachorro-quente-unidade', 1)],
      total: 10,
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      qrCode: 'QR-67890',
    },
    {
      id: 'order-3',
      eventId: '1',
      number: '1156',
      items: [
        item(products, '1', 'espetinho-carne-unidade', 2),
        item(products, '1', 'quentao-copo', 1),
      ],
      total: 30,
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      qrCode: 'QR-11111',
    },
    {
      id: 'order-n1',
      eventId: '2',
      number: '2101',
      items: [item(products, '2', 'panetone-fatia', 2)],
      total: 16,
      status: 'available',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      qrCode: 'QR-NATAL-1',
    },
    {
      id: 'order-n2',
      eventId: '2',
      number: '2098',
      items: [item(products, '2', 'chocolate-quente-copo', 1)],
      total: 7,
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      qrCode: 'QR-NATAL-2',
    },
    {
      id: 'adm-1',
      eventId: '1',
      number: '1247',
      items: [],
      total: 34,
      status: 'available',
      createdAt: new Date(Date.now() - 1000 * 60 * 1),
      qrCode: 'QR-adm-1',
    },
    {
      id: 'adm-2',
      eventId: '1',
      number: '1246',
      items: [],
      total: 48,
      status: 'available',
      createdAt: new Date(Date.now() - 1000 * 60 * 3),
      qrCode: 'QR-adm-2',
    },
    {
      id: 'adm-3',
      eventId: '1',
      number: '1245',
      items: [],
      total: 20,
      status: 'available',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      qrCode: 'QR-adm-3',
    },
    {
      id: 'adm-4',
      eventId: '1',
      number: '1244',
      items: [],
      total: 12,
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 8),
      qrCode: 'QR-adm-4',
    },
    {
      id: 'adm-5',
      eventId: '1',
      number: '1243',
      items: [],
      total: 25,
      status: 'available',
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      qrCode: 'QR-adm-5',
    },
  ];
}

export const seedOrders: Order[] = buildSeedOrders();

export function parseStoredOrders(raw: Order[]): Order[] {
  return raw.map((order) => ({
    ...order,
    createdAt: new Date(order.createdAt),
  }));
}

// re-export for admin stats if needed
export { buildMenuItemsFromProducts };
