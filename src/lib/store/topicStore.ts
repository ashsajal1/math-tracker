import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type TopicPriority = 'high' | 'medium' | 'low';

export interface Topic {
  id: string;
  subject: string;
  topic: string;
  priority: TopicPriority;
  points?: number;
  cretedAt: string;
}

interface TopicStore {
  topics: Topic[];
  addTopic: (subject: string, topic: string, priority?: TopicPriority, points?: number) => void;
  removeTopic: (id: string) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  getTopics: () => Topic[];
  getTopicsByPriority: (priority: TopicPriority) => Topic[];
  clearAll: () => void;
}

export const topicStore = create<TopicStore>()(
  devtools(
    persist(
      (set, get) => ({
        topics: [],

        addTopic: (subject, topic, priority = 'medium', points = 5) => {
          const newTopic: Topic = {
            id: uuidv4(),
            subject: subject.toLocaleLowerCase(),
            topic: topic.toLocaleLowerCase(),
            priority,
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
        
        getTopicsByPriority: (priority) => {
          return get().topics.filter((topic) => topic.priority === priority);
        },
        
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
