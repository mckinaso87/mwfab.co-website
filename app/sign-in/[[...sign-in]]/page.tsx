import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        <p className="mt-3 text-sm text-foreground-muted">
          Use the account you created from your invitation email.
        </p>
        <p className="mt-4 text-sm text-foreground-muted">
          Need to set up your account?{" "}
          <Link href="/sign-up" className="text-steel-blue underline hover:no-underline">
            Accept invitation
          </Link>
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-steel/50 shadow-xl",
          },
        }}
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl="/after-sign-in"
        forceRedirectUrl="/after-sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
