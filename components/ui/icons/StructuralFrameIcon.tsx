export function StructuralFrameIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      className={className}
      aria-hidden
    >
      <rect x="8" y="8" width="32" height="32" />
      <path d="M8 24h32M24 8v32M8 8l16 16 16-16M8 40l16-16 16 16" />
    </svg>
  );
}
