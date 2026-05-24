'use client';

import * as React from 'react';
import { Button } from './button';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showText?: boolean;
}

export function CopyButton({
  value,
  label,
  variant = 'ghost',
  showText = true,
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button
        type="button"
        variant={variant}
        size="icon"
        onClick={handleCopy}
        title={label ? `Copy ${label}` : 'Copy'}
        className={`h-7 w-7 flex-shrink-0 hover:bg-muted ${className || ''}`}
        {...props}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500 transition-all scale-110" />
        ) : (
          <Copy className="h-3.5 w-3.5 transition-all" />
        )}
      </Button>
      {copied && showText && (
        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-left-1 duration-200">
          Copied!
        </span>
      )}
    </div>
  );
}
