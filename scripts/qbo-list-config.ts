/**
 * List QBO Service items and TaxCodes using the connected sandbox/production company.
 * Copy Item Id to QBO_DEFAULT_ITEM_ID and set QBO_LINE_TAX_CODE=TAX or NON for US companies.
 *
 * Usage: npm run qbo:list-config
 * Requires: QBO connected (qbo_connections row) + env from .env.local
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    console.error("(Same vars your dev server uses — add them if the script can't see them.)");
    process.exit(1);
  }

  // Dynamic import after dotenv — static imports would load lib/env before .env.local applies
  const { getQboClient } = await import("../lib/qbo/client");
  const { qboFetch } = await import("../lib/qbo/request");

  const ctx = await getQboClient();
  if (!ctx) {
    console.error("No QBO connection found. Connect at /admin/settings/integrations first.");
    process.exit(1);
  }

  console.log(`Realm: ${ctx.realmId} (${ctx.environment})\n`);

  const items = await qboFetch<{
    QueryResponse?: { Item?: { Id: string; Name: string; Type?: string }[] };
  }>(ctx, "query", {
    method: "GET",
    query: {
      query: "select Id, Name, Type from Item where Type = 'Service' maxresults 100",
      minorversion: "65",
    },
  });

  const itemList = items.QueryResponse?.Item ?? [];
  console.log("Service items (use Id for QBO_DEFAULT_ITEM_ID):");
  if (itemList.length === 0) {
    console.log("  (none — create a Service item in QBO → Products and services)");
  } else {
    for (const row of itemList) {
      console.log(`  ${row.Id}\t${row.Name}`);
    }
  }

  const tax = await qboFetch<{
    QueryResponse?: { TaxCode?: { Id: string; Name?: string; Description?: string }[] };
  }>(ctx, "query", {
    method: "GET",
    query: {
      query: "select Id, Name, Description from TaxCode maxresults 100",
      minorversion: "65",
    },
  });

  const taxList = tax.QueryResponse?.TaxCode ?? [];
  console.log("\nTax codes in company (reference only):");
  if (taxList.length === 0) {
    console.log("  (none — set up sales tax in QBO sandbox → Settings → Taxes)");
  } else {
    for (const row of taxList) {
      const label = row.Name ?? row.Description ?? "—";
      console.log(`  ${row.Id}\t${label}`);
    }
  }

  console.log("\nFor US companies, estimate lines use QBO_LINE_TAX_CODE=TAX or NON (not numeric Ids above).");
  console.log("Example .env.local:");
  console.log("  QBO_DEFAULT_ITEM_ID=1");
  console.log("  QBO_LINE_TAX_CODE=TAX");
  console.log("\nRestart npm run dev after updating .env.local.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
