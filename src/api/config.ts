import type { CoreConfig } from "./types";

export function getCoreConfig(): CoreConfig {
  return {
    baseUrl: import.meta.env.VITE_NPODIAS_CORE_BASE_URL ?? "mock://local",
    token: import.meta.env.VITE_NPODIAS_CORE_TOKEN ?? "demo-token",
    timeoutMs: 9000
  };
}
