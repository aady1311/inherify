'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { value?: number | null; max?: number }
>(({ className, value, max = 100, ...props }, ref) => {
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  const boundedValue = Math.min(Math.max(safeValue, 0), max);
  const percent = max > 0 ? (boundedValue / max) * 100 : 0;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={boundedValue}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percent}%)` }}
      />
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };
