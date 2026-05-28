'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const salesData = [
  { hour: '18h', value: 450 },
  { hour: '19h', value: 890 },
  { hour: '20h', value: 1200 },
  { hour: '21h', value: 980 },
  { hour: '22h', value: 650 },
];

const topProducts = [
  { name: 'Pastel de Carne', sales: 87, revenue: 696, image: '🥟' },
  { name: 'Espetinho', sales: 64, revenue: 768, image: '🍢' },
  { name: 'Quentão', sales: 58, revenue: 348, image: '🍵' },
  { name: 'Milho Verde', sales: 52, revenue: 312, image: '🌽' },
  { name: 'Maçã do Amor', sales: 45, revenue: 360, image: '🍎' },
];

const categoryData = [
  { name: 'Comidas', percentage: 45, color: 'bg-red-500' },
  { name: 'Bebidas', percentage: 25, color: 'bg-blue-500' },
  { name: 'Doces', percentage: 18, color: 'bg-pink-500' },
  { name: 'Jogos', percentage: 8, color: 'bg-green-500' },
  { name: 'Brincadeiras', percentage: 4, color: 'bg-amber-500' },
];

export default function RelatoriosPage() {
  const router = useRouter();
  const maxSale = Math.max(...salesData.map((d) => d.value));

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">Relatórios</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white"
          >
            <DollarSign className="h-8 w-8 opacity-80" />
            <p className="mt-2 text-3xl font-bold">R$ 4.170</p>
            <p className="text-sm opacity-80">Vendas totais</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white"
          >
            <Package className="h-8 w-8 opacity-80" />
            <p className="mt-2 text-3xl font-bold">306</p>
            <p className="text-sm opacity-80">Pedidos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white"
          >
            <Users className="h-8 w-8 opacity-80" />
            <p className="mt-2 text-3xl font-bold">412</p>
            <p className="text-sm opacity-80">Visitantes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-white"
          >
            <TrendingUp className="h-8 w-8 opacity-80" />
            <p className="mt-2 text-3xl font-bold">R$ 13,63</p>
            <p className="text-sm opacity-80">Ticket médio</p>
          </motion.div>
        </div>

        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card p-4 shadow-sm border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Vendas por Hora</h2>
          </div>

          <div className="flex items-end justify-between gap-2 h-40">
            {salesData.map((data, index) => (
              <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.value / maxSale) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="w-full bg-primary rounded-t-lg min-h-[20px]"
                />
                <span className="text-xs text-muted-foreground">{data.hour}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-card p-4 shadow-sm border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Vendas por Categoria</h2>
          </div>

          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className={cn("h-full rounded-full", category.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-card p-4 shadow-sm border border-border"
        >
          <h2 className="font-bold text-foreground mb-4">Produtos Mais Vendidos</h2>

          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50"
              >
                <span className="text-2xl">{product.image}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} vendidos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {product.revenue}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
