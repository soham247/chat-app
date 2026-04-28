"use client";

export function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : "Several people are typing";

  return (
    <div className="animate-fade-in flex items-center gap-2 py-1.5 px-4 text-text-muted text-[0.8rem] italic">
      <div className="flex gap-[3px] items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot w-[5px] h-[5px] rounded-full bg-accent-primary block"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span>{label}…</span>
    </div>
  );
}
