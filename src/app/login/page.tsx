'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, callbackUrl: '/dashboard' }),
      });

      if (!response.ok && response.status !== 302) {
        const data = await response.json();
        setError(data.error?.message || data.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Successful login - keep loading state visible and redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/dashboard");
      
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground px-4 py-10">
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
            transition={{ duration: 0.25 }}
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[2rem] border border-border/10 bg-card/90 p-7 text-center shadow-2xl shadow-black/10 backdrop-blur-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10"
            >
              <Shield className="h-8 w-8 text-sky-600" />
            </motion.div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Signing in securely</p>
              <p className="text-sm text-muted-foreground">Please wait while we verify your credentials.</p>
            </div>
            <div className="w-full overflow-hidden rounded-full bg-slate-200/70 h-1.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto flex w-full max-w-md flex-col gap-6"
      >
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.15)] backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/10 text-sky-600 shadow-inner shadow-slate-900/5">
              <Shield className="h-8 w-8" />
            </div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">GovDesk</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Minimal access for modern admins</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Sign in once to manage licenses, documents, and city services from a clean workspace.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-5"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input name="callbackUrl" type="hidden" value="/dashboard" />
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={loading}
                className="min-h-[3rem] rounded-2xl border border-border bg-input px-4 py-3 text-foreground shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-muted"
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
                className="min-h-[3rem] rounded-2xl border border-border bg-input px-4 py-3 text-foreground shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-muted"
              />
            </div>
            <motion.div whileHover={!loading ? { y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}>
              <Button
                type="submit"
                className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_-20px_rgba(15,23,42,0.45)] transition duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </motion.div>
          </form>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-3xl border border-border/70 bg-card/80 px-6 py-5 text-center text-sm text-muted-foreground shadow-sm backdrop-blur-xl"
        >
          <p>Built for focused work with subtle motion and a cleaner login experience.</p>
        </motion.section>
      </motion.main>
    </div>
  )
}

