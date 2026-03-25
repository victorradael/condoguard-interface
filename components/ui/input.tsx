import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={[
          "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm",
          "text-text-primary placeholder:text-text-muted",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-danger focus:ring-danger" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
