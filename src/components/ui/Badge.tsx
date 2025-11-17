import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'green' | 'yellow' | 'gray';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-green-100 text-green-700 border-green-200',
    green: 'bg-green-500 text-white border-green-600',
    yellow: 'bg-yellow-400 text-gray-900 border-yellow-500',
    gray: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

