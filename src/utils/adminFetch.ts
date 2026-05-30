async function adminFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    if (res.status === 401) throw new Error("Not authenticated. Please log in again.");
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json().catch(() => undefined);
}

export function adminGet<T>(url: string): Promise<T> {
  return adminFetch<T>(url);
}

export function adminPost<T = void>(url: string, body?: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "POST",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function adminPut<T = void>(url: string, body?: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "PUT",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function adminDelete(url: string): Promise<void> {
  return adminFetch<void>(url, { method: "DELETE" });
}
