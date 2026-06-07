'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const combos = [
  {
    id: 'national',
    name: 'GovDesk Default (Flag Green)',
    desc: 'Deep forest green and soft gold/red tones representing Bangladesh.',
    primary: '#006a4e',
    accent: '#e0281b',
    bg: '#f4faf6',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    desc: 'Sleek indigo blue with cool gray elements for a modern SaaS look.',
    primary: '#3b4fe4',
    accent: '#06b6d4',
    bg: '#f8fafc',
  },
  {
    id: 'blue',
    name: 'Ocean Sapphire',
    desc: 'Vibrant sapphire blue and cyan accents representing trust and logic.',
    primary: '#1d4ed8',
    accent: '#f59e0b',
    bg: '#f0f6ff',
  },
  {
    id: 'teal',
    name: 'Vibrant Teal',
    desc: 'Premium dark teal and warm gold highlights for an elegant appearance.',
    primary: '#0f766e',
    accent: '#d97706',
    bg: '#f0faf8',
  },
  {
    id: 'charcoal',
    name: 'Charcoal Grayscale',
    desc: 'Clean monochrome layout using charcoal grays and zinc tones.',
    primary: '#18181b',
    accent: '#27272a',
    bg: '#fafafa',
  },
];

export function ThemeComboSelector() {
  const [activeCombo, setActiveCombo] = useState('national');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme_combo') || 'national';
    setActiveCombo(saved);
    setMounted(true);
  }, []);

  const handleSelect = (id: string) => {
    setActiveCombo(id);
    localStorage.setItem('theme_combo', id);

    // Apply color class on root
    const root = document.documentElement;
    root.classList.remove('theme-national', 'theme-indigo', 'theme-blue', 'theme-teal', 'theme-charcoal');
    if (id !== 'national') {
      root.classList.add(`theme-${id}`);
    }
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Color Theme Combination</CardTitle>
          <CardDescription>Select a standard color scheme to customize the look of the admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="h-48 animate-pulse bg-muted/20 rounded-md" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Theme Combination</CardTitle>
        <CardDescription>
          Choose from standard professional color presets. Changes apply instantly across the entire interface.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {combos.map((combo) => {
            const isSelected = activeCombo === combo.id;
            return (
              <button
                key={combo.id}
                type="button"
                onClick={() => handleSelect(combo.id)}
                className={`relative flex flex-col justify-between rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 focus:outline-none ${
                  isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'
                }`}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{combo.name}</p>
                    <p className="text-xs text-muted-foreground pr-4">{combo.desc}</p>
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/10 p-2 w-full">
                  <div className="flex -space-x-1">
                    <span
                      className="h-4 w-4 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: combo.primary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: combo.accent }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: combo.bg }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {combo.id} palette
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
