import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { TopicPriority } from "./topicStore";

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskType = 'cq' | 'mcq' | 'slide' | 'revision' | 'reading';

export interface Task {
  id: string;
  name: string;           // User-defined task name
  topicId: string;        // Reference to topic from topicStore
  priority: TaskPriority; // Determines frequency
  taskType: TaskType;     // Type of task activity
  weeklySchedule: number[]; // Days of the week (0-6, Sunday-Saturday)
  dueDate: string;        // ISO date string for when task is due
  createdAt: string;
  isCompleted: boolean;
  lastCompletedAt: string | null;
}

interface TopicInput {
  id: string;
  topic: string;
  subject: string;
  priority?: TopicPriority;
  points?: number;
}

interface TaskStore {
  tasks: Task[];
  
  // Actions
  addTask: (name: string, topicId: string, priority: TaskPriority, taskType?: TaskType, dueDate?: Date) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  resetTaskCompletion: (id: string) => void;
  generateRandomTasks: (topics: TopicInput[]) => void;
  
  // Selectors
  getTasks: () => Task[];
  getTodaysTasks: () => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTasksByType: (taskType: TaskType) => Task[];
  getOverdueTasks: () => Task[];
  clearAll: () => void;
}

const TASK_TYPES: TaskType[] = ['cq', 'mcq', 'slide', 'revision', 'reading'];

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  cq: 'Conceptual Questions',
  mcq: 'Multiple Choice Questions',
  slide: 'Slide Review',
  revision: 'Revision',
  reading: 'Reading',
};

/**
 * Generate weekly schedule based on priority
 * - high: every day (0-6)
 * - medium: 4 days (Mon, Tue, Thu, Sat)
 * - low: 2 days (Wed, Sun)
 */
const generateWeeklySchedule = (priority: TaskPriority): number[] => {
  switch (priority) {
    case 'high':
      return [0, 1, 2, 3, 4, 5, 6]; // Every day
    case 'medium':
      return [1, 2, 4, 6]; // Mon, Tue, Thu, Sat
    case 'low':
      return [0, 3]; // Sun, Wed
    default:
      return [0, 1, 2, 3, 4, 5, 6];
  }
};

/**
 * Generate a random due date within the next 7 days based on priority
 * - high: 1-2 days
 * - medium: 3-5 days
 * - low: 5-7 days
 */
const generateRandomDueDate = (priority: TaskPriority): Date => {
  const today = new Date();
  let daysToAdd: number;
  
  switch (priority) {
    case 'high':
      daysToAdd = Math.floor(Math.random() * 2) + 1; // 1-2 days
      break;
    case 'medium':
      daysToAdd = Math.floor(Math.random() * 3) + 3; // 3-5 days
      break;
    case 'low':
      daysToAdd = Math.floor(Math.random() * 3) + 5; // 5-7 days
      break;
    default:
      daysToAdd = Math.floor(Math.random() * 7) + 1;
  }
  
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + daysToAdd);
  dueDate.setHours(23, 59, 59, 999); // End of day
  return dueDate;
};

/**
 * Get a random task type
 */
const getRandomTaskType = (): TaskType => {
  return TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
};

/**
 * Generate task name based on topic and task type
 */
const generateTaskName = (topicName: string, subjectName: string, taskType: TaskType): string => {
  const templates: Record<TaskType, string[]> = {
    cq: [
      `Answer ${topicName} conceptual questions`,
      `Practice ${topicName} CQ problems`,
    ],
    mcq: [
      `Complete ${topicName} MCQ practice`,
      `Solve ${subjectName} - ${topicName} MCQs`,
    ],
    slide: [
      `Review ${topicName} slides`,
      `Study ${topicName} presentation`,
    ],
    revision: [
      `Revise ${topicName} concepts`,
      `Quick revision: ${topicName}`,
    ],
    reading: [
      `Read ${topicName} chapter`,
      `Study ${topicName} material`,
    ],
  };
  
  const typeTemplates = templates[taskType];
  return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
};

/**
 * Determine how many tasks to generate based on topic priority
 * - high priority topics get more tasks (3-4)
 * - medium priority topics get moderate tasks (2-3)
 * - low priority topics get fewer tasks (1-2)
 */
const getTaskCountForPriority = (priority: TopicPriority | undefined): number => {
  switch (priority) {
    case 'high':
      return Math.floor(Math.random() * 2) + 3; // 3-4 tasks
    case 'medium':
      return Math.floor(Math.random() * 2) + 2; // 2-3 tasks
    case 'low':
      return Math.floor(Math.random() * 2) + 1; // 1-2 tasks
    default:
      return 2;
  }
};

/**
 * Check if a task is scheduled for today
 */
const isScheduledForToday = (task: Task): boolean => {
  const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  return task.weeklySchedule.includes(today);
};

/**
 * Check if task was completed today
 */
const wasCompletedToday = (task: Task): boolean => {
  if (!task.lastCompletedAt) return false;
  const lastCompleted = new Date(task.lastCompletedAt);
  const today = new Date();
  return (
    lastCompleted.getFullYear() === today.getFullYear() &&
    lastCompleted.getMonth() === today.getMonth() &&
    lastCompleted.getDate() === today.getDate()
  );
};

/**
 * Check if task is overdue
 */
const isOverdue = (task: Task): boolean => {
  if (task.isCompleted) return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
};

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],

        addTask: (name, topicId, priority, taskType = 'revision', dueDate) => {
          const newTask: Task = {
            id: uuidv4(),
            name: name.trim(),
            topicId,
            priority,
            taskType,
            weeklySchedule: generateWeeklySchedule(priority),
            dueDate: (dueDate || generateRandomDueDate(priority)).toISOString(),
            createdAt: new Date().toISOString(),
            isCompleted: false,
            lastCompletedAt: null,
          };
          set(
            (state) => ({
              tasks: [...state.tasks, newTask],
            }),
            false,
            'task/addTask'
          );
        },

        removeTask: (id) => {
          set(
            (state) => ({
              tasks: state.tasks.filter((task) => task.id !== id),
            }),
            false,
            'task/removeTask'
          );
        },

        updateTask: (id, updates) => {
          set(
            (state) => ({
              tasks: state.tasks.map((task) => {
                if (task.id !== id) return task;
                
                // If priority changed, regenerate schedule and due date
                const updatedTask = { ...task, ...updates };
                if (updates.priority && updates.priority !== task.priority) {
                  updatedTask.weeklySchedule = generateWeeklySchedule(updates.priority);
                  updatedTask.dueDate = generateRandomDueDate(updates.priority).toISOString();
                }
                return updatedTask;
              }),
            }),
            false,
            'task/updateTask'
          );
        },

        completeTask: (id) => {
          set(
            (state) => ({
              tasks: state.tasks.map((task) =>
                task.id === id
                  ? { ...task, isCompleted: true, lastCompletedAt: new Date().toISOString() }
                  : task
              ),
            }),
            false,
            'task/completeTask'
          );
        },

        resetTaskCompletion: (id) => {
          set(
            (state) => ({
              tasks: state.tasks.map((task) =>
                task.id === id
                  ? { ...task, isCompleted: false }
                  : task
              ),
            }),
            false,
            'task/resetTaskCompletion'
          );
        },

        generateRandomTasks: (topics) => {
          if (topics.length === 0) return;
          
          // Sort topics by priority: high first, then medium, then low
          const priorityOrder: Record<TopicPriority, number> = { high: 0, medium: 1, low: 2 };
          const sortedTopics = [...topics].sort((a, b) => {
            const aPriority = a.priority || 'medium';
            const bPriority = b.priority || 'medium';
            return priorityOrder[aPriority] - priorityOrder[bPriority];
          });
          
          const newTasks: Task[] = [];
          
          for (const topic of sortedTopics) {
            const topicPriority = topic.priority || 'medium';
            const taskCount = getTaskCountForPriority(topicPriority);
            const usedTypes = new Set<TaskType>();
            
            for (let i = 0; i < taskCount; i++) {
              // Try to get a unique task type for each task
              let taskType = getRandomTaskType();
              let attempts = 0;
              while (usedTypes.has(taskType) && attempts < 5) {
                taskType = getRandomTaskType();
                attempts++;
              }
              usedTypes.add(taskType);
              
              // Task priority matches topic priority
              const taskPriority: TaskPriority = topicPriority;
              
              newTasks.push({
                id: uuidv4(),
                name: generateTaskName(topic.topic, topic.subject, taskType),
                topicId: topic.id,
                priority: taskPriority,
                taskType,
                weeklySchedule: generateWeeklySchedule(taskPriority),
                dueDate: generateRandomDueDate(taskPriority).toISOString(),
                createdAt: new Date().toISOString(),
                isCompleted: false,
                lastCompletedAt: null,
              });
            }
          }
          
          set(
            (state) => ({
              tasks: [...state.tasks, ...newTasks],
            }),
            false,
            'task/generateRandomTasks'
          );
        },

        getTasks: () => get().tasks,

        getTodaysTasks: () => {
          const tasks = get().tasks;
          return tasks.filter((task) => {
            // Only include tasks scheduled for today
            if (!isScheduledForToday(task)) return false;
            return true;
          }).map((task) => ({
            ...task,
            // Update isCompleted based on whether it was completed today
            isCompleted: wasCompletedToday(task),
          }));
        },

        getTasksByPriority: (priority) => {
          return get().tasks.filter((task) => task.priority === priority);
        },

        getTasksByType: (taskType) => {
          return get().tasks.filter((task) => task.taskType === taskType);
        },

        getOverdueTasks: () => {
          return get().tasks.filter(isOverdue);
        },

        clearAll: () => set({ tasks: [] }, false, 'task/clearAll'),
      }),
      {
        name: "task-store",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    {
      name: 'taskStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

export { TASK_TYPE_LABELS };
