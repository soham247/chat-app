"use client";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-8 text-center h-full">
      <div className="w-[72px] h-[72px] rounded-[20px] bg-card border border-border-primary flex items-center justify-center text-[2rem] mb-2">
        {icon}
      </div>
      <div>
        <h3 className="text-text-primary font-semibold text-base mb-1.5">
          {title}
        </h3>
        {description && (
          <p className="text-text-secondary text-[0.875rem] max-w-[280px] mx-auto">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
