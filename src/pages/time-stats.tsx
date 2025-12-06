import { useTimeTrackStore } from "@/lib/store/timeTrackStore";
import { topicStore } from "@/lib/store/topicStore";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BarChart2, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import TimeChart from "@/components/stats/TimeChart";

export default function TimeStats() {
  const { topicTimes, getTotalTime } = useTimeTrackStore();
  const { topics } = topicStore();
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const totalTime = getTotalTime();

  // Sort topics by time spent (descending)
  const sortedTopics = [...topics].sort((a, b) => {
    const timeA = topicTimes[a.id] || 0;
    const timeB = topicTimes[b.id] || 0;
    return timeB - timeA;
  });

  const chartData = sortedTopics
    .map((topic) => ({
      name: topic.subject,
      value: topicTimes[topic.id] || 0,
      formattedTime: formatTime(topicTimes[topic.id] || 0),
    }))
    .filter((d) => d.value > 0);

  return (
    <>
      <Seo
        title="Time Stats - Math Tracker"
        description="View your study time statistics broken down by topic."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Time Statistics
          </h1>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => navigate("/")} className="gap-2">
            <Play className="w-4 h-4" />
            Start Studying
          </Button>
        </div>

        {/* Total Time Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Total Study Time</span>
          </div>
          <div className="text-5xl font-mono font-bold tracking-tight">
            {formatTime(totalTime)}
          </div>
          <div className="mt-4 text-blue-100 text-sm">
            Keep up the great work! Consistent effort leads to mastery.
          </div>
        </div>

        {/* Chart Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-slate-100">
              Show Chart
            </span>
          </div>
          <Switch checked={showChart} onCheckedChange={setShowChart} />
        </div>

        {/* Chart Section */}
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <TimeChart data={chartData} />
          </motion.div>
        )}

        {/* Topic Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Topic Breakdown
          </h2>

          <div className="grid gap-4">
            {sortedTopics.map((topic) => {
              const time = topicTimes[topic.id] || 0;
              const percentage = totalTime > 0 ? (time / totalTime) * 100 : 0;

              return (
                <div
                  key={topic.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                        {topic.subject}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {topic.topic}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xl text-slate-900 dark:text-slate-100">
                        {formatTime(time)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {sortedTopics.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-slate-200 dark:border-neutral-700">
                No topics found. Create some topics to start tracking!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
