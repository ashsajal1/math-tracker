import { motion } from "framer-motion";
import HistoryList from "@/components/history";
import CreateWork from "@/components/history/create";
import StatsSection from "@/components/stats";
import Seo from "@/components/Seo";
import PointsGraph from "@/components/stats/graph";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
        className="p-2 sm:p-6 sm:space-y-4 max-w-7xl mx-auto"
      >
        {/* Stats Cards */}
        <div className="hidden sm:block">
          <StatsSection />
        </div>
        <div className="flex flex-col gap-2">
          <Button>
            <Link to={"/mcq"}>Give unlimited MCQs</Link>
          </Button>
          <PointsGraph />
          <CreateWork />

          <div className="sm:hidden">
            <StatsSection />
          </div>
          <HistoryList />
        </div>
      </motion.div>
    </>
  );
}
