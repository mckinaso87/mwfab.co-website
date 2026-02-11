"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: formData.get("name") as string,
      company: (formData.get("company") as string) || undefined,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      projectDescription: formData.get("projectDescription") as string,
      website: formData.get("website") as string, // honeypot
    };

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-lg border border-steel/50 bg-gunmetal/50 p-6 text-foreground"
        role="status"
        aria-live="polite"
      >
        <p className="font-medium">Thank you.</p>
        <p className="mt-2 text-sm text-foreground-muted">
          We received your request and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot: hidden from users; bots may fill it */}
      <div className="absolute -left-[9999px] top-0" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Name <span className="text-steel-blue">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 block w-full rounded-md border border-steel/50 bg-gunmetal px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue"
          disabled={status === "submitting"}
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-foreground">
          Company
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          className="mt-1 block w-full rounded-md border border-steel/50 bg-gunmetal px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue"
          disabled={status === "submitting"}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email <span className="text-steel-blue">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-steel/50 bg-gunmetal px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue"
          disabled={status === "submitting"}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-1 block w-full rounded-md border border-steel/50 bg-gunmetal px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue"
          disabled={status === "submitting"}
        />
      </div>

      <div>
        <label htmlFor="projectDescription" className="block text-sm font-medium text-foreground">
          Project Description <span className="text-steel-blue">*</span>
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          required
          rows={5}
          className="mt-1 block w-full rounded-md border border-steel/50 bg-gunmetal px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue"
          disabled={status === "submitting"}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted">
          File upload (coming soon)
        </label>
        <input
          type="file"
          disabled
          aria-describedby="file-helper"
          className="mt-1 block w-full rounded-md border border-steel/30 bg-gunmetal/50 px-3 py-2 text-foreground-muted opacity-60"
        />
        <p id="file-helper" className="mt-1 text-xs text-foreground-muted">
          File upload is not yet active. You can describe attachments in your message.
        </p>
      </div>

      {status === "error" && errorMessage && (
        <p className="text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(
          "rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50"
        )}
      >
        {status === "submitting" ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
