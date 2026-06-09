import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply default internal padding (`.card-pad`). */
  padded?: boolean;
  /** Enable hover lift/glow (`.card-hover`). */
  hover?: boolean;
}

/** Momentum surface card. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padded = true, hover, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card', padded && 'card-pad', hover && 'card-hover', className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';
