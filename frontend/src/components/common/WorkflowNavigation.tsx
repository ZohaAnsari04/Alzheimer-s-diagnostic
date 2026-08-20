import React from 'react';
import { Layers, Users, GitBranch } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { NavTab } from './Sidebar';

interface WorkflowNavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedPatientId?: string;
  isCollapsed?: boolean;
}

export const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  currentTab,
  onTabChange,
  selectedPatientId,
  isCollapsed = false
}) => {
  const isPathwayActive = currentTab === 'diagnostic-pathway';
  const isPatientsActive = currentTab === 'patient-intelligence';
  const isQueueActive = currentTab === 'priority-queue';

  const workflowItems = [
    { id: 'priority-queue', label: 'Priority Queue', icon: Layers, isActive: isQueueActive },
    { id: 'patient-intelligence', label: 'Patients', icon: Users, isActive: isPatientsActive },
    { id: 'diagnostic-pathway', label: 'Pathway', icon: GitBranch, isActive: isPathwayActive },
  ];

  return (
    <div className="relative pl-0">
      {/* Subtle Vertical Progression Line */}
      {!isCollapsed && (
        <div 
          className={`absolute left-[19px] top-[18px] bottom-[18px] w-[1px] transition-all duration-300 pointer-events-none ${
            isPathwayActive 
              ? 'bg-[#0891B2]' 
              : 'bg-[#EAECF0]'
          }`}
        />
      )}

      <div className="space-y-1 relative z-10">
        {workflowItems.map((item) => (
          <SidebarItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={item.isActive}
            onClick={() => onTabChange(item.id as NavTab)}
            isCollapsed={isCollapsed}
            selectedPatientId={item.id === 'patient-intelligence' ? selectedPatientId : undefined}
          />
        ))}
      </div>
    </div>
  );
};

