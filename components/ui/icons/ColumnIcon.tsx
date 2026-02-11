export function ColumnIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      className={className}
      aria-hidden
    >
      <path d="M12 4v40M8 8h8M8 40h8M6 12h12M6 36h12" />
    </svg>
  );
}
