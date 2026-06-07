'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import type { ServiceProfileData } from './columns';

interface ServiceTabsProps {
  profiles: ServiceProfileData[];
}

export function ServicesTabs({ profiles }: ServiceTabsProps) {
  const categoriesByName = new Map<string, { id: string; name: string; frequency: string }>();
  const profilesByCategory = new Map<string, ServiceProfileData[]>();

  profiles.forEach((profile) => {
    const categoryKey = profile.category.name;
    if (!categoriesByName.has(categoryKey)) {
      categoriesByName.set(categoryKey, profile.category);
      profilesByCategory.set(categoryKey, []);
    }
    profilesByCategory.get(categoryKey)!.push(profile);
  });

  const categories = Array.from(categoriesByName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const defaultCategory = categories[0]?.name || '';
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  return (
    <div className="w-full space-y-5">
      {/* Sliding Tab Bar */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1 backdrop-blur-sm border border-border/50">
        {categories.map((category) => {
          const isActive = selectedCategory === category.name;
          const count = profilesByCategory.get(category.name)?.length ?? 0;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
              className="relative flex-1 min-w-[120px] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-active-bg"
                  className="absolute inset-0 rounded-lg bg-card shadow-sm border border-border/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex flex-col items-center gap-0.5 transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}>
                <span className="flex items-center gap-1.5">
                  {category.name}
                  <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors duration-200 ${isActive ? 'bg-primary/15 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                    {count}
                  </span>
                </span>
                <span className={`text-[10px] font-normal transition-colors duration-200 ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                  {category.frequency}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Animated Table Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <DataTable
            columns={columns}
            data={profilesByCategory.get(selectedCategory) || []}
            searchKey="owner"
            searchPlaceholder={`Search ${selectedCategory} service profiles...`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
