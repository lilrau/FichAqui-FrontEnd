'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { User } from 'lucide-react';
import { AdminSubpageHeader } from '@/components/admin/admin-subpage-header';
import { ProfileFormCard } from '@/components/account/profile-form-card';
import { ThemeSettingsCard } from '@/components/account/theme-settings-card';
import { AccountLogoutButton } from '@/components/account/account-logout-button';
import { AppVersionFooter } from '@/components/account/app-version-footer';

export default function OrganizerAccountConfigPage() {
  const { eventId } = useParams();
  const eventIdStr = eventId as string;

  return (
    <div className="min-h-screen bg-background pb-8">
      <AdminSubpageHeader eventId={eventIdStr} title="Minha conta" />

      <main className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-10 w-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <ProfileFormCard idPrefix="organizer-account" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ThemeSettingsCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <AccountLogoutButton />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AppVersionFooter />
        </motion.div>
      </main>
    </div>
  );
}
