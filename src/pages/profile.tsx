import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMathStore } from "@/lib/store";
import { 
  Trophy,
  Target,
  Calendar,
  Star,
  Award,
  TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const { problems, getTotalPoints } = useMathStore();

  // Calculate user stats
  const totalProblems = problems.length;
  const currentStreak = 7; // TODO: Implement streak calculation
  const totalPoints = getTotalPoints();
  const joinDate = new Date(2025, 5, 1); // TODO: Get from user data
  const daysActive = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const level = Math.max(1, Math.floor(Math.log2(totalPoints + 1)));
  const nextLevelPoints = Math.pow(2, level + 1) - 1;
  const currentLevelPoints = Math.pow(2, level) - 1;
  const progress = Math.min(100, Math.max(0, ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100));

  // Achievement data
  const achievements = [
    {
      icon: Trophy,
      title: "First Blood",
      description: "Solved your first problem",
      completed: totalProblems > 0,
    },
    {
      icon: Target,
      title: "Sharpshooter",
      description: "Maintain a 7-day streak",
      completed: currentStreak >= 7,
    },
    {
      icon: Star,
      title: "Rising Star",
      description: "Reach level 5",
      completed: level >= 5,
    },
    {
      icon: Award,
      title: "Problem Master",
      description: "Solve 100 problems",
      completed: totalProblems >= 100,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/avatar-placeholder.png" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">User Name</h1>
            <p className="text-muted-foreground">Mathematics Enthusiast</p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
              <Button variant="outline" size="sm">Edit Profile</Button>
              <Button variant="outline" size="sm">Share Profile</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Level {level}
              </h3>
              <p className="text-sm text-muted-foreground">
                {totalPoints} / {nextLevelPoints} XP to next level
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{Math.floor(progress)}%</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalProblems}</p>
            <p className="text-sm text-muted-foreground">Problems Solved</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{daysActive}</p>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              className={`p-4 rounded-lg border ${
                achievement.completed ? 'bg-primary/5 border-primary/20' : 'bg-muted/5 border-muted/20'
              }`}
            >
              <achievement.icon className={`h-8 w-8 mb-2 ${
                achievement.completed ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <h4 className="font-medium">{achievement.title}</h4>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
