// Export the math store
import { 
  useMathStore, 
  MathProblemType 
} from './mathStore';

// Export the topic store
export { topicStore, type Topic } from './topicStore';

// Export the task store
export { useTaskStore, type Task, type TaskPriority } from './taskStore';

export type { MathProblemType };

// Export math store utilities
export { useMathStore }; 