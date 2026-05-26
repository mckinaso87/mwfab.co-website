import type { Customer } from "@/lib/db-types";

const MAX_NOTES = 4000;
const MAX_DISPLAY_NAME = 500;

export type QboCustomerPayload = {
  DisplayName: string;
  GivenName?: string;
  FamilyName?: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: { Line1: string };
  Notes?: string;
  Active: boolean;
  Id?: string;
  SyncToken?: string;
};

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max - 3) + "...";
}

function splitContactName(contactName: string | null): {
  givenName?: string;
  familyName?: string;
} {
  if (!contactName?.trim()) return {};
  const parts = contactName.trim().split(/\s+/);
  if (parts.length === 1) return { givenName: parts[0] };
  return { givenName: parts[0], familyName: parts.slice(1).join(" ") };
}

export function buildDisplayName(customer: Customer, suffix?: string): string {
  let name = customer.company_name.trim();
  if (suffix) name = `${name} (${suffix})`;
  return truncate(name, MAX_DISPLAY_NAME);
}

export function mapCustomerToQbo(
  customer: Customer,
  options?: { displayNameSuffix?: string; includeIds?: boolean }
): QboCustomerPayload {
  const { givenName, familyName } = splitContactName(customer.contact_name);
  const payload: QboCustomerPayload = {
    DisplayName: buildDisplayName(customer, options?.displayNameSuffix),
    Active: true,
  };

  if (givenName) payload.GivenName = truncate(givenName, 100);
  if (familyName) payload.FamilyName = truncate(familyName, 100);
  if (customer.company_name) payload.CompanyName = truncate(customer.company_name.trim(), 100);

  if (customer.email?.trim()) {
    payload.PrimaryEmailAddr = { Address: customer.email.trim() };
  }
  if (customer.phone?.trim()) {
    payload.PrimaryPhone = { FreeFormNumber: customer.phone.trim() };
  }
  if (customer.address?.trim()) {
    payload.BillAddr = { Line1: truncate(customer.address.trim(), 500) };
  }
  if (customer.notes?.trim()) {
    payload.Notes = truncate(customer.notes.trim(), MAX_NOTES);
  }

  if (options?.includeIds && customer.qbo_customer_id) {
    payload.Id = customer.qbo_customer_id;
    if (customer.qbo_sync_token) payload.SyncToken = customer.qbo_sync_token;
  }

  return payload;
}
