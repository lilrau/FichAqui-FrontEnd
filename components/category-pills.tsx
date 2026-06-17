'use client';

import { motion } from 'framer-motion';
import { 
  UtensilsCrossed, 
  Candy, 
  GlassWater, 
  Gamepad2, 
  PartyPopper 
} from 'lucide-react';
import type { Category } from '@/lib/types/event-domain';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Candy,
  GlassWater,
  Gamepad2,
  PartyPopper,
};

interface CategoryPillsProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryPills({ categories, activeCategory, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all",
          activeCategory === null
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        Todos
      </motion.button>
      
      {categories.map((category) => {
        const Icon = iconMap[category.icon];
        return (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all",
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {category.name}
          </motion.button>
        );
      })}
    </div>
  );
}
