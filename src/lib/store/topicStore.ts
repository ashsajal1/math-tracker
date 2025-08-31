import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

interface Topic {
  id: string;
  subject: string;
  topic: string;
  cretedAt: string;
}

interface TopicStore {
  topics: Topic[];
  addTopic: (topic: string) => void;
  removeTopic: (id: string) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  getTopics: () => Topic[];
  clearAll: () => void;
}

export const topicStore = create<TopicStore>()(
  persist(
    (set, get) => ({
      topics: [],

      addTopic: (topic) => {
        const newTopic = {
          id: uuidv4(),
          subject: topic,
          topic: topic,
          cretedAt: new Date().toISOString(),
        };
        set((state) => ({
          topics: [...state.topics, newTopic],
        }));
      },

      removeTopic: (id) => {
        set((state) => ({
          topics: state.topics.filter((topic) => topic.id !== id),
        }));
      },

      updateTopic: (id, updates) => {
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === id ? { ...topic, ...updates } : topic
          ),
        }));
      },

      getTopics: () => get().topics,
      clearAll: () => set({ topics: [] }),
    }),
    {
      name: "topic-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
