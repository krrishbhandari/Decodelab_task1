import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Wand2,
  Clock,
  Activity,
  History,
  ArrowRight,
  Lock,
  Zap,
} from "lucide-react";

import { analyzePassword, generateRandomPassword, type AnalysisResult } from "@/lib/password";
import logo from "@/assets/decodelabs-logo.png.asset.json";
import { ScoreDial } from "@/components/password/ScoreDial";
import { ChecklistItem } from "@/components/password/ChecklistItem";
import { StrengthMeter } from "@/components/password/StrengthMeter";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Password Strength Checker — Analyze & Harden Your Passwords" },
      {
        name: "description",
        content:
          "Real-time password strength analysis with entropy, crack-time estimates, and an intelligent Password Coach.",
      },
    ],
  }),
});

const STRENGTH_COLOR: Record<string, string> = {
  Weak: "oklch(0.65 0.22 25)",
  Medium: "oklch(0.78 0.16 75)",
  Strong: "oklch(0.75 0.17 155)",
  "Very Strong": "oklch(0.72 0.19 195)",
};

interface HistoryEntry {
  masked: string;
  score: number;
  strength: string;
  at: number;
}

function Home() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const lastConfettiScore = useRef(0);

  const analysis: AnalysisResult = useMemo(() => analyzePassword(password), [password]);
  const color = STRENGTH_COLOR[analysis.strength] ?? STRENGTH_COLOR.Weak;

  // Confetti when reaching Very Strong
  useEffect(() => {
    if (analysis.strength === "Very Strong" && lastConfettiScore.current < 9 && password.length > 0) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.35 },
        colors: ["#4F8CFF", "#22D3EE", "#A78BFA", "#34D399"],
      });
    }
    lastConfettiScore.current = analysis.score;
  }, [analysis.strength, analysis.score, password.length]);

  const pushHistory = (pw: string) => {
    if (!pw) return;
    const masked = pw.length <= 4 ? "•".repeat(pw.length) : `${pw.slice(0, 2)}${"•".repeat(pw.length - 4)}${pw.slice(-2)}`;
    const a = analyzePassword(pw);
    setHistory((h) => [{ masked, score: a.score, strength: a.strength, at: Date.now() }, ...h].slice(0, 6));
  };

  const copy = async (value: string, label = "Password") => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  const reset = () => {
    setPassword("");
    toast("Cleared", { icon: <RefreshCw className="h-4 w-4" /> });
  };

  const useGenerated = (pw: string) => {
    setPassword(pw);
    setVisible(true);
    toast.success("Generated password applied");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 gradient-hero opacity-90" />
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <img src={logo.url} alt="Decode Labs" className="h-9 w-auto" />
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          <a href="#analyzer" className="hover:text-foreground">Analyzer</a>
          <a href="#coach" className="hover:text-foreground">Coach</a>
          <a href="#tips" className="hover:text-foreground">Security Tips</a>
        </nav>
        <a
          href="#analyzer"
          className="hidden rounded-full border border-border/60 bg-glass px-4 py-1.5 text-sm text-foreground/90 hover:bg-white/5 sm:inline-flex"
        >
          Try it now
        </a>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        {/* Hero */}
        <section className="pt-10 pb-14 text-center sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-glass px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Intelligent, rule-based Password Coach
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mx-auto max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            <span className="text-gradient">Password Strength</span> Checker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Protect your digital identity with intelligent password analysis, entropy scoring, and coaching that tells you exactly what to fix.
          </motion.p>
        </section>

        {/* Analyzer */}
        <section id="analyzer" className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Left: Input + Meter + Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Enter a password
            </div>

            <div className="mt-3 flex items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") pushHistory(password);
                  }}
                  placeholder="Type or paste a password…"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Password to analyze"
                  className="w-full rounded-2xl border border-border bg-background/60 px-4 py-4 pr-24 font-mono text-lg tracking-wide text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                />
                <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(password)}
                    aria-label="Copy password"
                    className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="grid shrink-0 place-items-center rounded-2xl border border-border bg-glass px-4 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                aria-label="Reset"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Meter */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Live strength</span>
                <motion.span
                  key={analysis.strength}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-semibold"
                  style={{ color }}
                >
                  {password ? analysis.strength : "—"}
                </motion.span>
              </div>
              <StrengthMeter score={analysis.score} color={color} />
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <Stat icon={<Activity className="h-3.5 w-3.5" />} label="Entropy" value={`${analysis.entropyBits} bits`} />
                <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Crack time" value={analysis.crackTime} />
                <Stat icon={<Zap className="h-3.5 w-3.5" />} label="Length" value={`${password.length}`} />
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Requirements
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {analysis.checks.map((c, i) => (
                  <ChecklistItem key={c.id} item={c} index={i} />
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: Score + Coach */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col gap-6"
          >
            <div className="glass-card flex flex-col items-center rounded-3xl p-6 sm:p-8">
              <ScoreDial score={analysis.score} label={password ? analysis.strength : "Awaiting input"} color={color} />
              <AnimatePresence>
                {analysis.strength === "Very Strong" && password && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-strong/40 bg-strong/10 px-3 py-1 text-xs text-strong"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Excellent — fortress grade
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <PasswordCoach analysis={analysis} onUse={useGenerated} />
          </motion.div>
        </section>

        {/* Generator + History */}
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <Generator onUse={useGenerated} onCopy={(v) => copy(v, "Generated password")} />
          <HistoryPanel history={history} onSave={() => pushHistory(password)} />
        </section>

        {/* Security Tips */}
        <section id="tips" className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Security tips from the front lines</h2>
              <p className="mt-1 text-sm text-muted-foreground">Small habits that meaningfully reduce your attack surface.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground">
                  <t.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-background/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Decode Labs — Password Strength Checker</span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" /> All analysis runs privately in your browser.
          </span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-glass p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1 truncate font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}

function PasswordCoach({
  analysis,
  onUse,
}: {
  analysis: AnalysisResult;
  onUse: (pw: string) => void;
}) {
  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">Password Coach</div>
          <div className="text-xs text-muted-foreground">Why your password scored this way</div>
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        {analysis.feedback.slice(0, 6).map((f) => {
          const passed = f.startsWith("✔");
          return (
            <div
              key={f}
              className={`text-sm ${passed ? "text-foreground/90" : "text-muted-foreground"}`}
            >
              <span className={passed ? "text-strong" : "text-weak"}>{f.slice(0, 1)}</span>
              <span className="ml-2">{f.slice(2)}</span>
            </div>
          );
        })}
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Suggestions</div>
          <ul className="space-y-1.5 text-sm">
            {analysis.suggestions.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-primary">Coach suggestion</div>
          <button
            onClick={() => onUse(analysis.improved)}
            className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            <Wand2 className="h-3.5 w-3.5" /> Use this
          </button>
        </div>
        <div className="break-all rounded-lg bg-background/60 p-3 font-mono text-sm text-foreground">
          {analysis.improved}
        </div>
        <ul className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          {analysis.improvedReason.map((r) => (
            <li key={r} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-primary" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Generator({
  onUse,
  onCopy,
}: {
  onUse: (pw: string) => void;
  onCopy: (pw: string) => void;
}) {
  const [length, setLength] = useState(16);
  const [value, setValue] = useState("");
  const regen = () => setValue(generateRandomPassword(length));

  useEffect(() => {
    setValue(generateRandomPassword(length));
  }, [length]);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Wand2 className="h-3.5 w-3.5" /> Random generator
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 truncate rounded-2xl border border-border bg-background/60 px-4 py-4 font-mono text-lg text-foreground">
          {value}
        </div>
        <button
          onClick={regen}
          aria-label="Regenerate"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border bg-glass text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Length</label>
        <input
          type="range"
          min={8}
          max={32}
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="flex-1 accent-[color:var(--primary)]"
        />
        <span className="w-8 text-right font-mono text-sm">{length}</span>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => onUse(value)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <ShieldCheck className="h-4 w-4" /> Analyze this
        </button>
        <button
          onClick={() => onCopy(value)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5"
        >
          <Copy className="h-4 w-4" /> Copy
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({ history, onSave }: { history: HistoryEntry[]; onSave: () => void }) {
  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <History className="h-3.5 w-3.5" /> Session history
        </div>
        <button
          onClick={onSave}
          className="rounded-full border border-border bg-glass px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Save current
        </button>
      </div>
      {history.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-background/30 p-6 text-center text-sm text-muted-foreground">
          Press Enter or “Save current” to compare passwords in this session.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border/50">
          {history.map((h) => {
            const c = STRENGTH_COLOR[h.strength] ?? STRENGTH_COLOR.Weak;
            return (
              <li key={h.at} className="flex items-center gap-3 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/40 font-mono text-xs">
                  {h.score}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-sm text-foreground">{h.masked}</div>
                  <div className="text-xs" style={{ color: c }}>
                    {h.strength}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(h.at).toLocaleTimeString()}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const TIPS = [
  {
    icon: Shield,
    title: "Length beats complexity",
    body: "A 16-character passphrase is orders of magnitude harder to crack than an 8-character symbol soup.",
  },
  {
    icon: Lock,
    title: "One password, one site",
    body: "Reuse turns a single breach into an all-access pass. Use a password manager to keep them unique.",
  },
  {
    icon: Sparkles,
    title: "Passphrases work",
    body: "Four random words with a symbol and number are memorable and cryptographically strong.",
  },
  {
    icon: Activity,
    title: "Check for breaches",
    body: "Rotate any password that appeared in a public data breach — attackers spray reused credentials first.",
  },
  {
    icon: ShieldCheck,
    title: "Enable 2FA everywhere",
    body: "Two-factor authentication defeats most credential-theft attacks even if a password leaks.",
  },
  {
    icon: Clock,
    title: "Rotate what matters",
    body: "Rotate high-value accounts (email, banking, admin) after any suspicious activity or shared access.",
  },
];
