import React from 'react';
import { cn } from '@/lib/utils';

export interface FieldProps {
  label?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

/** Labelled form field wrapper. Pass an Input/Select/Textarea as children. */
export function Field({ label, required, hint, error, htmlFor, className, children }: FieldProps) {
  return (
    <div className={cn('field', Boolean(error) && 'field-error', className)}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {(error || hint) && <span className="field-hint">{error || hint}</span>}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn('input', className)} {...props} />,
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn('textarea', className)} {...props} />,
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn('select', className)} {...props} />,
);
Select.displayName = 'Select';
