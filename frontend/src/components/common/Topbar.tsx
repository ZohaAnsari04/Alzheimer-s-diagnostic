import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  UserCheck, 
  Play, 
  RotateCw,
  ChevronDown,
  LogOut,
  Shield
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { api, NotificationItem } from '../../services/apiClient';
import { NotificationPanel } from '../notifications/NotificationPanel';

interface TopbarProps {
  currentTab: NavTab;
  onOpenSearch: () => void;
  onTriggerDemo: (count: number) => void;
  isDemoLoading: boolean;
  userRole: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onNavigateTab?: (tab: NavTab, patientId?: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onOpenSearch,
  onTriggerDemo,
  isDemoLoading,
  userRole,
  userName = 'Clinician Reviewer',
  userEmail,
  onLogout,
  onNavigateTab
}) => {
  const [cohortSize, setCohortSize] = useState<number>(248);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState<boolean>(false);
  const [isDemoTriggering, setIsDemoTriggering] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications(20);
      setNotifications(data);
      const count = await api.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30-second background polling
    return () => clearInterval(interval);
  }, []);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleSelectNotification = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await handleMarkRead(notif.id);
    }
    setIsNotifOpen(false);

    if (!onNavigateTab) return;

    if (notif.patient_id) {
      onNavigateTab('patient-intelligence', notif.patient_id);
    } else if (notif.route) {
      if (notif.route.includes('/analytics')) onNavigateTab('population-analytics');
      else if (notif.route.includes('/pathway')) onNavigateTab('diagnostic-pathway');
      else if (notif.route.includes('/data')) onNavigateTab('data-ingestion');
      else if (notif.route.includes('/model')) onNavigateTab('model-explainability');
      else if (notif.route.includes('/security')) onNavigateTab('audit-security');
      else onNavigateTab('command-center');
    }
  };

  const handleTriggerDemoNotifs = async () => {
    setIsDemoTriggering(true);
    try {
      await api.triggerDemoNotifications('all');
      await loadNotifications();
    } catch (err) {
      console.error('Failed to trigger demo notifications:', err);
    } finally {
      setIsDemoTriggering(false);
    }
  };

  const getBreadcrumbTitle = (tab: NavTab) => {
    switch (tab) {
      case 'command-center': return 'Command Center';
      case 'priority-queue': return 'Patient Priority Queue';
      case 'patient-intelligence': return 'Patient Intelligence';
      case 'diagnostic-pathway': return 'Diagnostic Pathway';
      case 'population-analytics': return 'Population Insights';
      case 'model-explainability': return 'Model Transparency';
      case 'data-ingestion': return 'Data Management';
      case 'audit-security': return 'Audit & Security';
      case 'ethics-limitations': return 'Ethics & Limitations';
      default: return 'Command Center';
    }
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#EAECF0] px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none shadow-xs">
      {/* Left: Breadcrumb Context */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#667085] font-medium">NeuroPath AI</span>
        <span className="text-[#D0D5DD]">/</span>
        <span className="font-bold text-[#101828]">{getBreadcrumbTitle(currentTab)}</span>
      </div>

      {/* Right Utility Bar */}
      <div className="flex items-center gap-3">
        {/* ⌘K Palette Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D0D5DD] text-xs text-[#101828] placeholder-[#98A2B3] hover:border-[#0891B2] focus:border-[#0891B2] focus:ring-3 focus:ring-[#0891B2]/10 transition-all cursor-pointer shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-[#667085]" />
          <span className="text-[#667085]">Search patient ID...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#EAECF0] text-[10px] font-mono text-[#667085]">
            ⌘K
          </kbd>
        </button>

        {/* Demo Cohort Trigger */}
        <div className="flex items-center rounded-xl bg-[#FFFFFF] border border-[#D0D5DD] p-0.5 shadow-2xs">
          <select
            value={cohortSize}
            onChange={(e) => setCohortSize(Number(e.target.value))}
            className="bg-transparent text-[11px] text-[#087E8B] font-mono font-semibold px-2 py-1 outline-none cursor-pointer"
          >
            <option value={50} className="bg-[#FFFFFF] text-[#101828]">50 Patients</option>
            <option value={100} className="bg-[#FFFFFF] text-[#101828]">100 Patients</option>
            <option value={248} className="bg-[#FFFFFF] text-[#101828]">248 Patients</option>
            <option value={500} className="bg-[#FFFFFF] text-[#101828]">500 Patients</option>
          </select>
          <button
            onClick={() => onTriggerDemo(cohortSize)}
            disabled={isDemoLoading}
            className="btn-31 text-xs cursor-pointer"
          >
            <span className="text-container">
              <span className="text">
                {isDemoLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-[#FFFFFF]" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-[#FFFFFF]" />
                )}
                <span>Generate Demo Cohort</span>
              </span>
            </span>
          </button>
        </div>

        {/* Authenticated Identity Session Display (No role-switching) */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] text-xs text-[#101828] hover:border-[#D0D5DD] transition-all cursor-pointer shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-[#0891B2]" />
            <span className="font-semibold text-[11px]">{userRole}</span>
            <ChevronDown className="w-3 h-3 text-[#667085]" />
          </button>

          <div className="absolute right-0 top-full mt-1 w-56 bg-[#FFFFFF] border border-[#EAECF0] rounded-xl shadow-xl py-1 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-[#EAECF0] space-y-0.5">
              <div className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#0891B2]" />
                Authenticated Session
              </div>
              <div className="text-xs font-bold text-[#101828] truncate">{userName}</div>
              {userEmail && <div className="text-[11px] text-[#667085] truncate font-mono">{userEmail}</div>}
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-[#ECFEFF] border border-[#A5F3FC] text-[#087E8B] text-[10px] font-mono font-bold">
                  {userRole}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] font-medium transition-colors flex items-center gap-2 cursor-pointer mt-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Exit Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Bell & Dropdown Panel */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            className={`p-2 rounded-xl border text-[#667085] hover:text-[#101828] transition-colors relative cursor-pointer shadow-2xs ${
              isNotifOpen ? 'bg-[#ECFEFF] border-[#0891B2] text-[#0891B2]' : 'bg-[#FFFFFF] border-[#EAECF0] hover:border-[#D0D5DD]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-[#0891B2] text-[#FFFFFF] text-[9px] font-mono font-bold flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-[#FFFFFF]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <NotificationPanel
                notifications={notifications}
                isLoading={isLoadingNotifs}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                onSelectNotification={handleSelectNotification}
                onTriggerDemo={handleTriggerDemoNotifs}
                isDemoTriggering={isDemoTriggering}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
