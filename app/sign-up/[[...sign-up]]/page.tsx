import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-charcoal border border-steel/50 shadow-xl",
          },
        }}
        fallbackRedirectUrl="/admin"
        signInUrl="/sign-in"
      />
    </div>
  );
}
