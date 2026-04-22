import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
}

function Rating({
  value,
  max = 5,
  size = 'md',
  showValue = true,
  showCount = false,
  count = 0,
  className,
}: RatingProps) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star
              key={`full-${i}`}
              className={cn(sizes[size], 'text-yellow-400 fill-yellow-400')}
            />
          ))}
        {hasHalfStar && (
          <StarHalf className={cn(sizes[size], 'text-yellow-400 fill-yellow-400')} />
        )}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`empty-${i}`} className={cn(sizes[size], 'text-gray-300')} />
          ))}
      </div>
      {showValue && (
        <span className={cn(textSizes[size], 'font-medium text-gray-700')}>{value.toFixed(1)}</span>
      )}
      {showCount && count > 0 && (
        <span className={cn(textSizes[size], 'text-gray-500')}>({count.toLocaleString()})</span>
      )}
    </div>
  );
}

export { Rating };
