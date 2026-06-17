'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import { fetchEventReport } from '@/lib/api/reports';
import { getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import { AdminSubpageHeader } from '@/components/admin/admin-subpage-header';
import { ProductImage } from '@/components/product-image';
import { Button } from '@/components/ui/button';
import type { EventReport } from '@/lib/types/event-report';

export function RelatoriosDashboard({ eventId }: { eventId: string }) {
  const [report, setReport] = useState<EventReport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchEventReport(eventId);
      setReport(data);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Não foi possível carregar os relatórios.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, [eventId]);

  const maxSale = report ? Math.max(...report.salesByHour.map((entry) => entry.value), 1) : 1;

  return (
    <div className="min-h-screen bg-background pb-8">
      <AdminSubpageHeader
        eventId={eventId}
        title="Relatórios"
        right={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => void load(true)}
            disabled={refreshing}
            aria-label="Atualizar relatórios"
          >
            <RefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} />
          </Button>
        }
      />

      <main className="px-4 py-6 space-y-6">
        {loadError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {loading && !report ? (
          <div className="py-16 text-center text-muted-foreground">Carregando relatórios…</div>
        ) : report ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white"
              >
                <DollarSign className="h-8 w-8 opacity-80" />
                <p className="mt-2 text-3xl font-bold">
                  R$ {report.totalRevenue.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm opacity-80">Vendas totais</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white"
              >
                <Package className="h-8 w-8 opacity-80" />
                <p className="mt-2 text-3xl font-bold">{report.orderCount}</p>
                <p className="text-sm opacity-80">Pedidos</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-white"
              >
                <TrendingUp className="h-8 w-8 opacity-80" />
                <p className="mt-2 text-3xl font-bold">
                  R$ {report.averageTicket.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm opacity-80">Ticket médio</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-card p-4 shadow-sm border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">Vendas por Hora</h2>
              </div>

              <div className="flex items-end justify-between gap-2 h-40">
                {report.salesByHour.map((data, index) => (
                  <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.value / maxSale) * 100}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      className="w-full bg-primary rounded-t-lg min-h-[20px]"
                    />
                    <span className="text-xs text-muted-foreground">{data.hour}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-card p-4 shadow-sm border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">Vendas por Categoria</h2>
              </div>

              <div className="space-y-3">
                {report.salesByCategory.map((category, index) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-card p-4 shadow-sm border border-border"
            >
              <h2 className="font-bold text-foreground mb-4">Produtos Mais Vendidos</h2>

              <div className="space-y-3">
                {report.topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      emojiClassName="text-2xl"
                      className="h-10 w-10 rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} vendidos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">R$ {product.revenue.toFixed(2)}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </main>
    </div>
  );
}
