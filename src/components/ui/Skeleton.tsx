import { motion } from 'framer-motion';

export function HabitSkeleton() {
  return (
    <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-50 flex items-center gap-4 animate-pulse">
      <div className="w-14 h-14 bg-gray-100 rounded-3xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded-full w-2/3" />
        <div className="h-2 bg-gray-50 rounded-full w-1/3" />
      </div>
      <div className="w-10 h-10 bg-gray-100 rounded-full" />
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-50 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-3xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded-full w-3/4" />
          <div className="h-2 bg-gray-50 rounded-full w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-gray-50 rounded-full w-full" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-100 animate-pulse rounded-md ${className}`} />
  );
}
