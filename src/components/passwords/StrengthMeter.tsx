import { motion } from "framer-motion";

interface Props {
  score: number; // 0..10
  color: string;
}

export function StrengthMeter({ score, color }: Props) {
  const pct = Math.max(4, (score / 10) * 100);
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, oklch(0.72 0.19 195))` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
      />
    </div>
  );
}
