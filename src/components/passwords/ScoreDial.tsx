import { motion } from "framer-motion";

interface Props {
  score: number; // 0..10
  label: string;
  color: string;
}

export function ScoreDial({ score, label, color }: Props) {
  const pct = (score / 10) * 100;
  const r = 70;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <defs>
          <linearGradient id="dial" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="oklch(0.72 0.19 195)" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="12" fill="none" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          stroke="url(#dial)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={score}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl font-bold text-foreground"
        >
          {score}
          <span className="text-xl text-muted-foreground">/10</span>
        </motion.span>
        <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
