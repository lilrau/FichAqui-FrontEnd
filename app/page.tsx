'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Clock, User, Users, ChevronRight, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { currentEvent } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'login' | 'admin'>('welcome');
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/cardapio');
    }, 800);
  };

  const handleAdminLogin = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/admin');
    }, 800);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-24 right-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-0 w-full shrink-0"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src="https://curitibacult.com.br/wp-content/uploads/2025/05/Festa-Junina-do-Quermesse-Foto-Canva.jpg"
                    alt="Festa Junina do Quermesse"
                    className="absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(to_bottom,black_50%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent_95%)]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
                </div>
              </motion.div>

              {/* Hero Section */}
              <div className="relative z-10 flex flex-col items-center bg-background px-6 pb-12 pt-4">
                {/* Event Name */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-foreground text-center"
                >
                  {currentEvent.name}
                </motion.h1>

                {/* Event Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex flex-wrap justify-center gap-3"
                >
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{currentEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>24 de Junho</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{currentEvent.startTime} - {currentEvent.endTime}</span>
                  </div>
                </motion.div>

                {/* Live Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 border border-green-500/20"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="h-2.5 w-2.5 rounded-full bg-green-500"
                  />
                  <span className="text-sm font-semibold">Ingressos à venda!</span>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center text-muted-foreground max-w-sm px-4"
                >
                  {currentEvent.description}
                </motion.p>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="px-6 pb-8 space-y-3"
              >
                <Button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/30"
                  size="lg"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <PartyPopper className="mr-2 h-5 w-5" />
                      Cardápio e Atrações
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('login')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Fazer Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep('admin')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Organizador
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex-1 flex flex-col p-6"
            >
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-2 text-muted-foreground mb-8"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
                Voltar
              </button>

              <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
              <p className="mt-2 text-muted-foreground">
                Acesse sua conta para ver seus pedidos
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">E-mail</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="mt-2 h-14 rounded-xl text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="mt-2 h-14 rounded-xl text-base"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold rounded-2xl"
                >
                  Entrar
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-4 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleContinue}
                  className="w-full h-12 rounded-xl"
                >
                  Continuar com Google
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex-1 flex flex-col p-6"
            >
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-2 text-muted-foreground mb-8"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
                Voltar
              </button>

              <h1 className="text-2xl font-bold text-foreground">Área do Organizador</h1>
              <p className="mt-2 text-muted-foreground">
                Acesse para gerenciar o evento
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Código do evento</label>
                  <Input
                    type="text"
                    placeholder="FESTA2026"
                    defaultValue="FESTA2026"
                    className="mt-2 h-14 rounded-xl text-base uppercase"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Senha de acesso</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    defaultValue="admin"
                    className="mt-2 h-14 rounded-xl text-base"
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleAdminLogin}
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold rounded-2xl"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    'Acessar Painel'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
