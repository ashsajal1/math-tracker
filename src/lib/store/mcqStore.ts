import { createStore } from "zustand";

type QuizQ = {
  id: number; // the number value used to build question
  question: string;
  options: string[];
  answer: string;
};

type QuestionsBatch = {
  id: number; // unique id for the batch
  questions: QuizQ[];
  title: string;
  topic: string; //SUBJECT
  chapter: string;
  createdAt: string; // ISO date string
};

type mcqStore = {
  questionsBatch: QuestionsBatch[];
};

export const mcqStore = createStore<mcqStore>((set, get) => ({
  questionsBatch: [],

  addQuestionsBatch: (batch: QuestionsBatch) => {
    set((state) => ({
      questionsBatch: [...state.questionsBatch, batch],
    }));
  },

  getQuestionsBatchById: (id: number) => {
    return get().questionsBatch.find((batch) => batch.id === id);
  },

  deletQuesitonbatchById: (id: number) => {
    set((state) => ({
      questionsBatch: state.questionsBatch.filter((batch) => batch.id !== id),
    }));
  },

  clearAllBatches: () => {
    set({ questionsBatch: [] });
  },
}));
