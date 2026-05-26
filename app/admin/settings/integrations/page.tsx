import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { getConnectionStatus } from "@/lib/qbo/connection-store";
import { getQboSyncEnv, isQboOAuthConfigured, env } from "@/lib/env";
import { QboConnectButton, QboDisconnectForm } from "./QboIntegrationPanel";

export const metadata: Metadata = {
  title: "Integrations | Settings | Admin | McKinados Welding & Fabrication",
  robots: "noindex, nofollow",
};

export default async function IntegrationsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const connection = await getConnectionStatus();
  const oauthConfigured = isQboOAuthConfigured();
  const syncConfigured = getQboSyncEnv() !== null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Integrations"
        subtitle="Connect QuickBooks Online to sync customers and push estimates."
        actions={
          <Link
            href="/admin/settings"
            className="text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            ← Settings
          </Link>
        }
      />

      {params.connected === "1" && (
        <p className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          QuickBooks connected successfully.
        </p>
      )}
      {params.error && (
        <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Connection failed: {params.error}
        </p>
      )}

      <AdminSectionCard title="QuickBooks Online">
        {connection.connected ? (
          <div className="space-y-2 text-sm text-foreground">
            <p>
              <span className="text-foreground-muted">Status:</span>{" "}
              <span className="font-medium text-admin-teal">Connected</span>
            </p>
            {connection.companyName && (
              <p>
                <span className="text-foreground-muted">Company:</span> {connection.companyName}
              </p>
            )}
            {connection.realmId && (
              <p>
                <span className="text-foreground-muted">Realm ID:</span> {connection.realmId}
              </p>
            )}
            {connection.accessTokenExpiresAt && (
              <p className="text-foreground-muted">
                Access token expires:{" "}
                {new Date(connection.accessTokenExpiresAt).toLocaleString()}
              </p>
            )}
            <QboDisconnectForm />
          </div>
        ) : (
          <div>
            <p className="text-sm text-foreground-muted">
              Connect your QuickBooks company to push customers and estimates from the admin panel.
            </p>
            <QboConnectButton configured={oauthConfigured} />
          </div>
        )}

        <div className="mt-6 border-t border-steel/30 pt-4 text-sm text-foreground-muted">
          <p className="font-medium text-foreground">Estimate push configuration</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>OAuth: {oauthConfigured ? "configured" : "missing env vars"}</li>
            <li>
              Default item + tax code:{" "}
              {syncConfigured
                ? "configured"
                : "set QBO_DEFAULT_ITEM_ID and QBO_LINE_TAX_CODE (TAX or NON)"}
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-admin-amber/40 bg-admin-amber/10 px-4 py-4 text-sm text-foreground">
          <p className="font-semibold text-admin-amber">
            Error: &quot;There is no sandbox companies found for the user&quot;
          </p>
          <p className="mt-2 text-foreground-muted">
            Your Intuit login has no <strong>sandbox</strong> QuickBooks company linked to this
            developer account. Fix it in the portal (not in .env):
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground-muted">
            <li>
              Open{" "}
              <a
                href="https://developer.intuit.com/app/developer/sandbox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-admin-teal underline"
              >
                developer.intuit.com → Sandbox companies
              </a>{" "}
              (or top nav <strong>My Hub → Sandboxes</strong>).
            </li>
            <li>
              Click <strong>Add</strong> / <strong>Create</strong> and provision a{" "}
              <strong>QuickBooks Online</strong> sandbox company (e.g. Plus).
            </li>
            <li>
              Wait a few minutes if it was just created, then sign in to that sandbox once at{" "}
              <a
                href="https://app.sandbox.qbo.intuit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-admin-teal underline"
              >
                app.sandbox.qbo.intuit.com
              </a>{" "}
              using the sandbox test user shown in the portal.
            </li>
            <li>
              Click <strong>Connect QuickBooks</strong> here again and sign in with the{" "}
              <strong>same Intuit developer account</strong> that owns the sandbox — not a unrelated
              production QBO login.
            </li>
          </ol>
          <p className="mt-3 text-foreground-muted">
            Do <strong>not</strong> use a live/trial QBO company with Development keys. For a real
            company later, use Production keys and <code className="text-foreground">QBO_ENVIRONMENT=production</code>.
          </p>
        </div>

        <div className="mt-6 border-t border-steel/30 pt-4 text-sm text-foreground-muted">
          <p className="font-medium text-foreground">If Intuit says &quot;didn&apos;t connect&quot;</p>
          <ol className="mt-2 list-inside list-decimal space-y-2">
            <li>
              In the{" "}
              <a
                href="https://developer.intuit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-admin-teal underline"
              >
                Intuit Developer Portal
              </a>
              , open your app → <strong>Keys &amp; credentials</strong> →{" "}
              <strong>Development</strong> (not Production).
            </li>
            <li>
              Under <strong>Redirect URIs</strong>, add exactly:{" "}
              <code className="rounded bg-charcoal/60 px-1.5 py-0.5 text-foreground">
                {env.qbo.redirectUri ?? "http://localhost:3000/api/qbo/callback"}
              </code>
            </li>
            <li>
              Use the <strong>Development</strong> Client ID and Client Secret in{" "}
              <code className="rounded bg-charcoal/60 px-1.5 py-0.5">.env.local</code> with{" "}
              <code className="rounded bg-charcoal/60 px-1.5 py-0.5">QBO_ENVIRONMENT=sandbox</code>.
            </li>
            <li>
              Under <strong>Sandbox</strong> / test companies, ensure a sandbox company exists; connect
              using that company (e.g. MWF Sandbox), not a live QuickBooks file.
            </li>
            <li>
              Open the app at{" "}
              <code className="rounded bg-charcoal/60 px-1.5 py-0.5">http://localhost:3000</code>{" "}
              (not 127.0.0.1) so it matches the redirect URI.
            </li>
            <li>After fixing, click Connect again in one browser tab (allow cookies).</li>
          </ol>
          <p className="mt-3">
            If you reach this page with a red error below, the callback ran — copy that message for
            debugging.
          </p>
        </div>
      </AdminSectionCard>
    </div>
  );
}
