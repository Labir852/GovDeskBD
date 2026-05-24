'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import type { ServiceProfileData } from './columns';

interface ServiceTabsProps {
  profiles: ServiceProfileData[];
}

export function ServicesTabs({ profiles }: ServiceTabsProps) {
  // Group profiles by category
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

  // Set the first category as default tab
  const defaultCategory = categories[0]?.name || '';
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const currentProfiles = profilesByCategory.get(selectedCategory) || [];

  return (
    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
      <TabsList className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}>
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.name} className="text-xs sm:text-sm">
            <div className="flex flex-col items-center gap-1">
              <span>{category.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {category.frequency}
              </span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category.id} value={category.name} className="m-0">
          <DataTable
            columns={columns}
            data={profilesByCategory.get(category.name) || []}
            searchKey="owner"
            searchPlaceholder={`Search ${category.name} service profiles...`}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
