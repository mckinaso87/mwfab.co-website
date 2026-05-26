import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

type Props = {
  searchParams: Promise<{ __clerk_ticket?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const params = await searchParams;
  const isInvitation = !!params.__clerk_ticket;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 max-w-md text-center">
        {isInvitation ? (
          <>
            <h1 className="text-2xl font-bold text-foreground">Accept your invitation</h1>
            <p className="mt-3 text-sm text-foreground-muted">
              Create your password below to finish setting up your McKinados Welding admin
              account. You will be signed in automatically when you are done.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
            <p className="mt-3 text-sm text-foreground-muted">
              Sign up is by invitation only. If you received an invite email, open that link
              again to land here with your invitation active.
            </p>
          </>
        )}
        <p className="mt-4 text-sm text-foreground-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-steel-blue underline hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-steel/50 shadow-xl",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/after-sign-in"
        forceRedirectUrl="/after-sign-in"
      />
    </div>
  );
}
