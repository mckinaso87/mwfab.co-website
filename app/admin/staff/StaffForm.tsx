"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { AdminFormSection } from "@/components/admin";
import { STAFF_ROLES } from "@/lib/auth-constants";
import type { User } from "@/lib/db-types";
import type { StaffActionResult } from "./actions";
import { getPendingInviteLink, revokeStaffLogin } from "./actions";
import { InviteLinkDisplay } from "./InviteLinkDisplay";

const ROLE_LABELS: Record<(typeof STAFF_ROLES)[number], string> = {
  admin: "Admin",
  estimator: "Estimator",
  office: "Office",
  read_only: "Read only",
};

type FormAction = (formData: FormData) => Promise<StaffActionResult>;

type Props = { action: FormAction; user?: User | null };

export function StaffForm({ action, user }: Props) {
  const isEdit = !!user;
  const hasLogin = !!user?.clerk_id;
  const [canLogin, setCanLogin] = useState(false);
  const [enableLoginMode, setEnableLoginMode] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [inviteLinkError, setInviteLinkError] = useState<string | null>(null);
  const [fetchedInviteUrl, setFetchedInviteUrl] = useState<string | null>(null);
  const [revokePending, startRevoke] = useTransition();
  const [inviteLinkPending, startInviteLink] = useTransition();

  const showLoginFields =
    (!isEdit && canLogin) || (isEdit && enableLoginMode && !hasLogin);

  const [state, formAction, isPending] = useActionState(
    async (_: StaffActionResult | null, formData: FormData) => action(formData),
    null as StaffActionResult | null
  );

  const displayInviteUrl = state?.inviteUrl ?? fetchedInviteUrl;

  const handleGetInviteLink = () => {
    if (!user?.id) return;
    setInviteLinkError(null);
    startInviteLink(async () => {
      const result = await getPendingInviteLink(user.id);
      if (result.error) {
        setInviteLinkError(result.error);
        setFetchedInviteUrl(null);
        return;
      }
      setFetchedInviteUrl(result.inviteUrl ?? null);
    });
  };

  const handleRevokeLogin = () => {
    if (!user?.id) return;
    if (
      !confirm(
        `Revoke login for “${user.name ?? "this staff member"}”? They will no longer be able to sign in.`
      )
    ) {
      return;
    }
    setRevokeError(null);
    startRevoke(async () => {
      const result = await revokeStaffLogin(user.id);
      if (result.error) {
        setRevokeError(result.error);
        return;
      }
      setEnableLoginMode(false);
      window.location.reload();
    });
  };

  return (
    <form action={formAction} className="space-y-8">
      {user?.id && <input type="hidden" name="user_id" value={user.id} />}
      {isEdit && enableLoginMode && !hasLogin && (
        <input type="hidden" name="enable_login" value="on" />
      )}

      <AdminFormSection
        title="Staff member"
        description={
          isEdit
            ? "Update name and role. Email cannot be changed after save."
            : "Name and role for job assignment. Enable login to invite or create a Clerk account."
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Alex"
              defaultValue={user?.name ?? ""}
              className="input-admin"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue={user?.role ?? "office"}
              className="input-admin"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection title="Login access" description="Clerk powers sign-in; role is stored in Clerk public metadata.">
        {isEdit && hasLogin && (
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              <span className="font-medium text-green-400">Login: enabled</span>
              {user?.email && (
                <span className="text-foreground-muted"> — {user.email}</span>
              )}
            </p>
            <button
              type="button"
              onClick={handleRevokeLogin}
              disabled={revokePending}
              className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {revokePending ? "Revoking…" : "Revoke login"}
            </button>
            {revokeError && (
              <p className="text-sm text-red-400">{revokeError}</p>
            )}
          </div>
        )}

        {isEdit && !hasLogin && inviteLinkError && (
          <p className="text-sm text-red-400">{inviteLinkError}</p>
        )}

        {isEdit && !hasLogin && (
          <div className="space-y-3">
            <p className="text-sm text-foreground-muted">
              Login: disabled
              {user?.email && ` (email on file: ${user.email})`}
            </p>
            {!enableLoginMode ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEnableLoginMode(true)}
                  className="rounded-lg border border-steel/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30"
                >
                  Enable login
                </button>
                {user?.email && (
                  <button
                    type="button"
                    onClick={handleGetInviteLink}
                    disabled={inviteLinkPending}
                    className="rounded-lg border border-steel/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 disabled:opacity-50"
                  >
                    {inviteLinkPending ? "Loading…" : "Get invite link"}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEnableLoginMode(false)}
                className="text-sm text-foreground-muted underline hover:text-foreground"
              >
                Cancel enable login
              </button>
            )}
          </div>
        )}

        {!isEdit && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="can_login"
              checked={canLogin}
              onChange={(e) => setCanLogin(e.target.checked)}
              className="rounded border-steel/50 bg-charcoal text-steel-blue focus:ring-steel-blue"
            />
            Can log in
          </label>
        )}

        {showLoginFields && (
          <div className="mt-4 space-y-4 border-t border-steel/50 pt-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required={showLoginFields}
                placeholder="name@example.com"
                defaultValue={user?.email ?? ""}
                readOnly={isEdit && !!user?.email}
                className="input-admin"
              />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">Invite method</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="invite_method"
                    value="invite"
                    defaultChecked
                    className="border-steel/50 text-steel-blue focus:ring-steel-blue"
                  />
                  Send invite email
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="invite_method"
                    value="password"
                    className="border-steel/50 text-steel-blue focus:ring-steel-blue"
                  />
                  Create with temporary password
                </label>
              </div>
              <p className="mt-2 text-xs text-foreground-muted">
                Invite emails are sent by Clerk. iCloud and some providers often delay or filter them;
                after submitting, copy the invite link if the email does not arrive.
              </p>
            </fieldset>
          </div>
        )}
      </AdminFormSection>

      {state?.message && displayInviteUrl && !state?.tempPassword && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {state.message}
        </div>
      )}
      {displayInviteUrl && <InviteLinkDisplay inviteUrl={displayInviteUrl} />}

      {state?.error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.message && !state?.tempPassword && !state?.inviteUrl && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {state.message}
          {!isEdit && (
            <span className="mt-2 block">
              <Link href="/admin/staff" className="underline hover:no-underline">
                Back to staff list
              </Link>
            </span>
          )}
        </div>
      )}
      {displayInviteUrl && !isEdit && (
        <p className="text-sm">
          <Link href="/admin/staff" className="text-steel-blue underline hover:no-underline">
            Back to staff list
          </Link>
        </p>
      )}
      {state?.tempPassword && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <p className="font-medium text-amber-100">Temporary password (shown once)</p>
          <p className="mt-2 font-mono text-base tracking-wide">{state.tempPassword}</p>
          <p className="mt-2 text-foreground-muted">
            Copy this password now and share it securely. It will not be shown again.
          </p>
          {state.message && <p className="mt-2 text-green-400">{state.message}</p>}
        </div>
      )}
      {state?.success && !state?.message && !state?.tempPassword && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {isEdit ? "Staff updated." : "Staff added."}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-steel/50 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-steel-blue px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          {isPending
            ? isEdit
              ? "Saving…"
              : "Adding…"
            : isEdit
              ? "Update staff"
              : "Add staff"}
        </button>
        <Link
          href="/admin/staff"
          className="rounded-lg border border-steel/50 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
