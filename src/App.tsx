import {
  Shield, ChevronRight, ChevronLeft, Menu, X, ArrowRight, Star, CheckCircle2,
  Home, BookOpen, Briefcase, Calendar, Award, User, Lock, Eye,
  EyeOff, PlusCircle, ArrowUpCircle, Activity, TrendingUp, MoreHorizontal, Share2,
  ExternalLink, Mail, Phone, LogOut
} from "lucide-react";
import { ServiceCard, AboutSection } from "./components/LandingComponents";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { ThemeSelector } from "./ThemeSelector";
import { AppointmentModal, PlansModal, CaseDetailsModal, AssessmentModal, WeChatModal } from "./components/Modals";
import {
  INITIAL_PLANS, SERVICES, KNOWLEDGE_ITEMS,
  QUICK_TOOLS, TESTIMONIALS, INQUIRY_SUBJECTS, CASES,
  ASSESSMENT_QUESTIONS
} from "./data.tsx";
import { useAuth } from "./contexts/AuthContext";
import { db } from "./services/db";
import { InsurancePlan, Case, Inquiry, AssessmentQuestion } from "./types";

// 延迟加载后台管理模块
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

function App() {
  const { user, signInWithPassword, signOut } = useAuth();

  // 核心路由与 UI 状态
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'admin'>('landing');
  const [currentTenant, setCurrentTenant] = useState<{ id: string, name: string, slug: string } | null>(null);
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  // 租户解析
  useEffect(() => {
    const resolveTenant = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('s');

      if (slug) {
        const { data: tenant } = await db.getTenantBySlug(slug);
        if (tenant) {
          setCurrentTenant(tenant);
          setIsSharedView(true);
          const { data: profile } = await db.getTenantProfile(tenant.id);
          if (profile) setTenantProfile(profile);
          setViewMode('landing');
        }
      } else if (!user) {
        setViewMode('login');
      } else {
        const { data: tenant } = await db.getTenantByUserId(user.id);
        if (tenant) {
          setCurrentTenant(tenant);
          const { data: profile } = await db.getTenantProfile(tenant.id);
          if (profile) setTenantProfile(profile);
        }
        setViewMode('landing');
      }
      setIsResolved(true);
    };
    resolveTenant();
  }, [user]);

  const [activeSection, setActiveSection] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [qrTab, setQrTab] = useState<'personal' | 'oa'>('personal');
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);

  const [cases, setCases] = useState<Case[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [tempAssessmentData, setTempAssessmentData] = useState<Record<string, string> | null>(null);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const [inquiryForm, setInquiryForm] = useState({
    name: "", phone: "", subject: "家庭保障方案定制", content: "", willingToCall: true
  });

  const SECTIONS = ['首页', '专业服务', `关于${tenantProfile?.full_name || '我'}`, '理赔实录', '客户评价'];

  // 数据初始化
  useEffect(() => {
    if (!isResolved) return;
    const fetchData = async () => {
      const tid = currentTenant?.id;
      const { data: plans } = await db.getPlans(tid);
      if (plans) setInsurancePlans(plans as InsurancePlan[]);
      const { data: c } = await db.getCases(tid);
      if (c) setCases(c as Case[]);
      const { data: q } = await db.getAssessmentQuestions(tid);
      if (q) {
        const processedQuestions = (q as AssessmentQuestion[]).map(item => {
          if (item.question === '您的出生年月') {
            return { ...item, question: '年龄', input_type: 'number' as const };
          }
          return item;
        }).filter(item => !item.question.includes('姓名'));
        setAssessmentQuestions(processedQuestions);
      }
      if (user && viewMode === 'admin') {
        const { data: inq } = await db.getInquiries();
        if (inq) setInquiries(inq as Inquiry[]);
      }
    };
    fetchData();
  }, [user, currentTenant, viewMode, isResolved]);

  const handleAssessmentComplete = (answers: Record<string, string>) => {
    const summary = Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n');
    setTempAssessmentData(answers);
    setInquiryForm(prev => ({
      ...prev,
      subject: "风险评估结果咨询",
      content: `【风险评估报告】\n${summary}`
    }));
    setIsAssessmentOpen(false);
    setTimeout(() => setIsModalOpen(true), 300);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTenantId = currentTenant?.id;
    if (!targetTenantId) return alert("无法识别租户信息");
    const { data, error } = await db.createInquiry({
      tenant_id: targetTenantId,
      customer_name: inquiryForm.name,
      phone: inquiryForm.phone,
      subject: inquiryForm.subject,
      assessment_data: tempAssessmentData || {},
      status: 'pending'
    });
    if (!error && data) {
      setInquiries([data as Inquiry, ...inquiries]);
      setIsModalOpen(false);
      setInquiryForm({ name: "", phone: "", subject: "家庭保障方案定制", content: "", willingToCall: true });
      setTempAssessmentData(null); // 提交成功后清理
      alert("预约成功！我们将尽快联系您。");
    }
  };

  const handleCloseAppointmentModal = () => {
    setIsModalOpen(false);
    setTempAssessmentData(null); // 关闭或放弃时清理评估数据，确保不保存
  };

  const [copySuccess, setCopySuccess] = useState(false);
  const handleShare = () => {
    const slug = currentTenant?.slug;
    if (!slug) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?s=${slug}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    const { error } = await signInWithPassword(phone, password);
    setIsAuthLoading(false);
    if (error) setErrorMsg(error.message);
  };

  const handleLogout = async () => {
    localStorage.clear(); // 强制清除所有本地缓存
    await signOut();
    window.location.reload(); // 强制刷新以重置状态
  };

  const goToSection = (index: number) => {
    setActiveSection(index);
    setIsMenuOpen(false);
    setShowMoreMenu(false);
  };

  // 侧边滑动逻辑
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && activeSection < SECTIONS.length - 1) goToSection(activeSection + 1);
    else if (distance < -50 && activeSection > 0) goToSection(activeSection - 1);
  };

  // 移动端导航展开状态
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // --- 管理员视图 ---
  if (viewMode === 'admin') {
    return (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-primary font-black">载入管理系统...</div>}>
        <AdminDashboard
          tenantId={currentTenant?.id}
          inquiries={inquiries} insurancePlans={insurancePlans} cases={cases}
          setInquiries={setInquiries} setInsurancePlans={setInsurancePlans} setCases={setCases}
          assessmentQuestions={assessmentQuestions} setAssessmentQuestions={setAssessmentQuestions}
          onExit={() => setViewMode('landing')} onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  // --- 登录视图 ---
  if (viewMode === 'login') {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gold rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gold/20">
              <Shield className="w-10 h-10 text-navy" />
            </div>
            <h1 className="font-serif text-4xl text-white italic">Elite Account</h1>
            <p className="text-gray-400 mt-2 font-bold tracking-widest text-xs uppercase">授权经纪人登录</p>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Security ID / Phone</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-navy/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white focus:border-gold outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Access Key / Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-navy/50 border border-white/5 rounded-2xl py-5 pl-14 pr-12 text-white focus:border-gold outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              {errorMsg && <div className="text-red-400 text-xs font-bold bg-red-400/10 p-4 rounded-xl border border-red-400/20">{errorMsg}</div>}
              <button type="submit" disabled={isAuthLoading} className="w-full bg-gold text-navy font-black py-5 rounded-2xl shadow-2xl shadow-gold/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                {isAuthLoading ? "身份验证中..." : "进入管理系统"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- 门户首页视图 (Elite Trust) ---
  return (
    <div
      className="h-screen w-screen overflow-hidden bg-white text-navy font-sans select-none relative"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      {/* 1. 全球悬浮导航 (Elite Glass) */}
      <nav
        onClick={() => !isNavExpanded && setIsNavExpanded(true)}
        className={`fixed top-6 right-6 md:left-1/2 md:-translate-x-1/2 z-[150] elite-glass rounded-[32px] md:rounded-3xl transition-all duration-500 shadow-2xl shadow-navy/5 overflow-hidden 
          ${isNavExpanded ? 'w-[calc(100%-48px)] h-auto py-4 md:py-0 right-6' : 'hidden md:flex w-14 h-14 md:w-[calc(100%-48px)] md:h-20'} 
          max-w-7xl cursor-pointer md:cursor-default`}
      >
        <div className={`h-full px-4 md:px-10 flex flex-col md:flex-row items-center justify-between`}>
          <div className="flex items-center justify-between w-full md:w-auto h-full">
            <div onClick={(e) => { e.stopPropagation(); goToSection(0); setIsNavExpanded(false); }} className="flex items-center gap-3 cursor-pointer group shrink-0">
              <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <span className={`font-serif text-xl md:text-2xl italic font-black tracking-tight ${!isNavExpanded ? 'hidden md:block' : 'block'}`}>InsureElite</span>
            </div>

            {/* Mobile Close / Open Toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsNavExpanded(!isNavExpanded); }}
              className="md:hidden p-2 text-navy"
            >
              {isNavExpanded ? <X className="w-6 h-6" /> : null}
            </button>
          </div>

          <div className={`flex flex-col md:flex-row items-center gap-6 md:gap-10 mt-6 md:mt-0 w-full md:w-auto ${!isNavExpanded ? 'hidden md:flex' : 'flex'}`}>
            {SECTIONS.slice(1).map((name, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); goToSection(idx + 1); setIsNavExpanded(false); }}
                className={`text-sm font-bold tracking-widest uppercase transition-all relative group ${activeSection === idx + 1 ? 'text-gold' : 'text-navy/60 hover:text-navy'}`}
              >
                {name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-300 ${activeSection === idx + 1 ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
            ))}
            <div className="h-px w-full bg-navy/5 md:hidden"></div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); setIsNavExpanded(false); }}
              className="bg-navy text-white px-8 py-4 md:px-5 md:py-2.5 rounded-2xl md:rounded-xl text-sm md:text-xs font-black uppercase tracking-widest hover:bg-navy/90 hover:scale-105 transition-all shadow-lg shadow-navy/10 w-full md:w-auto flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-gold" /> 专属预约
            </button>
          </div>
        </div>
      </nav>

      {/* 2. 主滑块容器 */}
      <div
        className="flex h-full w-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ transform: `translateX(-${activeSection * 100}%)` }}
      >
        {/* SECTION 0: Hero - 精英形象区 */}
        <div className="w-full h-full flex-shrink-0 pt-0 overflow-y-auto scroll-container">
          <section className="relative min-h-screen flex flex-col justify-start items-center px-6 md:px-12 pt-10 md:pt-32 pb-20 md:pb-10">
            <div className="max-w-7xl mx-auto w-full space-y-12 md:space-y-20">
              {/* 描述文本移至顶部 */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <p className="text-[10px] md:text-sm text-gold font-black uppercase tracking-[0.3em] mb-2 opacity-60">Professional Asset Protection</p>
                <p className="text-xs sm:text-lg md:text-xl text-navy/60 font-medium max-w-2xl leading-relaxed italic">
                  在充满变数的时代，我们为您建立动态的资产防护。不仅是保障，更是价值与爱在时间长河中的跨代传承。
                </p>
              </div>

              {/* 1. Hero 核心区：Mobile 堆叠 / Desktop 并列 */}
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-16 w-full text-center md:text-left">

                {/* 头像模块 */}
                <div className="flex flex-col items-center justify-between shrink-0 group order-1 md:order-1">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gold/10 rounded-[40px] blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                    <div className="relative w-32 h-32 sm:w-40 md:w-52 md:h-52 rounded-[32px] md:rounded-[44px] overflow-hidden border-4 md:border-6 border-white shadow-2xl mx-auto">
                      <img src={tenantProfile?.avatar_url || "/assets/avatar.jpg"} className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Specialist" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white elite-glass p-1.5 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg border border-gold/10">
                      <div className="font-serif text-[10px] md:text-sm italic text-gold font-black uppercase">Elite</div>
                    </div>
                  </div>
                  {/* 荣衔标签 */}
                  <div className="inline-flex items-center gap-2 bg-bg-soft elite-glass px-4 py-2 rounded-xl border border-navy/5 shadow-sm mt-4">
                    <Award className="w-3 h-3 text-gold" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-navy/60 leading-none">
                      {tenantProfile?.raw_user_meta_data?.honor || 'Senior Wealth Architect'}
                    </span>
                  </div>
                </div>

                {/* 文案与行动点 */}
                <div className="flex-grow flex flex-col justify-center gap-6 md:gap-10 order-2 md:order-2 overflow-hidden">
                  <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl italic leading-[1.2] md:leading-[1.1] text-navy tracking-tight">
                    守护每一项<br className="hidden sm:block" />被寄予<span className="text-gold underline decoration-gold/20 underline-offset-[8px] md:underline-offset-[12px]">厚望</span>的资产
                  </h1>

                  <div className="flex flex-row gap-2 md:gap-4 justify-center md:justify-start">
                    <button onClick={() => setIsModalOpen(true)} className="bg-navy text-white hover:bg-navy/95 border-none rounded-2xl px-4 py-4 md:px-8 md:py-4 text-xs md:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-navy/10 transition-all active:scale-95 flex-1 md:flex-none max-w-[160px] whitespace-nowrap">
                      预约咨询 <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold" />
                    </button>
                    <button
                      onClick={() => setIsAssessmentOpen(true)}
                      className="bg-white text-navy hover:bg-gray-50 border border-navy/5 rounded-2xl px-4 py-4 md:px-8 md:py-4 text-xs md:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 flex-1 md:flex-none max-w-[160px] whitespace-nowrap"
                    >
                      风险评估
                    </button>
                    <button onClick={handleShare} className={`border-2 rounded-2xl px-4 py-4 md:px-8 md:py-4 text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 flex-1 md:flex-none max-w-[160px] whitespace-nowrap ${copySuccess ? 'border-green-500 text-green-600 bg-green-50' : 'border-navy/5 text-navy hover:bg-navy/5'}`}>
                      <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span>{copySuccess ? '已复制' : '分享'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. 方案/案例 (上对齐) */}
              <div className="w-full pt-4 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                <div className="flex flex-col gap-16 md:gap-24 w-full">
                  {/* 方案集 */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-navy/5 pb-4">
                      <h3 className="font-serif text-xl md:text-2xl italic font-black text-navy flex items-center gap-3">
                        <Star className="w-5 h-5 text-gold fill-gold" /> 精选方案
                      </h3>
                      <button onClick={() => setIsPlansModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-navy transition-colors">Explorer</button>
                    </div>
                    <div className="flex flex-col gap-4 pb-6 scroll-container w-full">
                      {insurancePlans.length > 0 ? insurancePlans.slice(0, 3).map(plan => (
                        <div key={plan.id} onClick={() => setIsPlansModalOpen(true)} className="w-full shrink-0 p-4 md:p-6 rounded-3xl bg-white border border-navy/5 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all cursor-pointer group">
                          <div className="text-[10px] font-serif italic text-gold mb-1 md:mb-2">{plan.type}</div>
                          <h4 className="font-bold text-navy group-hover:text-gold transition-colors truncate text-sm md:text-base">{plan.title}</h4>
                          <div className="mt-3 md:mt-4 flex items-center gap-2 text-[10px] font-bold text-navy/40">
                            <CheckCircle2 className="w-3 h-3 text-gold" /> {plan.benefit}
                          </div>
                        </div>
                      )) : (
                        <div className="text-navy/20 font-black italic">正在为您解析方案集...</div>
                      )}
                    </div>
                  </div>

                  {/* 典型案例 */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-navy/5 pb-4">
                      <h3 className="font-serif text-xl md:text-2xl italic font-black text-navy flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-gold" /> 典型案例
                      </h3>
                      <button onClick={() => goToSection(3)} className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-navy transition-colors">Case Wall</button>
                    </div>
                    <div className="flex flex-col gap-4 pb-6 scroll-container w-full">
                      {cases.length > 0 ? cases.filter(c => !c.is_archived).slice(0, 3).map(c => (
                        <div key={c.id} onClick={() => setSelectedCase(c)} className="w-full shrink-0 flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-3xl bg-white border border-navy/5 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all cursor-pointer group">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 border border-navy/5">
                            <img src={c.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Case" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] md:text-[10px] font-black text-gold mb-0.5 md:mb-1">{c.tag}</div>
                            <h4 className="font-bold text-navy truncate text-sm md:text-base">{c.title}</h4>
                          </div>
                        </div>
                      )) : (
                        <div className="text-navy/20 font-black italic">理赔案例同步中...</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION 1: Services - 专业服务 */}
        <div className="w-full h-full flex-shrink-0 pt-10 md:pt-32 pb-24 overflow-y-auto scroll-container bg-bg-soft/50">
          <section className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-20 gap-8">
              <div className="space-y-4">
                <h2 className="font-serif text-5xl md:text-7xl italic text-navy leading-tight">核心专业领域</h2>
                <div className="w-24 h-1 bg-gold rounded-full"></div>
              </div>
              <p className="text-navy/50 max-w-sm text-lg font-medium italic">我们不只是保险销售，更是您家庭风险的精算师与资产的领航者。</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {SERVICES.map((s) => (
                <ServiceCard key={s.id} {...s} onLinkClick={() => setIsModalOpen(true)} />
              ))}
            </div>
          </section>
        </div>

        {/* SECTION 2: About - 关于我们 */}
        <div className="w-full h-full flex-shrink-0 pt-10 md:pt-32 pb-24 overflow-y-auto scroll-container">
          <AboutSection profile={tenantProfile} />
        </div>

        {/* SECTION 3: Knowledge - 理赔实录 */}
        <div className="w-full h-full flex-shrink-0 pt-10 md:pt-32 pb-24 overflow-y-auto scroll-container bg-bg-soft/50">
          <section className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-16">
              <div className="lg:col-span-1 space-y-8">
                <h2 className="font-serif text-6xl italic text-navy leading-[1.1]">不仅是数字<br />更是<span className="text-gold">契约</span>的兑现</h2>
                <p className="text-lg text-navy/60 leading-relaxed font-medium">真实理赔案例，还原专业理财师在风险发生时的价值。我们全程陪同，确理赔无忧。</p>
                <div className="pt-10 space-y-6">
                  {QUICK_TOOLS.slice(0, 2).map((t, i) => (
                    <div key={i} className="flex items-center gap-5 p-6 rounded-3xl border border-navy/5 bg-white hover:border-gold transition-all cursor-pointer group shadow-sm">
                      <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-all">{t.icon}</div>
                      <span className="font-black text-navy">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                {cases.filter(c => !c.is_archived).slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCase(item)}
                    className="elite-card rounded-[40px] p-8 space-y-6 cursor-pointer"
                  >
                    <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                      <img src={item.image} className="w-full h-full object-cover scale-110" alt="Case" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2">{item.tag}</div>
                      <h4 className="font-serif text-2xl italic font-black text-navy line-clamp-2">{item.title}</h4>
                    </div>
                    <button className="text-navy/40 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:text-gold transition-all">
                      View Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* SECTION 4: Testimonials - 评价 */}
        <div className="w-full h-full flex-shrink-0 pt-10 md:pt-32 pb-24 overflow-y-auto scroll-container">
          <section className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
            <div className="text-center mb-24">
              <h2 className="font-serif text-5xl md:text-8xl italic text-navy underline decoration-gold/30 underline-offset-[12px]">客户的声音</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="bg-bg-soft p-12 rounded-[50px] relative">
                  <div className="absolute top-8 left-8 text-gold opacity-30 select-none font-serif text-8xl">“</div>
                  <div className="relative z-10 space-y-10">
                    <p className="text-navy font-medium text-lg leading-loose italic">“ {t.content} ”</p>
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-navy/10 rounded-full"></div>
                      <div>
                        <div className="font-black text-navy text-xl leading-none">{t.name}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gold mt-1.5">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 3. 底部快捷操作条 (移动端 Dock) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-10 duration-1000">
        <div className="bg-[#ff9d00] rounded-[32px] px-6 py-3 flex items-center gap-6 shadow-[0_20px_50px_rgba(255,157,0,0.3)] border border-white/20">
          {[
            { name: '首页', icon: <Home className="w-5 h-5" />, idx: 0 },
            { name: '服务', icon: <Briefcase className="w-5 h-5" />, idx: 1 },
            { name: '关于', icon: <User className="w-5 h-5" />, idx: 2 },
            { name: '记录', icon: <BookOpen className="w-5 h-5" />, idx: 3 },
            { name: '评价', icon: <Star className="w-5 h-5" />, idx: 4 }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => goToSection(item.idx)}
              className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${activeSection === item.idx ? 'text-white opacity-100 scale-110' : 'text-white/70 hover:text-white opacity-80'}`}
            >
              <div className={`${activeSection === item.idx ? 'bg-white/20 p-1.5 rounded-lg' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black tracking-tighter whitespace-nowrap">
                {item.name}
              </span>
            </button>
          ))}
          <div className="w-px h-8 bg-white/20 mx-1"></div>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`p-2 rounded-xl transition-all ${showMoreMenu ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 4. 更多菜单弹出 */}
      {showMoreMenu && (
        <div className="fixed bottom-26 left-1/2 -translate-x-1/2 bg-white elite-glass border border-navy/5 rounded-[32px] p-6 shadow-2xl z-[120] w-64 animate-in fade-in zoom-in duration-300">
          <div className="space-y-4">
            {!isSharedView && (
              <button
                onClick={(e) => { e.stopPropagation(); setViewMode('admin'); setShowMoreMenu(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gold/10 transition-all font-black text-navy"
              >
                <Lock className="w-5 h-5 text-gold" /> {user ? '进入后台' : '管理登录'}
              </button>
            )}

            {user && !isSharedView && (
              <button
                onClick={(e) => { e.stopPropagation(); handleLogout(); setShowMoreMenu(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-600 transition-all font-black"
              >
                <LogOut className="w-5 h-5" /> 退出登录
              </button>
            )}

            {(!user || isSharedView) && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsWeChatModalOpen(true); setShowMoreMenu(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gold/10 transition-all font-black text-navy"
              >
                <Mail className="w-5 h-5 text-gold" /> 联系我们
              </button>
            )}
          </div>
        </div>
      )}

      {/* 弹窗系统 */}
      <AppointmentModal isOpen={isModalOpen} onClose={handleCloseAppointmentModal} form={inquiryForm} subjects={INQUIRY_SUBJECTS} setForm={setInquiryForm} onSubmit={handleInquirySubmit} />
      <PlansModal isOpen={isPlansModalOpen} onClose={() => setIsPlansModalOpen(false)} plans={insurancePlans} />
      <CaseDetailsModal isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} item={selectedCase} />
      <AssessmentModal isOpen={isAssessmentOpen} onClose={() => setIsAssessmentOpen(false)} questions={assessmentQuestions} onComplete={handleAssessmentComplete} />
      <WeChatModal isOpen={isWeChatModalOpen} onClose={() => setIsWeChatModalOpen(false)} />
    </div>
  );
}

export default App;
