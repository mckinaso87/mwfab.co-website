"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { getCountySelectOptions } from "@/lib/licenses";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const PROJECT_TYPES = [
  "Structural Steel",
  "Ornamental Steel",
  "Finishes",
  "Repair / Other",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTY_OPTIONS = getCountySelectOptions();

const inputClass =
  "block w-full rounded-xl border border-steel/40 bg-gunmetal/40 px-4 text-foreground placeholder:text-foreground-muted focus:border-steel-blue focus:outline-none focus:ring-2 focus:ring-steel-blue/30 disabled:cursor-not-allowed disabled:opacity-60 h-12 lg:h-14";

const labelClass =
  "mb-2 block text-xs font-medium uppercase tracking-wide text-foreground-muted";

function RequiredDot() {
  return (
    <span className="text-steel-blue" aria-hidden>
      {" "}
      ·
    </span>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function validateField(name: string, value: string): string {
  switch (name) {
    case "name":
      return value.trim() ? "" : "Name is required.";
    case "email":
      if (!value.trim()) return "Email is required.";
      return EMAIL_RE.test(value.trim()) ? "" : "Enter a valid email address.";
    case "projectDescription": {
      const trimmed = value.trim();
      if (!trimmed) return "Project description is required.";
      if (trimmed.length < 20) return "Please provide at least 20 characters.";
      return "";
    }
    default:
      return "";
  }
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  function showError(field: string): boolean {
    return (touched[field] || submitAttempted) && Boolean(errors[field]);
  }

  function handleBlur(field: string, value: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  }

  function validateAll(form: HTMLFormElement): boolean {
    const next: Record<string, string> = {};
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const projectDescription = (form.elements.namedItem("projectDescription") as HTMLTextAreaElement)
      .value;
    next.name = validateField("name", name);
    next.email = validateField("email", email);
    next.projectDescription = validateField("projectDescription", projectDescription);
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitAttempted(true);

    if (!validateAll(form)) {
      return;
    }

    const formData = new FormData(form);
    const body = {
      name: formData.get("name") as string,
      company: (formData.get("company") as string) || undefined,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      projectType: (formData.get("projectType") as string) || undefined,
      county: (formData.get("county") as string) || undefined,
      projectDescription: formData.get("projectDescription") as string,
      website: formData.get("website") as string,
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
      setTouched({});
      setErrors({});
      setSubmitAttempted(false);
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <Reveal>
        <div className="flex flex-col items-center py-12 text-center" role="status" aria-live="polite">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-steel-blue"
            aria-hidden
          >
            <svg
              className="h-7 w-7 text-steel-blue"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-foreground">Request received</h2>
          {/* TODO: confirm response time with operations team */}
          <p className="mt-3 max-w-sm text-foreground-muted">
            Thank you. We typically respond within 1–2 business days with questions or next steps.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-8 text-sm font-medium text-steel-blue transition-colors hover:text-foreground"
          >
            Send another
          </button>
        </div>
      </Reveal>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="absolute -left-[9999px] top-0" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
            <RequiredDot />
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
            disabled={status === "submitting"}
            aria-invalid={showError("name")}
            aria-describedby={showError("name") ? "name-error" : undefined}
            onBlur={(e) => handleBlur("name", e.target.value)}
          />
          {showError("name") && (
            <p id="name-error" className="mt-1.5 text-sm text-red-400/90" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            className={inputClass}
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
            <RequiredDot />
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            disabled={status === "submitting"}
            aria-invalid={showError("email")}
            aria-describedby={showError("email") ? "email-error" : undefined}
            onBlur={(e) => handleBlur("email", e.target.value)}
          />
          {showError("email") && (
            <p id="email-error" className="mt-1.5 text-sm text-red-400/90" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            disabled={status === "submitting"}
          />
        </div>
      </div>

      <div>
        <label htmlFor="projectType" className={labelClass}>
          Project Type
        </label>
        <select
          id="projectType"
          name="projectType"
          className={cn(inputClass, "appearance-none")}
          disabled={status === "submitting"}
          defaultValue=""
        >
          <option value="" disabled>
            Select a project type
          </option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="county" className={labelClass}>
          County
        </label>
        <select
          id="county"
          name="county"
          className={cn(inputClass, "appearance-none")}
          disabled={status === "submitting"}
          defaultValue=""
        >
          <option value="" disabled>
            Select a county
          </option>
          {COUNTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="projectDescription" className={labelClass}>
          Project Description
          <RequiredDot />
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          required
          rows={6}
          className={cn(
            inputClass,
            "min-h-32 resize-y py-3 lg:h-auto lg:min-h-32"
          )}
          disabled={status === "submitting"}
          aria-invalid={showError("projectDescription")}
          aria-describedby={
            showError("projectDescription") ? "projectDescription-error" : "projectDescription-hint"
          }
          onBlur={(e) => handleBlur("projectDescription", e.target.value)}
        />
        {showError("projectDescription") ? (
          <p id="projectDescription-error" className="mt-1.5 text-sm text-red-400/90" role="alert">
            {errors.projectDescription}
          </p>
        ) : (
          <p id="projectDescription-hint" className="mt-2 text-xs text-foreground-muted">
            You can mention drawings or attachments in your message. We&apos;ll reply with an
            upload link if needed.
          </p>
        )}
      </div>

      {status === "error" && errorMessage && (
        <p className="text-sm text-red-400/90" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(
          "flex h-12 w-full min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-steel-blue px-8 text-sm font-semibold tracking-wide text-charcoal transition-colors hover:bg-steel-blue/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        )}
      >
        {status === "submitting" ? (
          <>
            <Spinner />
            Sending…
          </>
        ) : (
          "Submit Request"
        )}
      </button>
    </form>
  );
}
