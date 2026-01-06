export type QueuedAction =
  | { type: "VERIFY"; officerId: string; ts: number }
  | { type: "ASSIGN"; incidentId: string; officerId: string; ts: number }
  | { type: "SUSPEND"; officerId: string; reason: string; supervisorCode: string; ts: number };

const KEY = "npodias_state_queue_v1";

export function loadQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedAction[]) : [];
  } catch {
    return [];
  }
}

export function saveQueue(q: QueuedAction[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function enqueue(a: QueuedAction) {
  const q = loadQueue();
  q.unshift(a);
  saveQueue(q);
  return q;
}

export function dequeueMany(n: number) {
  const q = loadQueue();
  const take = q.slice(0, n);
  const rest = q.slice(n);
  saveQueue(rest);
  return { take, rest };
}
