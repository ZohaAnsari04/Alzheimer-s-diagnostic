import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Topbar } from './components/common/Topbar';
import { LoginPage } from './components/auth/LoginPage';
import { SearchCommandModal } from './components/common/SearchCommandModal';
import { CommandCenterView } from './components/dashboard/CommandCenterView';
import { PriorityQueueView } from './components/dashboard/PriorityQueueView';
import { PatientIntelligenceView } from './components/patient/PatientIntelligenceView';
import { DiagnosticPathwayView } from './components/pathway/DiagnosticPathwayView';
import { PopulationAnalyticsView } from './components/analytics/PopulationAnalyticsView';
import { ModelExplainabilityView } from './components/model/ModelExplainabilityView';
import { DataIngestionView } from './components/data/DataIngestionView';
import { AuditSecurityView } from './components/audit/AuditSecurityView';
import { EthicsLimitationsView } from './components/ethics/EthicsLimitationsView';
import { api, UserProfile, getAuthToken, removeAuthToken } from './services/apiClient';
import { Patient } from './types/patient';
import { DashboardSummary, AnalyticsData } from './types/analytics';
import { RotateCw } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('command-center');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing patient cohort...');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P-1042');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [queueTotal, setQueueTotal] = useState(0);
  const [queuePage, setQueuePage] = useState(1);
  const [filters, setFilters] = useState<any>({ page: 1, page_size: 20 });

  // Verify existing auth session on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then((profile) => {
          setCurrentUser(profile);
        })
        .catch((err) => {
          console.warn('Saved auth session expired or invalid:', err);
          removeAuthToken();
          setCurrentUser(null);
        })
        .finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }

    const handleExpired = () => {
      removeAuthToken();
      setCurrentUser(null);
    };

    window.addEventListener('neuropath_auth_expired', handleExpired);
    return () => window.removeEventListener('neuropath_auth_expired', handleExpired);
  }, []);

  const loadData = async () => {
    try {
      const sumData = await api.getDashboardSummary();
      setSummary(sumData);

      const anaData = await api.getAnalytics();
      setAnalytics(anaData);

      const patRes = await api.getPatients(filters);
      setPatients(patRes.patients);
      setQueueTotal(patRes.total);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, filters]);

  useEffect(() => {
    if (currentUser && selectedPatientId) {
      api.getPatientById(selectedPatientId)
        .then(setSelectedPatient)
        .catch(console.error);
    }
  }, [currentUser, selectedPatientId]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const handleTriggerDemo = async (count: number = 248) => {
    setIsDemoLoading(true);
    setLoadingText('Analyzing patient cohort...');
    
    setTimeout(() => setLoadingText('Generating prioritization scores...'), 600);
    setTimeout(() => setLoadingText('Preparing explainability results...'), 1200);

    try {
      await api.generateDemoCohort(count);
      setSelectedPatientId('P-1042');
      await loadData();
    } catch (err) {
      console.error('Demo generation error:', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentTab('patient-intelligence');
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen bg-[#F7F9FC] flex flex-col items-center justify-center space-y-3 text-xs text-[#667085]">
        <RotateCw className="w-6 h-6 animate-spin text-[#0891B2]" />
        <span>Authenticating clinical workspace session...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  const roleLabel = currentUser.role === 'ADMIN' ? 'Clinical Administrator' : currentUser.role === 'EVALUATOR' ? 'Research Evaluator' : 'Clinician (Neurology)';

  return (
    <div className="flex h-screen w-screen bg-[#F7F9FC] text-[#101828] overflow-hidden font-sans relative selection:bg-cyan-500/10 selection:text-cyan-900">
      {/* Search Command Palette Overlay */}
      <SearchCommandModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPatient={handleSelectPatient}
      />

      {/* Loading Overlay */}
      {isDemoLoading && (
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3">
          <div className="bg-white p-6 rounded-2xl border border-[#EAECF0] shadow-2xl flex flex-col items-center justify-center space-y-3 max-w-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFEFF] border border-[#A5F3FC] flex items-center justify-center text-[#0891B2]">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-sm font-bold text-[#101828]">{loadingText}</div>
            <p className="text-xs text-[#667085]">Calibrating machine learning prioritization pipeline</p>
          </div>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedPatientId={selectedPatientId}
        userRole={roleLabel}
        userName={currentUser.full_name}
        userEmail={currentUser.email}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F7F9FC]">
        {/* Top Utility Bar */}
        <Topbar
          currentTab={currentTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onTriggerDemo={handleTriggerDemo}
          isDemoLoading={isDemoLoading}
          userRole={roleLabel}
          userName={currentUser.full_name}
          userEmail={currentUser.email}
          onLogout={handleLogout}
          onNavigateTab={(tab, patientId) => {
            setCurrentTab(tab);
            if (patientId) setSelectedPatientId(patientId);
          }}
        />

        {/* Dynamic Canvas Views */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentTab === 'command-center' && (
            <CommandCenterView
              summary={summary}
              topPatients={patients}
              onSelectPatient={handleSelectPatient}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'priority-queue' && (
            <PriorityQueueView
              patients={patients}
              total={queueTotal}
              page={queuePage}
              pageSize={20}
              onPageChange={(p) => {
                setQueuePage(p);
                setFilters((prev: any) => ({ ...prev, page: p }));
              }}
              onFilterChange={(f) => {
                setFilters(f);
              }}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'patient-intelligence' && (
            <PatientIntelligenceView
              patient={selectedPatient}
              onBack={() => setCurrentTab('priority-queue')}
            />
          )}

          {currentTab === 'diagnostic-pathway' && (
            <DiagnosticPathwayView summary={summary} />
          )}

          {currentTab === 'population-analytics' && (
            <PopulationAnalyticsView analytics={analytics} />
          )}

          {currentTab === 'model-explainability' && (
            <ModelExplainabilityView />
          )}

          {currentTab === 'data-ingestion' && (
            <DataIngestionView onSuccessImport={loadData} />
          )}

          {currentTab === 'audit-security' && (
            <AuditSecurityView />
          )}

          {currentTab === 'ethics-limitations' && (
            <EthicsLimitationsView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
