import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-charcoal border border-steel/50 shadow-xl",
          },
        }}
        fallbackRedirectUrl="/after-sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
