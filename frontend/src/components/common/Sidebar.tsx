import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Cpu, 
  ShieldCheck, 
  Scale, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { SidebarBrand } from './SidebarBrand';
import { SidebarItem } from './SidebarItem';
import { WorkflowNavigation } from './WorkflowNavigation';
import { UserProfile } from './UserProfile';

export type NavTab = 
  | 'command-center' 
  | 'priority-queue' 
  | 'patient-intelligence' 
  | 'diagnostic-pathway' 
  | 'population-analytics' 
  | 'model-explainability' 
  | 'data-ingestion'
  | 'audit-security' 
  | 'ethics-limitations';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedPatientId?: string;
  userRole: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  selectedPatientId,
  userRole,
  userName,
  userEmail,
  onLogout
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Menu Toggle Floating Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] text-[#101828] shadow-md cursor-pointer"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation Panel Container */}
      <aside
        className={`bg-[#FFFFFF] flex flex-col h-full shrink-0 select-none border-r border-[#EAECF0] transition-all duration-250 cubic-bezier(0.4,0,0.2,1) fixed lg:relative z-40 ${
          isCollapsed ? 'w-[68px]' : 'w-[240px]'
        } ${
          isMobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <SidebarBrand isCollapsed={isCollapsed} />

        {/* Navigation Content Area */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
          
          {/* SECTION 1: OVERVIEW */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-[#98A2B3] uppercase tracking-[0.08em]">
                OVERVIEW
              </div>
            )}
            <SidebarItem
              id="command-center"
              label="Command Center"
              icon={LayoutDashboard}
              isActive={currentTab === 'command-center'}
              onClick={() => {
                onTabChange('command-center');
                setIsMobileOpen(false);
              }}
              isCollapsed={isCollapsed}
            />
          </div>

          {/* SECTION 2: PATIENT WORKFLOW */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-[#98A2B3] uppercase tracking-[0.08em]">
                PATIENT WORKFLOW
              </div>
            )}
            <WorkflowNavigation
              currentTab={currentTab}
              onTabChange={(tab) => {
                onTabChange(tab);
                setIsMobileOpen(false);
              }}
              selectedPatientId={selectedPatientId}
              isCollapsed={isCollapsed}
            />
          </div>

          {/* SECTION 3: INTELLIGENCE */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-[#98A2B3] uppercase tracking-[0.08em]">
                INTELLIGENCE
              </div>
            )}
            <SidebarItem
              id="population-analytics"
              label="Analytics"
              icon={BarChart3}
              isActive={currentTab === 'population-analytics'}
              onClick={() => {
                onTabChange('population-analytics');
                setIsMobileOpen(false);
              }}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              id="model-explainability"
              label="Model"
              icon={Cpu}
              isActive={currentTab === 'model-explainability'}
              onClick={() => {
                onTabChange('model-explainability');
                setIsMobileOpen(false);
              }}
              isCollapsed={isCollapsed}
              versionTag="v1.0"
            />
          </div>

          {/* SECTION 4: SYSTEM */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-[#98A2B3] uppercase tracking-[0.08em]">
                SYSTEM
              </div>
            )}
            <SidebarItem
              id="data-ingestion"
              label="Data"
              icon={FileSpreadsheet}
              isActive={currentTab === 'data-ingestion'}
              onClick={() => {
                onTabChange('data-ingestion');
                setIsMobileOpen(false);
              }}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              id="audit-security"
              label="Security"
              icon={ShieldCheck}
              isActive={currentTab === 'audit-security'}
              onClick={() => {
                onTabChange('audit-security');
                setIsMobileOpen(false);
              }}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              id="ethics-limitations"
              label="Ethics"
              icon={Scale}
              isActive={currentTab === 'ethics-limitations'}
              onClick={() => {
                onTabChange('ethics-limitations');
                setIsMobileOpen(false);
              }}
              isCollapsed={isCollapsed}
              isEthics={true}
            />
          </div>
        </div>

        {/* Footer Area: System Status & User Profile */}
        <div className="p-3 border-t border-[#EAECF0] space-y-3 shrink-0 bg-[#FFFFFF]">
          {/* Clinical Mode Indicator & System Status */}
          {!isCollapsed && (
            <div className="px-1 flex items-center justify-between text-[10px] text-[#667085] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                CLINICAL MODE
              </span>
              <span>Model v1.0</span>
            </div>
          )}

          {/* Clinician User Profile Module */}
          <UserProfile
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
            onLogout={onLogout}
            isCollapsed={isCollapsed}
          />

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-full items-center justify-center py-1.5 rounded-lg bg-[#F8FAFC] border border-[#EAECF0] hover:bg-[#F1F7FA] text-[#667085] hover:text-[#101828] transition-colors cursor-pointer text-xs"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
