"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

function UserIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export function HeaderAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    );
  }

  return (
    <SignInButton mode="redirect" forceRedirectUrl="/sign-in">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-steel/50 hover:text-foreground"
        aria-label="Sign in"
      >
        <UserIcon />
      </button>
    </SignInButton>
  );
}
