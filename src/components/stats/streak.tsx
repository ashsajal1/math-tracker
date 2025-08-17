import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useMathStore } from "@/lib/store";
import NewStreakCongrats from "@/components/new-streak-congrats";

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Local YYYY-MM-DD string (not UTC) so streaks align with user's local day
const toLocalDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function StreakCard() {
  const { problems } = useMathStore();
  const [showCongrats, setShowCongrats] = useState(false);
  const timerRef = useRef<number | null>(null);
  const prevStreakRef = useRef(0);

  const { streak, percentage } = useMemo(() => {
    // Build a set of unique local-date keys (YYYY-MM-DD) from problems
    const days = new Set<string>(
      problems.map((p) => toLocalDateKey(new Date(p.date)))
    );

    // Count consecutive days ending today (local)
    let count = 0;
    const cursor = startOfDay(new Date());

    while (days.has(toLocalDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Dynamic goal: 7-day segments that advance at exact multiples
    // 0–6 => 7, at 7 => 14, 8–13 => 14, at 14 => 21, etc. (min 7)
    const nextStreakSegment = (() => {
      if (count > 0 && count % 7 === 0) {
        return count + 7;
      }
      return Math.ceil(Math.max(count, 1) / 7) * 7;
    })();
    const dynamicGoal = Math.max(7, nextStreakSegment);
    const pct = Math.min(100, Math.round((count / dynamicGoal) * 100));
    return { streak: count, percentage: pct };
  }, [problems]);

  // When streak increases by exactly 1, show congrats after 3s
  useEffect(() => {
    const key = "last_shown_streak_v2";
    const lastShown = Number(localStorage.getItem(key) || 0);
    const prev = prevStreakRef.current;

    if (streak === prev + 1 && streak > lastShown) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setShowCongrats(true);
        localStorage.setItem(key, String(streak));
      }, 3000);
    } else if (streak > lastShown + 1) {
      // If user jumped more than 1 (backfill), sync without showing
      localStorage.setItem(key, String(streak));
    }

    prevStreakRef.current = streak;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [streak]);

  return (
    <>
      <Card className="p-3 sm:p-6">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
          Streak
        </p>
        <div className="flex items-center justify-between text-2xl sm:text-3xl font-bold">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span>{streak} days</span>
          </div>
          <span className="text-sm text-muted-foreground">{percentage}%</span>
        </div>
        <Progress value={percentage} className="mt-2 h-1" />
      </Card>
      <NewStreakCongrats
        visible={showCongrats}
        day={streak}
        onClose={() => setShowCongrats(false)}
        autoHideMs={2000}
      />
    </>
  );
}
