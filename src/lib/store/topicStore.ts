import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

interface Topic {
  id: string;
  subject: string;
  topic: string;
  points?: number;
  cretedAt: string;
}

interface TopicStore {
  topics: Topic[];
  addTopic: (subject: string, topic: string, points?: number) => void;
  removeTopic: (id: string) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  getTopics: () => Topic[];
  clearAll: () => void;
}

export const topicStore = create<TopicStore>()(
  devtools(
    persist(
      (set, get) => ({
        topics: [],

        addTopic: (subject, topic, points = 5) => {
          const newTopic = {
            id: uuidv4(),
            subject: subject.toLocaleLowerCase(),
            topic: topic.toLocaleLowerCase(),
            points,
            cretedAt: new Date().toISOString(),
          };
          set(
            (state) => ({
              topics: [...state.topics, newTopic],
            }),
            false,
            'topic/addTopic'
          );
        },

        removeTopic: (id) => {
          set(
            (state) => ({
              topics: state.topics.filter((topic) => topic.id !== id),
            }),
            false,
            'topic/removeTopic'
          );
        },

        updateTopic: (id, updates) => {
          set(
            (state) => ({
              topics: state.topics.map((topic) =>
                topic.id === id ? { ...topic, ...updates } : topic
              ),
            }),
            false,
            'topic/updateTopic'
          );
        },

        getTopics: () => get().topics,
        
        clearAll: () => set({ topics: [] }, false, 'topic/clearAll'),
      }),
      {
        name: "topic-store",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    {
      name: 'topicStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);
