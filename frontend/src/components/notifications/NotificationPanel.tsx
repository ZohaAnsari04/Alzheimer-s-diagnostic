import React from 'react';
import { 
  CheckCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Activity, 
  FileSpreadsheet, 
  RotateCw,
  Play
} from 'lucide-react';
import { NotificationItem } from '../../services/apiClient';
import { formatTimeAgo } from '../../utils/formatters';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
  onTriggerDemo?: () => void;
  isDemoTriggering?: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isLoading,
  onMarkRead,
  onMarkAllRead,
  onSelectNotification,
  onTriggerDemo,
  isDemoTriggering = false
}) => {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getCategoryIcon = (type: NotificationItem['type'], severity: NotificationItem['severity']) => {
    switch (type) {
      case 'HIGH_PRIORITY_PATIENT':
        return <AlertCircle className="w-4 h-4 text-[#D97706]" />;
      case 'MRI_CAPACITY':
        return <Activity className="w-4 h-4 text-[#D97706]" />;
      case 'PET_QUEUE':
        return <Clock className="w-4 h-4 text-[#D97706]" />;
      case 'CSV_IMPORT_SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-[#059669]" />;
      case 'CSV_IMPORT_FAILURE':
        return <XCircle className="w-4 h-4 text-[#DC2626]" />;
      case 'MODEL_EVALUATION':
        return <Sparkles className="w-4 h-4 text-[#0891B2]" />;
      case 'SECURITY_AUDIT':
        return <ShieldAlert className="w-4 h-4 text-[#D97706]" />;
      case 'SESSION_EXPIRING':
        return <AlertTriangle className="w-4 h-4 text-[#D97706]" />;
      default:
        return <Activity className="w-4 h-4 text-[#0891B2]" />;
    }
  };

  const getSeverityBadgeStyle = (severity: NotificationItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
      case 'WARNING':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]';
      case 'SUCCESS':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'INFO':
      default:
        return 'bg-[#ECFEFF] text-[#087E8B] border-[#A5F3FC]';
    }
  };

  return (
    <div className="w-80 sm:w-96 bg-[#FFFFFF] border border-[#EAECF0] rounded-2xl shadow-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#EAECF0] bg-[#F8FAFC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#101828]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#0891B2] text-[#FFFFFF] text-[10px] font-mono font-bold">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] text-[#087E8B] hover:text-[#0891B2] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Panel Body / Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-[#EAECF0]">
        {isLoading ? (
          <div className="p-6 text-center space-y-2 text-xs text-[#667085]">
            <RotateCw className="w-5 h-5 animate-spin mx-auto text-[#0891B2]" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center space-y-1 text-xs text-[#667085]">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#059669]/60" />
            <div className="font-bold text-[#101828]">You're all caught up</div>
            <div className="text-[11px]">No new NeuroPath clinical notifications.</div>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification(notif)}
              className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start relative ${
                notif.is_read ? 'bg-[#FFFFFF] hover:bg-[#F8FAFC]' : 'bg-[#F9FBFD] hover:bg-[#F1F7FA]'
              }`}
            >
              {/* Unread Accent Indicator Dot */}
              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-[#0891B2] absolute top-4 left-2.5"></span>
              )}

              {/* Icon Container */}
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ml-2 ${getSeverityBadgeStyle(notif.severity)}`}>
                {getCategoryIcon(notif.type, notif.severity)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold truncate ${notif.is_read ? 'text-[#344054]' : 'text-[#101828]'}`}>
                    {notif.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#98A2B3] shrink-0">
                    {formatTimeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="text-[11px] text-[#667085] leading-relaxed line-clamp-2">
                  {notif.message}
                </p>
                {notif.patient_id && (
                  <div className="pt-0.5">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#EAECF0] text-[10px] font-mono text-[#087E8B] font-semibold">
                      ID: {notif.patient_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel Footer: Demo Trigger for Evaluator Testing */}
      {onTriggerDemo && (
        <div className="p-2.5 border-t border-[#EAECF0] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-[10px] text-[#667085] font-mono">Evaluator Demo</span>
          <button
            onClick={onTriggerDemo}
            disabled={isDemoTriggering}
            className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#D0D5DD] hover:border-[#0891B2] text-[11px] text-[#087E8B] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            {isDemoTriggering ? (
              <RotateCw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 text-[#0891B2]" />
            )}
            <span>Generate Demo Events</span>
          </button>
        </div>
      )}
    </div>
  );
};
