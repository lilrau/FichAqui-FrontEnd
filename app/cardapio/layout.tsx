import { CartProvider } from '@/lib/cart-context';

export default function CardapioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
