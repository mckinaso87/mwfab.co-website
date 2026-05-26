import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { getConnectionStatus } from "@/lib/qbo/connection-store";
import { isQboOAuthConfigured } from "@/lib/env";
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
      {connection.tokenError && (
        <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {connection.tokenError}
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
            {connection.tokenError && connection.realmId && (
              <p className="mb-3 text-sm text-foreground-muted">
                Previous connection (realm {connection.realmId}
                {connection.companyName ? ` — ${connection.companyName}` : ""}) must be cleared
                before reconnecting.
              </p>
            )}
            <p className="text-sm text-foreground-muted">
              Connect your QuickBooks company to push customers and estimates from the admin panel.
            </p>
            {(connection.tokenError || oauthConfigured) && (
              <QboDisconnectForm />
            )}
            <QboConnectButton configured={oauthConfigured} />
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
}
