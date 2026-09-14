export default function Loading() {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-sm">
      <span className="h-3 w-3 animate-pulse rounded-full bg-current" />
      loading…
    </span>
  );
}
