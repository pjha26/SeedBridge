/**
 * Thin API client.
 *
 * - Uses relative URLs so the Vite proxy forwards /api/* to the server.
 * - Attaches the JWT from localStorage as Authorization: Bearer <token>.
 * - Turns the server's { error, issues } JSON into a thrown Error with a
 *   readable message so callers never have to parse error shapes manually.
 * - On 401: clears the stored session and redirects to /login.
 */

const TOKEN_KEY = 'sb_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  /** If false, skip the Authorization header even if a token is present. */
  auth?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(path, { ...fetchOptions, headers });

  if (res.status === 401) {
    clearToken();
    // Use location.replace so the back button doesn't return here
    window.location.replace('/login');
    // Throw so callers don't try to use the (undefined) return value
    throw new Error('Session expired. Please log in again.');
  }

  // Parse JSON for all responses (success and error alike)
  let body: unknown;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  }

  if (!res.ok) {
    // Build a human-readable message from the server's error shape
    const err = body as { error?: string; issues?: { path: string; message: string }[] };
    let message = err?.error ?? `Request failed (${res.status})`;
    if (err?.issues?.length) {
      // Append the first validation issue so the UI can surface it
      message = err.issues.map((i) => i.message).join(', ');
    }
    const thrown = new Error(message) as Error & {
      status: number;
      issues?: { path: string; message: string }[];
    };
    thrown.status = res.status;
    if (err?.issues) thrown.issues = err.issues;
    throw thrown;
  }

  return body as T;
}

// ── Convenience methods ───────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'GET', ...opts }),

  post: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),

  put: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),

  patch: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'DELETE', ...opts }),
};
