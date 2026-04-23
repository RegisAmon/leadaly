"use client";

import { ClerkProvider as Cp } from "@clerk/nextjs";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <Cp>{children}</Cp>;
}
