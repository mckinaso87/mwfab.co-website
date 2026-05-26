"use client";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function TakeoffSlideOver({ title, onClose, children, footer }: Props) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-overlay-bg backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-steel/50 bg-gunmetal shadow-xl">
        <div className="flex items-center justify-between border-b border-steel/50 px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-foreground-muted hover:bg-steel/50"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer && (
            <div className="border-t border-steel/50 px-4 py-3 flex gap-2 justify-end shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
