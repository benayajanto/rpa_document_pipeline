const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ExtractionResult {
  vendor_name: string;
  document_number: string;
  document_date: string;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: string;
  method: string;
  template_name: string | null;
  confidence: number;
  line_items: LineItem[];
}

export type DocumentStatus = "pending" | "processed" | "failed";

export interface DocumentRecord {
  id: number;
  unit_id: number;
  original_filename: string;
  status: DocumentStatus;
  uploaded_at: string | null;
  extraction?: ExtractionResult;
}

export interface StagedExtraction {
  staging_id: string;
  filename: string;
  size: number;
  extraction: ExtractionResult;
}

export type UnitStatus = "processing" | "complete";

export interface Unit {
  id: number;
  file_amount: number;
  error_count: number;
  success_count: number;
  status: UnitStatus;
  uploaded_by: string | null;
  created_at: string | null;
}

export interface Paginated<T> {
  items: T[];
  total_pages: number;
  total_count: number;
}

export interface ListParams {
  page?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // response body wasn't JSON
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function listQuery(params: ListParams = {}): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.query) search.set("query", params.query);
  if (params.sortBy) search.set("sort_by", params.sortBy);
  if (params.sortOrder) search.set("sort_order", params.sortOrder);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const apiClient = {
  health(): Promise<{ status: string }> {
    return request("/api/health");
  },

  signup(email: string, password: string, name: string): Promise<AuthResponse> {
    return request("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  // Stage a file for extraction. Not yet persisted — call insertDocument to commit it.
  extractDocument(token: string, file: File): Promise<StagedExtraction> {
    const formData = new FormData();
    formData.append("file", file);
    return request("/api/extract", {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    });
  },

  discardStaged(token: string, stagingId: string): Promise<void> {
    return request(`/api/extract/${stagingId}`, { method: "DELETE", headers: authHeaders(token) });
  },

  discardAllStaged(token: string): Promise<void> {
    return request("/api/extract", { method: "DELETE", headers: authHeaders(token) });
  },

  createUnit(token: string, fileAmount: number): Promise<Unit> {
    return request("/api/units", {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ file_amount: fileAmount }),
    });
  },

  finalizeUnit(token: string, unitId: number, errorCount: number, successCount: number): Promise<Unit> {
    return request(`/api/units/${unitId}`, {
      method: "PATCH",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ error_count: errorCount, success_count: successCount }),
    });
  },

  listUnits(token: string, params?: ListParams): Promise<Paginated<Unit>> {
    return request(`/api/units${listQuery(params)}`, { headers: authHeaders(token) });
  },

  insertDocument(token: string, unitId: number, stagingId: string): Promise<DocumentRecord> {
    return request(`/api/units/${unitId}/documents`, {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ staging_id: stagingId }),
    });
  },

  listUnitDocuments(token: string, unitId: number, params?: ListParams): Promise<Paginated<DocumentRecord>> {
    return request(`/api/units/${unitId}/documents${listQuery(params)}`, { headers: authHeaders(token) });
  },

  getDocument(token: string, id: number): Promise<DocumentRecord> {
    return request(`/api/documents/${id}`, { headers: authHeaders(token) });
  },

  deleteDocument(token: string, id: number): Promise<void> {
    return request(`/api/documents/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },
};
