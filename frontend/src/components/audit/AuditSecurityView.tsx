import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, Lock, Key, Server, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../../types/audit';
import { api } from '../../services/apiClient';
import { formatDateTime } from '../../utils/formatters';

export const AuditSecurityView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.getAuditLogs(50, 0).then((res) => setLogs(res.logs)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0891B2]" />
            Audit Logging & Backend Security Controls
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Security event tracking, JWT Bearer access verification, and RBAC authorization audit trail
          </p>
        </div>
      </div>

      {/* Security Controls Overview Card */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#087E8B] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0891B2]" />
          Backend Authentication & Access Control Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
            <span className="text-[#667085] font-medium block">Authentication:</span>
            <span className="text-[#101828] font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              Backend JWT Bearer
            </span>
            <span className="text-[11px] text-[#667085]">Signed HS256 Token</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
            <span className="text-[#667085] font-medium block">Password Storage:</span>
            <span className="text-[#101828] font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              bcrypt Salted Hash
            </span>
            <span className="text-[11px] text-[#667085]">Standard `bcrypt.hashpw`</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
            <span className="text-[#667085] font-medium block">Authorization:</span>
            <span className="text-[#101828] font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              Role-Based Access Control
            </span>
            <span className="text-[11px] text-[#667085]">CLINICIAN / ADMIN / EVALUATOR</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
            <span className="text-[#667085] font-medium block">Session Expiration:</span>
            <span className="text-[#101828] font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              120 Minutes
            </span>
            <span className="text-[11px] text-[#667085]">Configurable Token Lifespan</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="surface-card overflow-hidden">
        <div className="p-4 border-b border-[#EAECF0] flex items-center justify-between bg-[#F8FAFC]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#101828]">System Audit Trail</h3>
          <span className="text-xs font-mono text-[#667085]">Total Log Entries: {logs.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#667085] font-bold uppercase text-[10px] tracking-wider border-b border-[#EAECF0]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0] font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 px-3 text-[#667085] text-[11px]">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 text-[#087E8B] font-sans font-bold">
                    {log.user}
                  </td>
                  <td className="py-2.5 px-3 text-[#101828] font-sans font-medium">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-[#475467]">
                    {log.resource}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Success' ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]' : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#667085] font-sans text-[11px]">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
