"use client";

import { ClerkProvider as Clerk } from "@clerk/nextjs";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return <>{children}</>;
  }
  return (
    <Clerk
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/after-sign-in"
      afterSignUpUrl="/after-sign-in"
    >
      {children}
    </Clerk>
  );
}
