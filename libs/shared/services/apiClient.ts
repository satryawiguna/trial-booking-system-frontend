// Base HTTP client per PATTERNS.md §4 (API Service Pattern).
//
// AMBIGUITY (flagged): `architecture/api-design.md` documents HTTP status
// codes and human-readable error descriptions per endpoint (e.g. "404 Trial
// class not found"), but does NOT specify the JSON schema of an error
// response body (no `errorCode` field is shown anywhere in api-design.md).
// PATTERNS.md §4/§5/§14, however, explicitly defines the expected error
// body shape (`{ statusCode, errorCode, message }`) and a reference table of
// `errorCode` values. Since PATTERNS.md is the authoritative conventions
// doc for this repo and does not conflict with api-design.md (it's simply
// more specific), this client follows PATTERNS.md's error contract. This
// assumption should be confirmed with the Backend Agent once the backend
// error response format is implemented — if the backend uses a different
// shape (e.g. `{ statusCode, code, message }` or Nest's default
// `{ statusCode, message, error }`), `parseErrorBody` below is the only
// place that needs to change.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface ApiErrorBody {
  statusCode: number;
  errorCode: string;
  message: string;
}

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    const data = (await response.json()) as Partial<ApiErrorBody> | null;
    return {
      statusCode:
        typeof data?.statusCode === "number" ? data.statusCode : response.status,
      errorCode:
        typeof data?.errorCode === "string" ? data.errorCode : "UNKNOWN_ERROR",
      message:
        typeof data?.message === "string" && data.message.length > 0
          ? data.message
          : response.statusText || "Request failed",
    };
  } catch {
    return {
      statusCode: response.status,
      errorCode: "UNKNOWN_ERROR",
      message: response.statusText || "Request failed",
    };
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      "Unable to connect to the server. Please check your connection.",
    );
  }

  if (!response.ok) {
    const error = await parseErrorBody(response);
    throw new ApiClientError(error.statusCode, error.errorCode, error.message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
