// Export the math store
import { 
  useMathStore, 
  getAllProblemTypes, 
  getPointsForAllTypes,
  MathProblemType 
} from './mathStore';

export type { MathProblemType };

// Export math store utilities
export { useMathStore, getAllProblemTypes, getPointsForAllTypes }; 