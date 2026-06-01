'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, LogOut, Shield, ChevronRight } from 'lucide-react';
import { currentEvent } from '@/lib/mock-data';

const mockUser = {
  name: 'Maria Silva',
  email: 'maria.silva@email.com',
  phone: '(41) 99999-1234',
};

export default function PerfilPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <h1 className="font-bold text-foreground text-lg">Perfil</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-10 w-10" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">{mockUser.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{currentEvent.name}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-4">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">E-mail</p>
              <p className="text-sm font-medium text-foreground">{mockUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium text-foreground">{mockUser.phone}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Área administrativa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          type="button"
          onClick={() => router.push('/')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-4 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </motion.button>
      </main>
    </div>
  );
}
