import OAuthClient from "intuit-oauth";
import { getQboOAuthEnv } from "@/lib/env";

export function createOAuthClient(): OAuthClient {
  const { clientId, clientSecret, redirectUri, environment } = getQboOAuthEnv();
  return new OAuthClient({
    clientId,
    clientSecret,
    redirectUri,
    environment,
    logging: false,
  });
}

export const QBO_ACCOUNTING_SCOPE = OAuthClient.scopes.Accounting;

export function getQboApiBaseUrl(environment: "sandbox" | "production"): string {
  return environment === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
}

export function getQboAppEstimateUrl(
  environment: "sandbox" | "production",
  estimateId: string
): string {
  if (environment === "sandbox") {
    return `https://app.sandbox.qbo.intuit.com/app/estimate?txnId=${estimateId}`;
  }
  return `https://app.qbo.intuit.com/app/estimate?txnId=${estimateId}`;
}
