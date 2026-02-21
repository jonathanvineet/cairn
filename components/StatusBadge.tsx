"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export type InspectionStatus = "intact" | "anomaly" | "breach";

const statusConfig: Record<
  InspectionStatus,
  { label: string; icon: React.ReactNode; variant: "intact" | "anomaly" | "breach" }
> = {
  intact: {
    label: "Intact",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    variant: "intact",
  },
  anomaly: {
    label: "Anomaly",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    variant: "anomaly",
  },
  breach: {
    label: "Breach",
    icon: <XCircle className="h-3.5 w-3.5" />,
    variant: "breach",
  },
};

interface StatusBadgeProps {
  status: InspectionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
