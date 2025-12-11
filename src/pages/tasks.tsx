import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useTaskStore,
  Task,
  TaskPriority,
  TaskType,
  TASK_TYPE_LABELS,
} from "@/lib/store/taskStore";
import { topicStore } from "@/lib/store/topicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Clock,
  Edit,
  LayoutList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Seo from "@/components/Seo";
import { Link } from "react-router-dom";
import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; badge: string }
> = {
  high: {
    label: "High (Daily)",
    color: "text-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  medium: {
    label: "Medium (4 days/week)",
    color: "text-yellow-500",
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  low: {
    label: "Low (2 days/week)",
    color: "text-green-500",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
};

export default function TasksPage() {
  const {
    tasks,
    addTask,
    removeTask,
    updateTask,
    completeTask,
    resetTaskCompletion,
    getTodaysTasks,
    generateRandomTasks,
    getOverdueTasks,
  } = useTaskStore();
  const topics = topicStore((state) => state.topics);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectedPriority, setSelectedPriority] =
    useState<TaskPriority>("medium");
  const [selectedTaskType, setSelectedTaskType] =
    useState<TaskType>("revision");

  // View Mode State
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTopicId, setEditTopicId] = useState<string>("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");

  const todaysTasks = getTodaysTasks();
  const overdueTasks = getOverdueTasks();
  const today = new Date().getDay();

  const handleAddTask = () => {
    if (!newTaskName.trim() || !selectedTopicId) return;

    addTask(newTaskName, selectedTopicId, selectedPriority, selectedTaskType);
    setNewTaskName("");
    setSelectedTopicId("");
    setSelectedPriority("medium");
    setSelectedTaskType("revision");
    setIsAddDialogOpen(false);
  };

  const handleGenerateRandomTasks = () => {
    if (topics.length === 0) return;
    generateRandomTasks(topics);
  };

  const handleToggleComplete = (task: Task) => {
    if (task.isCompleted) {
      resetTaskCompletion(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskName(task.name);
    setEditTopicId(task.topicId);
    setEditPriority(task.priority);
    setIsEditDialogOpen(true);
  };

  const handleEditTask = () => {
    if (!editingTask || !editTaskName.trim() || !editTopicId) return;

    updateTask(editingTask.id, {
      name: editTaskName.trim(),
      topicId: editTopicId,
      priority: editPriority,
    });
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const getTopicName = (topicId: string): string => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? `${topic.subject} - ${topic.topic}` : "Unknown Topic";
  };

  const getDueDateDisplay = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) {
      return { text: "Due today", className: "text-orange-500" };
    }
    if (isPast(date)) {
      return {
        text: `Overdue - ${formatDistanceToNow(date, { addSuffix: true })}`,
        className: "text-red-500",
      };
    }
    return {
      text: `Due ${format(date, "MMM d")} (${formatDistanceToNow(date, {
        addSuffix: true,
      })})`,
      className: "text-muted-foreground",
    };
  };

  const completedCount = todaysTasks.filter((t) => t.isCompleted).length;
  const progressPercentage =
    todaysTasks.length > 0 ? (completedCount / todaysTasks.length) * 100 : 0;

  return (
    <>
      <Seo
        title="Weekly Tasks - Math Tracker"
        description="Manage your weekly study tasks and track your progress."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Weekly Tasks</h1>
            <p className="text-muted-foreground">
              Today is {DAYS_OF_WEEK[today]} • {completedCount}/
              {todaysTasks.length} tasks completed
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            <Button
              variant="secondary"
              onClick={handleGenerateRandomTasks}
              disabled={topics.length === 0}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Tasks
            </Button>
            <div className="border rounded-md p-1 bg-background flex items-center gap-1">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as "list" | "calendar");
                }}
              >
                <ToggleGroupItem value="list" size="sm" aria-label="List view">
                  <LayoutList className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="calendar"
                  size="sm"
                  aria-label="Calendar view"
                >
                  <CalendarDays className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskName">Task Name</Label>
                    <Input
                      id="taskName"
                      placeholder="e.g., Practice Algebra Problems"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                      value={selectedTopicId}
                      onValueChange={setSelectedTopicId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.subject} - {topic.topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {topics.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No topics available. Please add topics first.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={selectedPriority}
                      onValueChange={(v) =>
                        setSelectedPriority(v as TaskPriority)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          {priorityConfig.high.label}
                        </SelectItem>
                        <SelectItem value="medium">
                          {priorityConfig.medium.label}
                        </SelectItem>
                        <SelectItem value="low">
                          {priorityConfig.low.label}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select
                      value={selectedTaskType}
                      onValueChange={(v) => setSelectedTaskType(v as TaskType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TASK_TYPE_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddTask}
                    className="w-full"
                    disabled={!newTaskName.trim() || !selectedTopicId}
                  >
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editTaskName">Task Name</Label>
                    <Input
                      id="editTaskName"
                      placeholder="e.g., Practice Algebra Problems"
                      value={editTaskName}
                      onChange={(e) => setEditTaskName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editTopic">Topic</Label>
                    <Select value={editTopicId} onValueChange={setEditTopicId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.subject} - {topic.topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPriority">Priority</Label>
                    <Select
                      value={editPriority}
                      onValueChange={(v) => setEditPriority(v as TaskPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          {priorityConfig.high.label}
                        </SelectItem>
                        <SelectItem value="medium">
                          {priorityConfig.medium.label}
                        </SelectItem>
                        <SelectItem value="low">
                          {priorityConfig.low.label}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleEditTask}
                    className="w-full"
                    disabled={!editTaskName.trim() || !editTopicId}
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress Bar */}
        {todaysTasks.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Today's Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Overdue Tasks ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{task.name}</span>
                    <span className="text-red-500">
                      {getDueDateDisplay(task.dueDate).text}
                    </span>
                  </div>
                ))}
                {overdueTasks.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{overdueTasks.length - 3} more overdue tasks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content based on View Mode */}
        {viewMode === "list" ? (
          <>
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks scheduled for today.</p>
                    <p className="text-sm mt-2">
                      Add a new task or generate tasks from your topics!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {todaysTasks.map((task) => {
                        const dueDateInfo = getDueDateDisplay(task.dueDate);
                        return (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={() => handleToggleComplete(task)}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                              task.isCompleted
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "bg-card hover:bg-accent/50"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(task);
                                }}
                                className="flex-shrink-0"
                              >
                                {task.isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                                ) : (
                                  <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium ${
                                    task.isCompleted
                                      ? "line-through text-muted-foreground"
                                      : ""
                                  }`}
                                >
                                  {task.name}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {getTopicName(task.topicId)}
                                </p>
                                <p
                                  className={`text-xs ${dueDateInfo.className}`}
                                >
                                  {dueDateInfo.text}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                className={priorityConfig[task.priority].badge}
                              >
                                {task.priority}
                              </Badge>
                              {task.taskType && (
                                <Badge variant="outline" className="text-xs">
                                  {TASK_TYPE_LABELS[task.taskType]}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>All Tasks ({tasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const dueDateInfo = getDueDateDisplay(task.dueDate);
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleComplete(task)}
                          className={`flex items-center justify-between p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors ${
                            task.isCompleted
                              ? "bg-green-50 dark:bg-green-900/20"
                              : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {task.isCompleted && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              <p
                                className={`font-medium ${
                                  task.isCompleted
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {task.name}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {getTopicName(task.topicId)}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge
                                className={priorityConfig[task.priority].badge}
                              >
                                {task.priority}
                              </Badge>
                              {task.taskType && (
                                <Badge variant="outline" className="text-xs">
                                  {TASK_TYPE_LABELS[task.taskType]}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {task.weeklySchedule
                                  .map((d) => DAYS_OF_WEEK[d])
                                  .join(", ")}
                              </span>
                              <span
                                className={`text-xs ${dueDateInfo.className}`}
                              >
                                • {dueDateInfo.text}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                onClick={(e) => e.stopPropagation()}
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Task
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{task.name}
                                    "? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTask(task.id);
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDialog(task);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Calendar View */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {eachDayOfInterval({
                  start: startOfMonth(currentMonth),
                  end: endOfMonth(currentMonth),
                }).map((date, index) => {
                  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
                  const emptyCells =
                    index === 0
                      ? Array.from({ length: firstDayOfMonth }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className="h-24 sm:h-32 bg-muted/20 rounded-md border border-transparent hidden sm:block"
                          />
                        ))
                      : null;

                  const dayTasks = tasks.filter((task) => {
                    const taskDate = new Date(task.dueDate);
                    return isSameDay(taskDate, date);
                  });

                  return (
                    <div key={date.toISOString()} className="contents">
                      {emptyCells}
                      <div
                        className={`min-h-[6rem] sm:h-32 p-1 sm:p-2 border rounded-md flex flex-col gap-1 overflow-y-auto ${
                          isToday(date)
                            ? "bg-primary/5 border-primary"
                            : "bg-card"
                        }`}
                      >
                        <div className="text-right text-xs text-muted-foreground mb-1">
                          {format(date, "d")}
                        </div>
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`text-[10px] sm:text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                              task.isCompleted
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 line-through opacity-70"
                                : "bg-secondary text-primary hover:bg-primary/20"
                            }`}
                            onClick={() => handleToggleComplete(task)}
                            title={task.name}
                          >
                            {task.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </>
  );
}
