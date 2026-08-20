const BASE_URL = 'http://localhost:8000/api';

const TOKEN_KEY = 'neuropath_jwt_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    if (window.location.pathname !== '/') {
      window.location.reload();
    }
  }

  if (!response.ok) {
    let errorDetail = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return response.json();
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface DemoUserPublicInfo {
  email: string;
  full_name: string;
  role: string;
  title: string;
  institution: string;
}

export interface NotificationItem {
  id: number;
  type: 'HIGH_PRIORITY_PATIENT' | 'MRI_CAPACITY' | 'PET_QUEUE' | 'CSV_IMPORT_SUCCESS' | 'CSV_IMPORT_FAILURE' | 'MODEL_EVALUATION' | 'SECURITY_AUDIT' | 'SESSION_EXPIRING';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  created_at: string;
  read_at?: string;
  is_read: boolean;
  patient_id?: string;
  route?: string;
  metadata?: Record<string, any>;
}

export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const res = await fetchJson<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return fetchJson<UserProfile>('/auth/me');
  },

  logout: async (): Promise<void> => {
    try {
      await fetchJson('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  getDemoCredentials: async (): Promise<{ demo_users: DemoUserPublicInfo[] }> => {
    const res = await fetch(`${BASE_URL}/auth/demo-credentials`);
    return res.json();
  },

  // Notifications
  getNotifications: async (limit = 20, unreadOnly = false): Promise<NotificationItem[]> => {
    return fetchJson<NotificationItem[]>(`/notifications?limit=${limit}&unread_only=${unreadOnly}`);
  },

  getUnreadNotificationCount: async (): Promise<number> => {
    const res = await fetchJson<{ count: number }>('/notifications/unread-count');
    return res.count;
  },

  markNotificationAsRead: async (id: number): Promise<NotificationItem> => {
    return fetchJson<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsAsRead: async (): Promise<{ count: number }> => {
    return fetchJson<{ count: number }>('/notifications/read-all', { method: 'PATCH' });
  },

  triggerDemoNotifications: async (eventType = 'all'): Promise<any> => {
    return fetchJson(`/notifications/demo-trigger?event_type=${eventType}`, { method: 'POST' });
  },

  // Dashboard
  getDashboardSummary: async () => {
    return fetchJson<any>('/dashboard/summary');
  },

  // Patients
  getPatients: async (params?: { page?: number; page_size?: number; search?: string; priority_level?: string; current_stage?: string; sort_by?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.priority_level) query.append('priority_level', params.priority_level);
    if (params?.current_stage) query.append('current_stage', params.current_stage);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    return fetchJson<any>(`/patients?${query.toString()}`);
  },

  getPatientDetail: async (patientId: string) => {
    return fetchJson<any>(`/patients/${patientId}`);
  },

  updatePatientStatus: async (patientId: string, review_status: string, notes?: string) => {
    return fetchJson<any>(`/patients/${patientId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ review_status, notes }),
    });
  },

  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/patients/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.detail || 'Upload failed');
    }
    return response.json();
  },

  // Prioritization & Pathways
  runPrioritization: async (patientIds?: string[]) => {
    return fetchJson<any>('/prioritization/evaluate', {
      method: 'POST',
      body: JSON.stringify({ patient_ids: patientIds }),
    });
  },

  getPathwayOverview: async () => {
    return fetchJson<any>('/pathway/overview');
  },

  // Analytics & Capacity
  getAnalytics: async () => {
    return fetchJson<any>('/analytics');
  },

  getResourceCapacity: async (mriCap = 15, petCap = 5, bioCap = 40) => {
    return fetchJson<any>(`/analytics/resource-capacity?mri_capacity=${mriCap}&pet_capacity=${petCap}&biomarker_capacity=${bioCap}`);
  },

  // Model & Explainability
  getModelMetrics: async () => {
    return fetchJson<any>('/model/metrics');
  },

  getExplainability: async (patientId: string) => {
    return fetchJson<any>(`/model/explainability/${patientId}`);
  },

  changeAlgorithm: async (algorithm: string) => {
    return fetchJson<any>(`/model/algorithm?algorithm=${algorithm}`, { method: 'POST' });
  },

  // Audit Logs
  getAuditLogs: async (limit = 50, offset = 0) => {
    return fetchJson<any>(`/audit-logs?limit=${limit}&offset=${offset}`);
  },

  // Demo Trigger
  generateDemoCohort: async (count = 248) => {
    return fetchJson<any>(`/demo/generate-cohort?count=${count}`, { method: 'POST' });
  },

  // Backward-compatible method aliases
  getMe: async () => {
    return fetchJson<UserProfile>('/auth/me');
  },
  getPatientById: async (id: string) => {
    return fetchJson<PatientDetail>(`/patients/${id}`);
  },
  getImpactSavings: async () => {
    return fetchJson<any>('/analytics/resource-capacity');
  },
  getPatientExplainability: async (id: string) => {
    return fetchJson<any>(`/model/explainability/${id}`);
  },
  getPatientPathway: async (id: string) => {
    return fetchJson<any>(`/pathway/stage/${id}`);
  }
};
