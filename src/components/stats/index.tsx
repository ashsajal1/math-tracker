import QuantityCard from "@/components/stats/quantity";
import StreakCard from "@/components/stats/streak";
import TopCategoryCard from "@/components/stats/top-category";

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
      <QuantityCard problemsGoal={10} pointsGoal={50} />
      <StreakCard />
      <TopCategoryCard />
    </div>
  );
}
