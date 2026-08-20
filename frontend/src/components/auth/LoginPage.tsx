import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  Lock,
  Mail,
  Building,
  FileCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  AlertCircle,
  Loader2
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import { api, UserProfile } from '../../services/apiClient';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'demo'>('demo');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('clinician@neuropath.demo');
  const [signInPassword, setSignInPassword] = useState('ClinicianPass2026!');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpNpi, setSignUpNpi] = useState('');
  const [signUpHospital, setSignUpHospital] = useState('');
  const [signUpRole, setSignUpRole] = useState('CLINICIAN');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await api.login(signInEmail.trim(), signInPassword);
      onLogin(res.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoPersona = async (email: string, pass: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.login(email, pass);
      onLogin(res.user);
    } catch (err: any) {
      console.error('Demo authentication error:', err);
      setAuthError('Authentication service failed. Please check server status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F7F9FC] text-[#101828] flex flex-col justify-between selection:bg-[#ECFEFF] selection:text-[#087E8B] font-sans relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0891B2]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Compliance Trust Bar */}
      <div className="border-b border-[#EAECF0] px-6 py-2.5 text-xs text-[#667085] text-center font-medium flex items-center justify-center gap-3 bg-[#FFFFFF]/80 backdrop-blur-sm z-20">
        <span className="flex items-center gap-1.5 text-[#087E8B] font-bold">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#0891B2]" />
          <span>Clinical decision support · Non-diagnostic system</span>
        </span>
        <span className="hidden sm:inline text-[#EAECF0]">|</span>
        <span className="hidden sm:inline text-[11px] text-[#667085]">De-Identified Sandbox Prototype · 256-bit Encrypted</span>
      </div>

      {/* Center Auth Portal */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#EAECF0] shadow-sm relative">
          
          {/* Left Column: Brand & Value Proposition (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#EAECF0] pb-6 lg:pb-0 lg:pr-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#A5F3FC] shadow-xs">
                <img src={logoImg} alt="NeuroPath AI Logo" className="w-full h-full object-cover" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">NeuroPath AI</h1>
                <p className="text-xs text-[#0891B2] font-bold mt-1">Intelligent Diagnostic Prioritization</p>
              </div>

              <p className="text-xs text-[#475467] leading-relaxed font-normal">
                Prioritize screened candidates for progressive diagnostic evaluation across limited MRI, PET, and specialist resources.
              </p>
            </div>

            {/* Workflow Points */}
            <div className="space-y-2.5 pt-4 border-t border-[#EAECF0] text-xs text-[#475467] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0891B2] shrink-0" />
                <span>Cognitive → Biomarkers → MRI → PET</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0891B2] shrink-0" />
                <span>Backend JWT authentication & role-based security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0891B2] shrink-0" />
                <span>Human-in-the-loop decision support</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] text-[11px] text-[#667085] flex items-center gap-2 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#0891B2] shrink-0" />
              <span>Restricted access portal for authorized medical & trial personnel.</span>
            </div>
          </div>

          {/* Right Column: Multi-Tab Form (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            {/* Tab Selector */}
            <div className="flex items-center p-1 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] text-xs font-semibold">
              <button
                onClick={() => { setAuthTab('demo'); setAuthError(null); }}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authTab === 'demo' ? 'bg-[#FFFFFF] text-[#087E8B] border border-[#A5F3FC] shadow-xs font-bold' : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#0891B2]" />
                <span>Demo Access</span>
              </button>
              <button
                onClick={() => { setAuthTab('signin'); setAuthError(null); }}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                  authTab === 'signin' ? 'bg-[#FFFFFF] text-[#087E8B] border border-[#A5F3FC] shadow-xs font-bold' : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Global Error Banner */}
            {authError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] flex items-center gap-2 font-medium animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* TAB 1: DEMO SANDBOX */}
            {authTab === 'demo' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-base font-bold text-[#101828]">Select Clinician Demo Persona</h2>
                  <p className="text-xs text-[#667085] mt-0.5">Authenticates against backend JWT server with pre-configured credentials</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Persona 1: Neurologist */}
                  <button
                    onClick={() => handleDemoPersona('clinician@neuropath.demo', 'ClinicianPass2026!')}
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#EAECF0] hover:border-[#D0D5DD] text-left transition-all group flex items-center justify-between cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-center text-[#0891B2] shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#101828] group-hover:text-[#087E8B]">Dr. Sarah Chen, MD</div>
                        <div className="text-[11px] text-[#667085]">Role: CLINICIAN • Mayo Clinic</div>
                      </div>
                    </div>
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 text-[#0891B2] animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#0891B2] group-hover:translate-x-0.5 transition-all" />
                    )}
                  </button>

                  {/* Persona 2: Clinical Operations Admin */}
                  <button
                    onClick={() => handleDemoPersona('admin@neuropath.demo', 'AdminPass2026!')}
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#EAECF0] hover:border-[#D0D5DD] text-left transition-all group flex items-center justify-between cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-center text-[#0891B2] shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#101828] group-hover:text-[#087E8B]">Dr. Marcus Vance</div>
                        <div className="text-[11px] text-[#667085]">Role: ADMIN • Johns Hopkins</div>
                      </div>
                    </div>
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 text-[#0891B2] animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#0891B2] group-hover:translate-x-0.5 transition-all" />
                    )}
                  </button>

                  {/* Persona 3: Trial Evaluator */}
                  <button
                    onClick={() => handleDemoPersona('evaluator@neuropath.demo', 'EvaluatorPass2026!')}
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#EAECF0] hover:border-[#D0D5DD] text-left transition-all group flex items-center justify-between cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-center text-[#0891B2] shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#101828] group-hover:text-[#087E8B]">Elena Rostova, MSc</div>
                        <div className="text-[11px] text-[#667085]">Role: EVALUATOR • Benchmark Health</div>
                      </div>
                    </div>
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 text-[#0891B2] animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#0891B2] group-hover:translate-x-0.5 transition-all" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN IN FORM */}
            {authTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3.5 text-xs animate-in fade-in duration-200">
                <div>
                  <h2 className="text-base font-bold text-[#101828]">Sign In to Clinician Workspace</h2>
                  <p className="text-xs text-[#667085] mt-0.5">Enter credentials to authenticate against backend JWT server</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#101828] block">Clinical Email:</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="clinician@neuropath.demo"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#101828] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#101828] block">Password:</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-xl pl-9 pr-9 py-2 text-xs text-[#101828] focus:outline-none focus:border-[#0891B2]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-31 w-full text-xs cursor-pointer disabled:opacity-50"
                >
                  <span className="text-container">
                    <span className="text flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </span>
                </button>
              </form>
            )}

            {/* Disclaimer Footer */}
            <div className="text-[10px] text-[#667085] text-center leading-relaxed">
              Outputs support clinician prioritization only — not a diagnostic tool or treatment recommendation.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-[11px] text-[#667085] border-t border-[#EAECF0] bg-[#FFFFFF]">
        NeuroPath AI • Clinical Decision Support Platform
      </footer>
    </div>
  );
};
