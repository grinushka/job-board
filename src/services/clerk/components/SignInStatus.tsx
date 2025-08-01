import { ReactNode, Suspense } from "react";
import {
  SignedOut as ClerkSignedOut,
  SignedIn as ClerkSignedIn,
} from "@clerk/nextjs";

export function SignedOut({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense>
      <ClerkSignedOut>
        {children}
      </ClerkSignedOut>
    </Suspense>
  );
}

export function SignedIn({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense>
      <ClerkSignedIn>
        {children}
      </ClerkSignedIn>
    </Suspense>
  );
}
