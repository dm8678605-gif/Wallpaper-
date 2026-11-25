"use client";

import { useStore } from "./StoreProvider";

export function Price({ amount, className = "" }: { amount: number; className?: string }) {
  const { format } = useStore();
  return <span className={className}>{format(amount)}</span>;
}
