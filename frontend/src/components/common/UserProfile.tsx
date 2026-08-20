import React, { useState } from 'react';
import { ChevronUp, LogOut, User, Shield } from 'lucide-react';

interface UserProfileProps {
  userRole: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  isCollapsed?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userRole,
  userName = 'Clinician Reviewer',
  userEmail,
  onLogout,
  isCollapsed = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#F9FBFD] border border-[#EAECF0] hover:bg-[#F1F7FA] hover:border-[#D0D5DD] transition-all cursor-pointer text-left ${
          isCollapsed ? 'justify-center p-2' : ''
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-[#ECFEFF] border border-[#A5F3FC] flex items-center justify-center text-[#0891B2] shrink-0">
          <User className="w-4 h-4" />
        </div>

        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#101828] truncate">{userName}</div>
            <div className="text-[10px] text-[#667085] truncate font-medium">{userRole}</div>
          </div>
        )}

        {!isCollapsed && (
          <ChevronUp className={`w-3.5 h-3.5 text-[#667085] transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        )}
      </button>

      {showMenu && (
        <div className="absolute left-0 bottom-full mb-2 w-56 bg-[#FFFFFF] border border-[#EAECF0] rounded-xl shadow-xl p-2 text-xs z-50 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="space-y-1 pb-1 border-b border-[#EAECF0]">
            <div className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#0891B2]" />
              Authenticated Session
            </div>
            <div className="font-bold text-[#101828] text-xs truncate">{userName}</div>
            {userEmail && <div className="text-[10px] text-[#667085] truncate font-mono">{userEmail}</div>}
            <div className="pt-0.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#ECFEFF] border border-[#A5F3FC] text-[#087E8B] text-[10px] font-mono font-bold">
                {userRole}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Exit Session</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
