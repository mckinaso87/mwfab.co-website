import { getQboApiBaseUrl } from "./oauth";
import type { QboClientContext } from "./client";

export type QboFaultError = {
  Message?: string;
  Detail?: string;
  code?: string;
  element?: string;
};

export class QboApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly faults: QboFaultError[] = [],
    public readonly intuitTid?: string
  ) {
    super(message);
    this.name = "QboApiError";
  }
}

function parseFaults(body: unknown): QboFaultError[] {
  if (!body || typeof body !== "object") return [];
  const fault = (body as { Fault?: { Error?: QboFaultError | QboFaultError[] } }).Fault;
  if (!fault?.Error) return [];
  return Array.isArray(fault.Error) ? fault.Error : [fault.Error];
}

export async function qboFetch<T = unknown>(
  ctx: QboClientContext,
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    query?: Record<string, string>;
  } = {}
): Promise<T> {
  const base = getQboApiBaseUrl(ctx.environment);
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${base}/v3/company/${ctx.realmId}/${normalizedPath}`);
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });

  const intuitTid = res.headers.get("intuit_tid") ?? undefined;
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const faults = parseFaults(json);
    const detail = faults
      .map((f) => {
        const parts = [f.element, f.Detail, f.Message].filter(Boolean);
        return parts.join(": ");
      })
      .filter(Boolean)
      .join("; ");
    throw new QboApiError(
      detail || `QBO API error (${res.status})`,
      res.status,
      faults,
      intuitTid
    );
  }

  return json as T;
}
