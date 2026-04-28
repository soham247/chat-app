"use client";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "var(--radius-sm)",
  style,
}: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3.5 px-4 w-full">
      <Skeleton width="44px" height="44px" borderRadius="50%" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton width="60%" height="0.875rem" />
        <Skeleton width="85%" height="0.75rem" />
      </div>
    </div>
  );
}

export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 py-1 px-4 ${isOwn ? 'items-end' : 'items-start'}`}>
      <Skeleton
        width={`${Math.floor(Math.random() * 50) + 25}%`}
        height="2.5rem"
        borderRadius="var(--radius-lg)"
      />
    </div>
  );
}
