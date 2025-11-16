import { createStore } from "zustand";
import { v4 as uuidv4 } from "uuid";

type QuizQ = {
  id: number; // the number value used to build question
  question: string;
  options: string[];
  answer: string;
};

type QuestionsBatch = {
  id: string; // unique id for the batch (uuid)
  questions: QuizQ[];
  title: string;
  topic: string; //SUBJECT
  chapter: string;
  createdAt: string; // ISO date string
};

type McqStore = {
  questionsBatch: QuestionsBatch[];
  addQuestionsBatch: (batch: Omit<QuestionsBatch, "id">) => void;
  getQuestionsBatchById: (id: string) => QuestionsBatch | undefined;
  deletQuesitonbatchById: (id: string) => void;
  clearAllBatches: () => void;
};

export const mcqStore = createStore<McqStore>((set, get) => ({
  questionsBatch: [],

  addQuestionsBatch: (batch: Omit<QuestionsBatch, "id" | "createdAt">) => {
    set((state) => ({
      questionsBatch: [
        ...state.questionsBatch,
        { id: uuidv4(), createdAt: new Date().toISOString(), ...batch },
      ],
    }));
  },

  getQuestionsBatchById: (id: string) => {
    return get().questionsBatch.find((batch) => batch.id === id);
  },

  deletQuesitonbatchById: (id: string) => {
    set((state) => ({
      questionsBatch: state.questionsBatch.filter((batch) => batch.id !== id),
    }));
  },

  clearAllBatches: () => {
    set({ questionsBatch: [] });
  },
}));
