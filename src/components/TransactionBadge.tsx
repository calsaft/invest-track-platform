
import React from "react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/contexts/TransactionContext";

interface TransactionBadgeProps {
  status: Transaction["status"];
  className?: string;
}

export default function TransactionBadge({ status, className }: TransactionBadgeProps) {
  const statusClasses = {
    pending: "status-badge status-pending",
    approved: "status-badge status-approved",
    rejected: "status-badge status-rejected",
  };

  return (
    <span className={cn(statusClasses[status], className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
