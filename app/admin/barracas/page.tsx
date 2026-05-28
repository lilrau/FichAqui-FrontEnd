'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Plus,
  Store,
  User,
  Package,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { stalls, categories, Stall } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f43f5e',
];

export default function BarracasPage() {
  const router = useRouter();
  const [stallsList, setStallsList] = useState<Stall[]>(stalls);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [newStall, setNewStall] = useState<Partial<Stall>>({
    name: '',
    category: 'comidas',
    responsible: '',
    color: '#ef4444',
    status: 'open',
    stock: 100,
  });

  const handleSave = () => {
    if (editingStall) {
      setStallsList((prev) =>
        prev.map((s) => (s.id === editingStall.id ? { ...s, ...newStall } : s))
      );
    } else {
      const stall: Stall = {
        id: `stall-${Date.now()}`,
        name: newStall.name || 'Nova Barraca',
        category: newStall.category || 'comidas',
        responsible: newStall.responsible || '',
        color: newStall.color || '#ef4444',
        status: newStall.status || 'open',
        stock: newStall.stock || 100,
      };
      setStallsList((prev) => [...prev, stall]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setStallsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setStallsList((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'open' ? 'closed' : 'open' } : s
      )
    );
  };

  const openEditModal = (stall: Stall) => {
    setEditingStall(stall);
    setNewStall({
      name: stall.name,
      category: stall.category,
      responsible: stall.responsible,
      color: stall.color,
      status: stall.status,
      stock: stall.stock,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStall(null);
    setNewStall({
      name: '',
      category: 'comidas',
      responsible: '',
      color: '#ef4444',
      status: 'open',
      stock: 100,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
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
          <h1 className="font-bold text-foreground">Pontos de Venda</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Add Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full h-14 rounded-xl text-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova Barraca
        </Button>

        {/* Stalls List */}
        <div className="space-y-3">
          {stallsList.map((stall, index) => (
            <motion.div
              key={stall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl bg-card p-4 shadow-sm border border-border"
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: stall.color }}
                >
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground truncate">{stall.name}</h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        stall.status === 'open'
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      )}
                    >
                      {stall.status === 'open' ? 'Aberta' : 'Fechada'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {stall.responsible}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {stall.stock} un
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground capitalize">
                      {categories.find((c) => c.id === stall.category)?.name || stall.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                  onClick={() => handleToggleStatus(stall.id)}
                >
                  {stall.status === 'open' ? 'Fechar' : 'Abrir'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => openEditModal(stall)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-destructive"
                  onClick={() => handleDelete(stall.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card shadow-2xl"
            >
              {/* Handle */}
              <div className="sticky top-0 bg-card z-10">
                <div className="flex justify-center pt-3">
                  <div className="h-1.5 w-12 rounded-full bg-border" />
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-bold text-lg text-card-foreground">
                    {editingStall ? 'Editar Barraca' : 'Nova Barraca'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Nome */}
                <div>
                  <label className="text-sm font-medium text-foreground">Nome da Barraca</label>
                  <Input
                    value={newStall.name}
                    onChange={(e) => setNewStall({ ...newStall, name: e.target.value })}
                    className="mt-2 h-14 rounded-xl text-base"
                    placeholder="Ex: Barraca do Pastel"
                  />
                </div>

                {/* Responsável */}
                <div>
                  <label className="text-sm font-medium text-foreground">Responsável</label>
                  <Input
                    value={newStall.responsible}
                    onChange={(e) => setNewStall({ ...newStall, responsible: e.target.value })}
                    className="mt-2 h-14 rounded-xl text-base"
                    placeholder="Ex: Maria Silva"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setNewStall({ ...newStall, category: cat.id })}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                          newStall.category === cat.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cor */}
                <div>
                  <label className="text-sm font-medium text-foreground">Cor Identificadora</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewStall({ ...newStall, color })}
                        className={cn(
                          "h-10 w-10 rounded-xl transition-all",
                          newStall.color === color && "ring-2 ring-offset-2 ring-foreground"
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {newStall.color === color && (
                          <Check className="h-5 w-5 text-white mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estoque */}
                <div>
                  <label className="text-sm font-medium text-foreground">Estoque Inicial</label>
                  <Input
                    type="number"
                    value={newStall.stock}
                    onChange={(e) => setNewStall({ ...newStall, stock: parseInt(e.target.value) })}
                    className="mt-2 h-14 rounded-xl text-base"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 pb-8">
                <Button
                  onClick={handleSave}
                  className="w-full h-14 text-lg font-bold rounded-2xl"
                >
                  {editingStall ? 'Salvar Alterações' : 'Criar Barraca'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
