import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { Check as CheckItem } from "@/lib/password";

export function ChecklistItem({ item, index }: { item: CheckItem; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-glass px-3 py-2.5 text-sm"
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
          item.passed ? "bg-strong/20 text-strong" : "bg-weak/15 text-weak"
        }`}
      >
        {item.passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      </span>
      <span className={item.passed ? "text-foreground" : "text-muted-foreground"}>
        {item.label}
      </span>
    </motion.li>
  );
}
