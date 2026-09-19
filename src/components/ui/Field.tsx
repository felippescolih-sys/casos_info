import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  warning?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, warning, hint, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {hint && !error && !warning && <p className="text-xs text-gray-500">{hint}</p>}
      {warning && !error && <p className="text-xs text-amber-600">{warning}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
