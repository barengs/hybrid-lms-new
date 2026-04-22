import { cn } from '@/lib/utils';
import { forwardRef, type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = 'md', hover = false, onClick }, ref) => {
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700',
          paddingStyles[padding],
          hover && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
          onClick && 'cursor-pointer',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}>{children}</h3>;
}

function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}>{children}</p>;
}

function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-4 pt-4 border-t border-gray-100 dark:border-gray-700', className)}>{children}</div>;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
