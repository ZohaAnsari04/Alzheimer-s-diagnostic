import React from 'react';
import logoImg from '../../assets/logo.jpg';

interface SidebarBrandProps {
  isCollapsed?: boolean;
}

export const SidebarBrand: React.FC<SidebarBrandProps> = ({ isCollapsed = false }) => {
  return (
    <div className="p-4 border-b border-[#EAECF0] space-y-3 shrink-0 bg-[#FFFFFF]">
      <div className="flex items-center gap-3">
        {/* Logo Tile with Soft Cyan Background */}
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#ECFEFF] border border-[#A5F3FC] shrink-0 flex items-center justify-center relative group">
          <img 
            src={logoImg} 
            alt="NeuroPath AI Logo" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 logo-shimmer pointer-events-none opacity-20"></div>
        </div>

        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-[#101828] text-[15px] tracking-tight leading-none font-sans truncate">
              NeuroPath AI
            </h1>
            <p className="text-[11px] text-[#667085] font-medium mt-1 truncate">
              Clinical Intelligence
            </p>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#667085] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Decision support active</span>
        </div>
      )}
    </div>
  );
};

