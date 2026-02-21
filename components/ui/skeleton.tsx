import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white/5 animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
