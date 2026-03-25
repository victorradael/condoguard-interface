interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={["rounded-lg border border-border bg-surface p-6", "shadow-card", className].join(
        " "
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return <div className={`mb-4 flex items-center justify-between ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: CardProps) {
  return <h2 className={`text-lg font-semibold text-text-primary ${className}`}>{children}</h2>;
}
