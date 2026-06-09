import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'navy' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  navy: 'btn-navy',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

/** Momentum primary action button. Uses the `.btn` component classes from globals.css. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', block, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn('btn', variantClass[variant], sizeClass[size], block && 'btn-block', className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
