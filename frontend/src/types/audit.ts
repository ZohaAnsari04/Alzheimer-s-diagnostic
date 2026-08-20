export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: string;
  details?: string;
}

export interface AuditLogListResponse {
  total: number;
  logs: AuditLog[];
}
