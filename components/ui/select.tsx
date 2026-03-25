import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, id, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={[
          "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm",
          "text-text-primary",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-danger focus:ring-danger" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
