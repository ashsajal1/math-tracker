import { motion } from "framer-motion";
import HistoryList from "@/components/history";
import CreateWork from "@/components/history/create";
import StatsSection from "@/components/stats";
import Seo from "@/components/Seo";
import PointsGraph from "@/components/stats/graph";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stopwatch } from "@/components/stopwatch";
import { useState } from "react";
import { Clock } from "lucide-react";

export default function Home() {
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <>
      <Seo
        title="Math Tracker - Dashboard"
        description="Track your math problem-solving progress, view your stats, and stay motivated."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-2 sm:p-6 sm:space-y-4 max-w-7xl mx-auto"
      >
        {/* Stats Cards */}
        <div className="hidden sm:block">
          <StatsSection />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 justify-between">
            <Button onClick={() => setIsStopwatchOpen(true)}>
              <Clock className="w-4 h-4 mr-2" />
              Study Timer
            </Button>

            <Button>
              <Link to={"/mcq"}>Give unlimited MCQs</Link>
            </Button>
          </div>
          <PointsGraph />
          <CreateWork />

          <div className="sm:hidden">
            <StatsSection />
          </div>
          <HistoryList />
        </div>
      </motion.div>

      {/* Stopwatch Dialog */}
      <Stopwatch
        isOpen={isStopwatchOpen}
        onClose={() => setIsStopwatchOpen(false)}
        onTimeUpdate={(time, isRunning) => {
          setStopwatchTime(time);
          setIsStopwatchRunning(isRunning);
        }}
      />

      {/* Floating Indicator (Bottom Left) - Only show when running */}
      {isStopwatchRunning && !isStopwatchOpen && (
        <button
          onClick={() => setIsStopwatchOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
        >
          <Clock className="w-5 h-5 animate-pulse" />
          <span className="font-mono font-semibold">
            {formatTime(stopwatchTime)}
          </span>
        </button>
      )}
    </>
  );
}
