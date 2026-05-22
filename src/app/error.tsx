'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex max-w-md flex-col items-center text-center space-y-6 rounded-2xl border bg-card p-8 shadow-lg"
      >
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="text-muted-foreground">
            An unexpected error occurred in the application. Our team has been notified.
          </p>
        </div>
        <div className="flex w-full gap-4">
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button className="w-full" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
