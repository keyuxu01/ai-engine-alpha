// track from https://ui.shadcn.com/docs/components/badge
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          {
            'bg-gray-900 text-white hover:bg-gray-800':
              variant === 'default',
            'bg-gray-100 text-gray-900 hover:bg-gray-200':
              variant === 'secondary',
            'border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100': 
              variant === 'outline',
            'bg-red-500 text-white hover:bg-red-600':
              variant === 'destructive',
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';
