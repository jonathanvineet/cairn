import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: number; max?: number }
>(({ className, value, max = 100, ...props }, ref) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/10", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
