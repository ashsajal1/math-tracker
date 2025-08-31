import { useMathStore } from "@/lib/store/mathStore";
import { topicStore } from "@/lib/store/topicStore";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { capitalize } from "@/lib/utils";

interface TopicEntry {
  subject: string;
  topic: string;
  count: number;
}

export default function MigrateTopics() {
  const { problems } = useMathStore();
  const { addTopic, topics } = topicStore();
  
  // Extract unique topics from math store
  const topicsToMigrate = useMemo(() => {
    const topicMap = new Map<string, TopicEntry>();
    
    problems.forEach(problem => {
      if (!problem.type?.subject || !problem.type?.topic) return;
      
      const key = `${problem.type.subject.toLowerCase()}:${problem.type.topic.toLowerCase()}`;
      const existing = topicMap.get(key);
      
      if (existing) {
        existing.count += 1;
      } else {
        topicMap.set(key, {
          subject: problem.type.subject.toLowerCase(),
          topic: problem.type.topic.toLowerCase(),
          count: 1
        });
      }
    });
    
    return Array.from(topicMap.values())
      .sort((a, b) => b.count - a.count);
  }, [problems]);
  
  // Check which topics already exist in the topic store
  const migrationStatus = useMemo(() => {
    return topicsToMigrate.map(entry => {
      const exists = topics.some(t => 
        t.subject.toLowerCase() === entry.subject.toLowerCase() && 
        t.topic.toLowerCase() === entry.topic.toLowerCase()
      );
      return { ...entry, exists };
    });
  }, [topicsToMigrate, topics]);
  
  const [migrated, setMigrated] = useState<Set<string>>(new Set());
  
  const handleMigrate = (entry: TopicEntry) => {
    const key = `${entry.subject}:${entry.topic}`;
    if (!migrated.has(key)) {
      addTopic(entry.subject, entry.topic);
      setMigrated(prev => new Set(prev).add(key));
    }
  };
  
  const handleMigrateAll = () => {
    const newMigrated = new Set(migrated);
    migrationStatus.forEach(({ subject, topic, exists }) => {
      const key = `${subject}:${topic}`;
      if (!exists && !newMigrated.has(key)) {
        addTopic(subject, topic);
        newMigrated.add(key);
      }
    });
    setMigrated(newMigrated);
  };
  
  const needsMigration = migrationStatus.some(({ exists }) => !exists);
  
  if (!needsMigration && migrated.size === 0) {
    return null;
  }
  
  return (
    <Card className="p-4 mb-6 border-yellow-500/20 bg-yellow-50 dark:bg-yellow-900/20">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
              Found {migrationStatus.filter(s => !s.exists).length} unmigrated topics
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              We found some topics in your practice history that aren't in your topic list yet.
              Would you like to migrate them?
            </p>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {migrationStatus.map(({ subject, topic, count, exists }, index) => {
              if (exists) return null;
              const key = `${subject}:${topic}`;
              const isMigrated = migrated.has(key);
              
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-gray-800/50 text-sm"
                >
                  <div>
                    <span className="font-medium">{capitalize(topic)}</span>
                    <span className="text-muted-foreground ml-2">
                      in {capitalize(subject)} • {count} {count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                  {isMigrated ? (
                    <span className="inline-flex items-center text-green-600 dark:text-green-400 text-sm">
                      <Check className="w-4 h-4 mr-1" /> Migrated
                    </span>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMigrate({ subject, topic, count })}
                    >
                      Add to Topics
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMigrateAll}
              disabled={!needsMigration}
            >
              Migrate All
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}