import { Trash2, Calendar, BookOpen, FileQuestion } from "lucide-react";

type QuizQ = {
  id: number;
  question: string;
  options: string[];
  answer: string;
};

type QuestionsBatch = {
  id: string;
  questions: QuizQ[];
  title: string;
  topic: string;
  chapter: string;
  createdAt: string;
};

type SavedBatchCardProps = {
  batch: QuestionsBatch;
  onLoad: (batch: QuestionsBatch) => void;
  onDelete: (id: string) => void;
};

function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function SavedBatchCard({
  batch,
  onLoad,
  onDelete,
}: SavedBatchCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${batch.title}"?`)) {
      onDelete(batch.id);
    }
  };

  return (
    <div
      onClick={() => onLoad(batch)}
      className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-neutral-800 dark:to-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-blue-400 dark:hover:border-blue-600"
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
        aria-label="Delete batch"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Title */}
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 pr-8 line-clamp-2">
        {batch.title}
      </h3>

      {/* Metadata Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
          <BookOpen className="w-3 h-3" />
          {batch.topic}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          {batch.chapter}
        </span>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <FileQuestion className="w-3.5 h-3.5" />
          <span>{batch.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(batch.createdAt)}</span>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
    </div>
  );
}
