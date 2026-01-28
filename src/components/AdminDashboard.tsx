import React, { useState } from 'react';
import { InsurancePlan, Case, Inquiry, AssessmentQuestion } from "../types";
import { ThemeSelector } from "../ThemeSelector";
import CRMDashboard from './CRM/CRMDashboard';
import ContractLibrary from './CRM/ContractLibrary';

// Modular Components
import AdminSidebar from './Admin/Layout/AdminSidebar';
import AdminHeader from './Admin/Layout/AdminHeader';
import DashboardHome from './Admin/Dashboard/DashboardHome';
import SectionHeader from './Admin/Common/SectionHeader';
import InquiryManager from './Admin/Inquiries/InquiryManager';
import PlanManager from './Admin/Plans/PlanManager';
import CaseManager from './Admin/Cases/CaseManager';
import AssessmentConfig from './Admin/Assessment/AssessmentConfig';

interface AdminDashboardProps {
  tenantId?: string;
  inquiries: Inquiry[];
  insurancePlans: InsurancePlan[];
  cases: Case[];
  assessmentQuestions: AssessmentQuestion[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  setInsurancePlans: React.Dispatch<React.SetStateAction<InsurancePlan[]>>;
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  setAssessmentQuestions: React.Dispatch<React.SetStateAction<AssessmentQuestion[]>>;
  onExit: () => void;
  onLogout: () => void;
}

const AdminDashboard = ({
  tenantId,
  inquiries,
  insurancePlans,
  cases,
  assessmentQuestions,
  setInquiries,
  setInsurancePlans,
  setCases,
  setAssessmentQuestions,
  onExit,
  onLogout
}: AdminDashboardProps) => {
  const [adminTab, setAdminTab] = useState<'dashboard' | 'crm' | 'contract-library' | 'messages' | 'appearance' | 'plans' | 'cases' | 'assessment'>('dashboard');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const getSectionHeader = () => {
    switch (adminTab) {
      case 'dashboard': return { phase: "Management", title: "系统概览" };
      case 'plans': return { phase: "Management", title: "保险方案管理" };
      case 'cases': return { phase: "Management", title: "理赔案例实录" };
      case 'messages': return { phase: "Management", title: "智能咨询工作台" };
      case 'assessment': return { phase: "Management", title: "风险问卷引擎" };
      case 'appearance': return { phase: "Management", title: "品牌与界面设置" };
      default: return null;
    }
  };

  const header = getSectionHeader();

  return (
    <div className="h-screen h-[100dvh] text-white flex overflow-hidden w-full bg-slate-900">
      {/* Sidebar Overlay (Mobile) */}
      {isAdminMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsAdminMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        isAdminMenuOpen={isAdminMenuOpen}
        setIsAdminMenuOpen={setIsAdminMenuOpen}
        inquiriesCount={inquiries.filter(i => i.status === 'pending').length}
        onExit={onExit}
        onLogout={onLogout}
      />

      <div className="flex-grow flex flex-col overflow-hidden text-left relative bg-slate-50">
        {/* Mobile Header */}
        <AdminHeader setIsAdminMenuOpen={setIsAdminMenuOpen} />

        <main className={`flex-grow flex flex-col min-h-0 ${adminTab === 'crm' || adminTab === 'contract-library' ? 'p-0 overflow-hidden bg-white' : 'p-4 md:p-12 overflow-y-auto bg-slate-50'}`}>
          {/* Main Content Area */}
          <div className={`${adminTab === 'crm' || adminTab === 'contract-library' ? 'w-full h-full' : 'max-w-5xl mx-auto w-full space-y-8 md:space-y-12 text-slate-900'}`}>

            {/* Common Section Header (Visible for most tabs) */}
            {header && (
              <SectionHeader
                phase={header.phase}
                title={header.title}
                subtitle="Elite Brokerage Platform · Operational Control"
              />
            )}

            {/* Tab Panels */}
            {adminTab === 'dashboard' && <DashboardHome inquiries={inquiries} />}

            {adminTab === 'crm' && <CRMDashboard tenantId={tenantId} />}

            {adminTab === 'contract-library' && <ContractLibrary tenantId={tenantId} />}

            {adminTab === 'messages' && (
              <InquiryManager
                inquiries={inquiries}
                setInquiries={setInquiries}
                insurancePlans={insurancePlans}
                tenantId={tenantId}
              />
            )}

            {adminTab === 'plans' && (
              <PlanManager
                insurancePlans={insurancePlans}
                setInsurancePlans={setInsurancePlans}
                tenantId={tenantId}
              />
            )}

            {adminTab === 'cases' && (
              <CaseManager
                cases={cases}
                setCases={setCases}
                tenantId={tenantId}
              />
            )}

            {adminTab === 'assessment' && (
              <AssessmentConfig
                assessmentQuestions={assessmentQuestions}
                setAssessmentQuestions={setAssessmentQuestions}
                tenantId={tenantId}
              />
            )}

            {adminTab === 'appearance' && <ThemeSelector />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
