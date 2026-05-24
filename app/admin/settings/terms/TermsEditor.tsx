"use client";

import { useActionState, useState } from "react";
import { saveTerms } from "./actions";
import { renderMarkdownToHtml } from "@/lib/render-markdown";

type Props = { initialBody: string; version: number };

export function TermsEditor({ initialBody, version }: Props) {
  const [body, setBody] = useState(initialBody);
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => saveTerms(formData),
    null as { error?: string } | null
  );
  const previewHtml = renderMarkdownToHtml(body);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-2">
      <div>
        <label htmlFor="body_md" className="block text-sm font-medium text-foreground mb-2">
          Markdown body
        </label>
        <textarea
          id="body_md"
          name="body_md"
          rows={24}
          className="input-admin w-full font-mono text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="mt-2 text-xs text-foreground-muted">
          Saving bumps version from {version} to {version + 1}.
        </p>
        {state?.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
        {!state?.error && state !== null && (
          <p className="mt-2 text-sm text-green-400">Saved.</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="btn-admin-primary mt-4 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save terms"}
        </button>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">Preview</h2>
        <div
          className="rounded-xl border border-steel/50 bg-card p-6 prose prose-sm max-w-none text-foreground [&_h2]:text-base [&_h2]:font-semibold"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </form>
  );
}
