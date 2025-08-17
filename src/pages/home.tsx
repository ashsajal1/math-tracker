import { motion } from "framer-motion";
import HistoryList from "@/components/history";
import CreateWork from "@/components/history/create";
import StatsSection from "@/components/stats";
import Seo from "@/components/Seo";

export default function Home() {
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
        className="p-6 space-y-8 max-w-7xl mx-auto"
      >
        {/* Stats Cards */}
        <StatsSection />

        <CreateWork />
        <HistoryList />
      </motion.div>
    </>
  );
}
