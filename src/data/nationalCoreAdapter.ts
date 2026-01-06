export type ApiError = {
  code: string;
  message: string;
  status?: number;
  retryable?: boolean;
};

export type CoreConfig = {
  baseUrl: string;
  token: string;
  timeoutMs?: number;
};

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function coreRequest<T>(
  cfg: CoreConfig,
  path: string,
  init: RequestInit,
  retries = 2
): Promise<T> {
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
        if (attempt <= retries && err.retryable) {
          await sleep(500 * attempt);
          continue;
        }
        throw err;
      }

      return (await res.json()) as T;
    } catch (e: any) {
      const retryable = e?.name === "AbortError" || e?.retryable;
      if (attempt <= retries && retryable) {
        await sleep(500 * attempt);
        continue;
      }
      throw (e?.code
        ? e
        : { code: "NETWORK", message: e?.message ?? "Network error", retryable }) as ApiError;
    }
  }
}

export const NationalCore = {
  async pushAudit(cfg: CoreConfig, payload: any) {
    return coreRequest<{ ok: true }>(cfg, "/state/audit/push", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async verifyOfficer(cfg: CoreConfig, officerId: string) {
    return coreRequest<{ ok: true }>(
      cfg,
      `/state/officers/${encodeURIComponent(officerId)}/verify`,
      { method: "POST" }
    );
  },
  async suspendOfficer(cfg: CoreConfig, officerId: string, reason: string, supervisorCode: string) {
    return coreRequest<{ ok: true }>(
      cfg,
      `/state/officers/${encodeURIComponent(officerId)}/suspend`,
      { method: "POST", body: JSON.stringify({ reason, supervisorCode }) }
    );
  },
  async assignIncident(cfg: CoreConfig, incidentId: string, officerId: string) {
    return coreRequest<{ ok: true }>(
      cfg,
      `/state/incidents/${encodeURIComponent(incidentId)}/assign`,
      { method: "POST", body: JSON.stringify({ officerId }) }
    );
  }
};
