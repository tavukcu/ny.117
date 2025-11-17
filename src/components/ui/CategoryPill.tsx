import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryPillProps {
  id: string;
  name: string;
  icon?: string | ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function CategoryPill({
  id,
  name,
  icon,
  href,
  onClick,
  className
}: CategoryPillProps) {
  const baseClasses = 'rounded-full px-3 py-1.5 border text-sm flex items-center gap-2 transition-all duration-200 hover:bg-green-50 hover:border-green-500';
  
  const content = (
    <>
      {icon && <span className="text-base">{icon}</span>}
      <span className="font-medium">{name}</span>
      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseClasses, 'group border-gray-200 text-gray-700', className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(baseClasses, 'group border-gray-200 text-gray-700', className)}
    >
      {content}
    </button>
  );
}

