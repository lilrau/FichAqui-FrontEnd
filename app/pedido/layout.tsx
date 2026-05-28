import { CartProvider } from '@/lib/cart-context';

export default function PedidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
