import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-white",
        intact: "bg-green-500/15 text-green-400 border border-green-500/20",
        anomaly: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        breach: "bg-red-500/15 text-red-400 border border-red-500/20",
        info: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        outline: "border border-white/20 text-gray-300",
        blockchain: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
