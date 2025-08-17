import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type NewStreakCongratsProps = {
  visible: boolean;
  day: number; // current streak day number
  onClose?: () => void;
  autoHideMs?: number; // default 2000ms
};

export default function NewStreakCongrats({
  visible,
  day,
  onClose,
  autoHideMs = 2000,
}: NewStreakCongratsProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      onClose?.();
    }, autoHideMs);
    return () => clearTimeout(t);
  }, [visible, autoHideMs, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Glow circles */}
          <div className="pointer-events-none absolute w-[60vh] h-[60vh] rounded-full bg-primary/20 blur-3xl" />

          {/* Content */}
          <motion.div
            className="relative mx-4 flex flex-col items-center text-center"
            initial={{ scale: 0.8, rotate: -3, y: 20 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <motion.div
              className="rounded-2xl border bg-background/80 px-8 py-6 shadow-2xl"
              initial={{ boxShadow: "0 0 0px rgba(0,0,0,0)" }}
              animate={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
            >
              <motion.p
                className="text-sm font-medium tracking-wide text-primary/90"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                New Day Streak
              </motion.p>
              <motion.h1
                className="mt-2 text-6xl sm:text-7xl font-extrabold leading-none"
                style={{
                  background: "linear-gradient(90deg, hsl(var(--primary)), #22c55e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              >
                {day}
              </motion.h1>
              <motion.p
                className="mt-1 text-sm text-muted-foreground"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                Day streak – keep it up!
              </motion.p>
            </motion.div>

            {/* Confetti-like bits */}
            <div className="pointer-events-none absolute inset-0">
              {[...Array(16)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-sm bg-primary"
                  initial={{
                    opacity: 0,
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 240,
                    y: (Math.random() - 0.5) * 240,
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 1.2, delay: 0.05 + i * 0.02, ease: "easeOut" }}
                  style={{ left: "50%", top: "50%" }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

