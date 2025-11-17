import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export default function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-gray-50 rounded-xl p-3 text-center transition-all duration-200 hover:bg-gray-100',
        className
      )}
    >
      {icon && <div className="flex justify-center mb-2">{icon}</div>}
      <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

