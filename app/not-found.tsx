import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="mt-2 text-foreground-muted">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel"
      >
        Go home
      </Link>
    </div>
  );
}
