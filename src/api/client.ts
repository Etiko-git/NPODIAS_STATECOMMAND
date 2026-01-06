import type { ApiError, CoreConfig } from "./types";
import { MockBackend } from "./mockBackend";

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function coreRequest<T>(cfg: CoreConfig, path: string, init: RequestInit, retries = 2): Promise<T> {
  // Mock mode
  if (cfg.baseUrl.startsWith("mock://")) {
    // very small router for mock endpoints
    const actorHeader = (init.headers as any)?.["X-Actor"] ?? "L. Lawal|COMMISSIONER";
    const [name, role] = String(actorHeader).split("|");
    const actor = { name: name || "Operator", role: role || "DUTY_OFFICER" };

    if (path === "/state/bootstrap" && init.method === "GET") {
      return (await MockBackend.getBootstrap()) as any;
    }
    if (path.endsWith("/verify") && init.method === "POST") {
      const officerId = decodeURIComponent(path.split("/state/officers/")[1].split("/verify")[0]);
      return (await MockBackend.verifyOfficer(actor, officerId)) as any;
    }
    if (path.endsWith("/suspend") && init.method === "POST") {
      const officerId = decodeURIComponent(path.split("/state/officers/")[1].split("/suspend")[0]);
      const body = init.body ? JSON.parse(String(init.body)) : {};
      return (await MockBackend.suspendOfficer(actor, officerId, body.reason ?? "", body.supervisorCode ?? "")) as any;
    }
    if (path.endsWith("/assign") && init.method === "POST") {
      const incidentId = decodeURIComponent(path.split("/state/incidents/")[1].split("/assign")[0]);
      const body = init.body ? JSON.parse(String(init.body)) : {};
      return (await MockBackend.assignIncident(actor, incidentId, body.officerId ?? "")) as any;
    }
    if (path === "/state/reports/export" && init.method === "POST") {
      const body = init.body ? JSON.parse(String(init.body)) : {};
      return (await MockBackend.exportReport(actor, body.name ?? "Report")) as any;
    }

    throw { code: "MOCK_NOT_IMPLEMENTED", message: `Mock endpoint not implemented: ${init.method} ${path}` } as ApiError;
  }

  const url = `${cfg.baseUrl}${path}`;
  const timeout = cfg.timeoutMs ?? 9000;

  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const res = await fetchWithTimeout(
        url,
        {
          ...init,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cfg.token}`,
            ...(init.headers || {})
          }
        },
        timeout
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err: ApiError = {
          code: "HTTP_ERROR",
          status: res.status,
          message: text || `Request failed (${res.status})`,
          retryable: res.status >= 500
        };
        if (attempt <= retries && err.retryable) { await sleep(400 * attempt); continue; }
        throw err;
      }

      return (await res.json()) as T;
    } catch (e: any) {
      const retryable = e?.name === "AbortError" || e?.retryable;
      if (attempt <= retries && retryable) { await sleep(400 * attempt); continue; }
      throw (e?.code ? e : { code: "NETWORK", message: e?.message ?? "Network error", retryable }) as ApiError;
    }
  }
}
