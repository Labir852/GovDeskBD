'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const username = (formData.get('username') as string)?.trim();
      const password = formData.get('password') as string;
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, callbackUrl }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error?.message || data.error || "Invalid username or password");
        setLoading(false);
        return;
      }

      // Fast immediate transition to authenticated route
      window.location.href = data.redirect || callbackUrl;
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground px-4 py-10 flex items-center justify-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_20%_30%,_rgba(168,85,247,0.14),transparent_18%)] blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-400/15 via-cyan-300/10 to-fuchsia-400/0 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-16 h-52 w-52 rounded-full bg-gradient-to-br from-slate-900/20 to-transparent blur-3xl" />

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[2rem] border border-border/10 bg-card/90 p-7 text-center shadow-2xl shadow-black/10 backdrop-blur-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10"
            >
              <Shield className="h-8 w-8 text-sky-600" />
            </motion.div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Signing in securely</p>
              <p className="text-sm text-muted-foreground">Preparing your dashboard...</p>
            </div>
            <div className="w-full overflow-hidden rounded-full bg-muted h-1.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-primary"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mx-auto flex w-full max-w-md flex-col gap-6"
      >
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.15)] backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/10 text-sky-600 shadow-inner shadow-slate-900/5">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your services, clients, and portal.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                required
                disabled={loading}
                autoComplete="username"
                autoFocus
                className="min-h-[3rem] rounded-2xl border border-border bg-input px-4 py-3 text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
                className="min-h-[3rem] rounded-2xl border border-border bg-input px-4 py-3 text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
              />
            </div>
            <Button
              type="submit"
              className="w-full min-h-[3rem] rounded-full bg-primary text-primary-foreground font-semibold shadow-md transition duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card/80 px-6 py-4 text-center text-sm text-muted-foreground shadow-sm backdrop-blur-xl">
          <p>GovDesk BD Admin & Staff Portal</p>
        </section>
      </motion.main>
    </div>
  );
}
