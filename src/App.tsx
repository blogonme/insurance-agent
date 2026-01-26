import {
  Shield, ChevronRight, ChevronLeft, Menu, X, ArrowRight, Star, CheckCircle2, 
  Home, BookOpen, Briefcase, Calendar, Award, User, Lock, Eye, 
  EyeOff, PlusCircle, ArrowUpCircle, Activity, TrendingUp, MoreHorizontal, Share2
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

// 延迟加载后台管理模块，提升首屏性能
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

// --- 缓存 Key (Legacy removed) ---
// const PLANS_STORAGE_KEY = "insurepro_plans";
// const INQUIRIES_STORAGE_KEY = "insurepro_inquiries";

function App() {
  const { user, signInWithPhone, verifyOtp, signOut } = useAuth();

  // 核心路由与 UI 状态
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'admin'>('landing');
  const [currentTenant, setCurrentTenant] = useState<{ id: string, name: string, slug: string } | null>(null);
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [isResolved, setIsResolved] = useState(false);

  // 租户解析与初始路由逻辑
  useEffect(() => {
    const resolveTenant = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('s');

      if (slug) {
        // 如果有 URL 参数，尝试解析租户
        const { data: tenant } = await db.getTenantBySlug(slug);
        if (tenant) {
          setCurrentTenant(tenant);
          const { data: profile } = await db.getTenantProfile(tenant.id);
          if (profile) setTenantProfile(profile);
          setViewMode('landing');
        } else {
          console.error('Tenant not found for slug:', slug);
          // 找不到租户时，可以保持 landing 但提示错误，或者进入演示模式
        }
      } else if (!user) {
        // 无参数且未登录，默认进入登录页或演示
        setViewMode('login');
      } else {
        // 已登录且无特定租户参数，锁定为自己的租户
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

  // 当登录状态改变时，根据身份自动锁定租户（如果是经纪人）
  useEffect(() => {
    if (user && !currentTenant) {
       // 如果已登录但尚未通过 URL 锁定租户，则可以默认锁定为自己的租户 (TODO: Fetch own tenant)
    }
  }, [user]);

  const [activeSection, setActiveSection] = useState(0); 
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false); // Assessment State
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const handleAssessmentComplete = (answers: Record<string, string>) => {
    const summary = Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n');
    setInquiryForm(prev => ({
        ...prev,
        subject: "智能评估结果咨询",
        content: `【智能风险评估报告】\n${summary}\n\n(用户已完成评估，请根据上述情况提供定制方案)`
    }));
    setIsAssessmentOpen(false);
    setTimeout(() => setIsModalOpen(true), 300); // Open contact form
  };

  const [cases, setCases] = useState<Case[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [heroTab, setHeroTab] = useState<'plans'|'cases'>('plans');
  const [qrTab, setQrTab] = useState<'personal' | 'oa'>('personal');
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);

  const SECTIONS = ['首页', '专业服务', `关于${tenantProfile?.full_name || '我'}`, '保险百科', '客户评价']; // 对应索引 0-4
  
  // 登录相关状态
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // 业务数据状态
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const [inquiryForm, setInquiryForm] = useState({
    name: "", phone: "", subject: "家庭保障方案定制", content: "", willingToCall: true
  });

  // 副作用：从 Supabase 初始化数据
  useEffect(() => {
    if (!isResolved) return;

    const fetchData = async () => {
      // 如果已获取租户 ID，则只拉取该租户的数据；否则（经纪人模式）根据 RLS 自动过滤
      const tid = currentTenant?.id;

      const { data: plans } = await db.getPlans(tid);
      if (plans) setInsurancePlans(plans as InsurancePlan[]);

      const { data: c } = await db.getCases(tid);
      if (c) setCases(c as Case[]);

      const { data: q } = await db.getAssessmentQuestions(tid);
      if (q) setAssessmentQuestions(q as AssessmentQuestion[]);

      // 仅在已登录且在管理模式时加载咨询记录
      if (user && viewMode === 'admin') {
        const { data: inq } = await db.getInquiries();
        if (inq) setInquiries(inq as Inquiry[]);
      }
    };
    fetchData();
  }, [user, currentTenant, viewMode, isResolved]);

  // 逻辑：处理咨询提交 (写入 Supabase)
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果是匿名用户且没有租户上下文，在 RLS 模式下目前前端所有租户共享一个 Demo ID 或由后端触发器处理。
    // 考虑到目前是单人/单租户演示，我们默认让触发器或手动设置生效。
    
    const finalContent = inquiryForm.subject === "其他需求..." ? inquiryForm.content : inquiryForm.subject;
    
    // 提交咨询时，必须绑定租户 ID
    const targetTenantId = currentTenant?.id;

    if (!targetTenantId) {
       alert("无法识别租户信息，无法提交咨询。");
       return;
    }

    const { data, error } = await db.createInquiry({
      tenant_id: targetTenantId,
      customer_name: inquiryForm.name,
      phone: inquiryForm.phone,
      subject: finalContent,
      status: 'pending'
    });

    if (error) {
      alert("提交失败，请稍后重试: " + error.message);
      return;
    }

    if (data) setInquiries([data as Inquiry, ...inquiries]);
    setIsModalOpen(false);
    setInquiryForm({ name: "", phone: "", subject: "家庭保障方案定制", content: "", willingToCall: true });
    alert(`预约成功！${tenantProfile?.full_name || '我'}经理将尽快与您联系。`);
  };

  const [copySuccess, setCopySuccess] = useState(false);
  const handleShare = () => {
    const slug = currentTenant?.slug;
    if (!slug) return alert("无法生成分享链接");
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?s=${slug}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
       setCopySuccess(true);
       setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // 处理发送验证码
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setErrorMsg("请输入手机号");
    
    setIsAuthLoading(true);
    setErrorMsg("");
    const { error } = await signInWithPhone(phone);
    setIsAuthLoading(false);

    if (error) {
      setErrorMsg(error.message || "发送失败，请稍后重试");
    } else {
      setIsOtpSent(true);
    }
  };

  // 处理验证码登入
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return setErrorMsg("请输入验证码");

    setIsAuthLoading(true);
    setErrorMsg("");
    const { error } = await verifyOtp(phone, otpCode);
    setIsAuthLoading(false);

    if (error) {
      setErrorMsg(error.message || "验证失败，请检查验证码");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setViewMode('landing');
  };

  const goToSection = (index: number) => {
    setActiveSection(index);
    setIsMenuOpen(false);
    setShowMoreMenu(false); // 关闭更多菜单
    // 移除 window.scrollTo，因为现在是水平滑动
  };

  const latestPlan = insurancePlans.find((p: any) => p.is_latest) || insurancePlans[0] || INITIAL_PLANS[0];

  // --- Mobile Swipe Logic ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeSection < SECTIONS.length - 1) {
      goToSection(activeSection + 1);
    }
    if (isRightSwipe && activeSection > 0) {
      goToSection(activeSection - 1);
    }
  };

  // --- 视图渲染：后台管理 ---
  if (viewMode === 'admin') {
    return (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-primary font-bold">载入管理系统...</div>}>
        <AdminDashboard 
          inquiries={inquiries}
          insurancePlans={insurancePlans}
          cases={cases}
          setInquiries={setInquiries}
          setInsurancePlans={setInsurancePlans}
          setCases={setCases}
          assessmentQuestions={assessmentQuestions}
          setAssessmentQuestions={setAssessmentQuestions}
          onExit={() => setViewMode('landing')}
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  // --- 视图渲染：登录页 ---
  if (viewMode === 'login') {
    return (
      <div className="min-h-screen text-white flex items-center justify-center p-6" style={{ background: 'var(--app-background)' }}>
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">欢迎回来</h1>
            <p className="text-gray-500 mt-2 text-sm italic">请先验证您的身份以进入系统</p>
          </div>
          
          <div className="bg-card border border-white/10 p-8 rounded-[32px] shadow-2xl text-left">
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">手机号</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="tel" placeholder="13800138000" required
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>
                {errorMsg && <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">{errorMsg}</div>}
                <button 
                  type="submit" disabled={isAuthLoading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl mt-4 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isAuthLoading ? "正在发送..." : "发送验证码"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">验证码 (发送至 {phone})</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" placeholder="123456" autoFocus required
                      value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:outline-none transition-all font-mono tracking-[1em] text-center"
                    />
                  </div>
                </div>
                {errorMsg && <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">{errorMsg}</div>}
            <button type="submit" disabled={isAuthLoading}
                   className="w-full bg-primary text-white font-bold py-4 rounded-2xl mt-4 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                 >
                   {isAuthLoading ? "正在验证..." : "确认登录"}
                 </button>
                 <button 
                   type="button" onClick={() => setIsOtpSent(false)}
                   className="w-full text-gray-500 text-xs font-bold hover:text-white transition-colors"
                 >
                   修改手机号
                 </button>
               </form>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- 视图渲染：门户首页 (水平翻页重构) ---
  return (
    <div 
      className="h-screen w-screen overflow-hidden bg-black text-white selection:bg-primary/30 font-sans relative" 
      style={{ background: 'var(--app-background)' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 1. 顶部导航栏 (固定) */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-card/60 backdrop-blur-xl h-16 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div onClick={() => goToSection(0)} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">InsurePro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium font-bold">
            {SECTIONS.slice(1).map((name, idx) => ( // 从索引 1 (服务) 开始
              <button key={idx} onClick={() => goToSection(idx + 1)} className={`transition-colors cursor-pointer ${activeSection === idx + 1 ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                {name}
              </button>
            ))}
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer ml-4">
              <Calendar className="w-4 h-4" /> 预约咨询
            </button>
          </div>
          {/* 移动端顶部仅保留 Logo 和 预约 (菜单移到底部的"更多") */}
          <button onClick={() => setIsModalOpen(true)} className="md:hidden bg-primary/20 text-primary p-2 rounded-lg">
             <Calendar className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* 2. 主内容滑块容器 */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-in-out" 
        style={{ transform: `translateX(-${activeSection * 100}%)` }}
      >
        {/* SECTION 0: Hero */}
        <div className="w-full h-full flex-shrink-0 overflow-y-auto overflow-x-hidden pt-0 scroll-container">
          <section className="relative min-h-[calc(100vh-64px)] flex flex-col justify-start items-center text-center px-6 pt-28 md:pt-40 pb-24 md:pb-12">
             {/* Hero 内容保持不变 */}
             <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10 w-full">
                {/* Top Section: Avatar (Left) + Text Info (Right) */}
                <div className="flex flex-row items-center justify-between w-full mb-8 px-2">
                   <div className="flex flex-row items-center gap-4 md:gap-8 flex-grow min-w-0 justify-start">
                       
                       {/* Left: Avatar Column */}
                       <div className="flex flex-col items-center gap-3 md:gap-4 flex-shrink-0">
                           {/* Avatar Image Wrapper */}
                           <div className="relative group cursor-pointer animate-in fade-in zoom-in duration-700">
                              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                              <img src={tenantProfile?.avatar_url || "/assets/avatar.jpg"} alt={tenantProfile?.full_name || "经纪人"} className="w-36 h-36 md:w-64 md:h-64 rounded-full border-4 border-white/10 shadow-2xl relative z-10 object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute bottom-2 right-2 bg-primary text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full border border-black/20 shadow-lg translate-y-1/4 translate-x-1/4 z-20">
                                PRO
                              </div>
                           </div>
                           {/* Badge (Moved Here) */}
                           <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-sm font-bold tracking-widest text-primary flex items-center gap-2 uppercase whitespace-nowrap shadow-lg">
                                <Award className="w-3 h-3 md:w-4 md:h-4" /> {tenantProfile?.raw_user_meta_data?.honor || '资深理财规划师'}
                           </div>
                       </div>
    
                       {/* Middle: Text Content */}
                       <div className="flex flex-col items-start text-left flex-grow min-w-0 justify-center h-full">
                          <h1 className="text-2xl md:text-7xl font-black mb-3 leading-[1.1] tracking-tighter">
                             把专业<br />留给深耕者
                          </h1>
                          <p className="text-gray-400 text-xs md:text-xl leading-relaxed font-medium opacity-80 line-clamp-2 md:line-clamp-none w-full">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-400 block mb-1">保障属于懂生活的人</span>
                            只做您家庭资产的动态防护网。
                          </p>
                       </div>
                   </div>

                   {/* Right: QR Code */}
                   <div className="hidden md:block flex-shrink-0 ml-4 md:ml-12">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300 group/qr cursor-pointer">
                         {/* Tabs */}
                         <div className="flex bg-black/40 rounded-lg p-1 mb-3">
                            <button 
                                onClick={() => setQrTab('personal')}
                                className={`flex-1 text-[10px] py-1 rounded-md font-bold transition-all ${qrTab === 'personal' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                个人号
                            </button>
                            <button 
                                onClick={() => setQrTab('oa')}
                                className={`flex-1 text-[10px] py-1 rounded-md font-bold transition-all ${qrTab === 'oa' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                公众号
                            </button>
                         </div>
                         <div className="bg-white p-1 rounded-lg overflow-hidden relative w-24 h-24">
                           <img src="/assets/qrcode_v2.png" alt="Personal QR" className={`w-full h-full object-cover transition-opacity duration-300 absolute inset-0 ${qrTab === 'personal' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
                           <img src="/assets/qrcode_oa.png" alt="OA QR" className={`w-full h-full object-cover transition-opacity duration-300 absolute inset-0 ${qrTab === 'oa' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
                         </div>
                         <div className="text-center mt-2 mb-0.5">
                            <div className="text-[10px] font-bold text-white group-hover/qr:text-primary transition-colors">
                                {qrTab === 'personal' ? '扫一扫加好友' : '扫一扫关注'}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-row gap-3 mb-6 w-full justify-start px-2">
                   <button onClick={() => setIsAssessmentOpen(true)} className="flex-1 md:flex-none px-6 py-3.5 md:px-8 md:py-5 bg-white text-black text-sm md:text-lg font-black rounded-2xl md:rounded-3xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-white/10">
                      开启评估 <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                   {(currentTenant || user) && (
                      <button onClick={handleShare} className={`flex-1 md:flex-none px-6 py-3.5 md:px-8 md:py-5 font-black rounded-2xl md:rounded-3xl transition-all flex items-center justify-center gap-2 cursor-pointer border shadow-lg ${copySuccess ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                         <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                         <span className="text-sm md:text-lg">{copySuccess ? '已复制' : '分享链接'}</span>
                      </button>
                   )}
                   <button onClick={() => goToSection(1)} className="hidden md:flex flex-1 md:flex-none px-6 py-3.5 md:px-12 md:py-5 bg-neutral-900 border border-white/10 text-sm md:text-lg font-black rounded-2xl md:rounded-3xl hover:bg-neutral-800 transition-all items-center justify-center gap-2 cursor-pointer">
                     专属服务
                   </button>
                   {/* Mobile Only: Follow OA */}
                   <button onClick={() => setIsWeChatModalOpen(true)} className="md:hidden flex-1 px-6 py-3.5 bg-neutral-900 border border-white/10 text-sm font-black rounded-2xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-primary">
                     关注公众号
                   </button>
                </div>



                {/* Content Split View: Featured Plans & Cases */}
                <div className="w-full max-w-xl flex flex-col gap-4 px-2 mt-4 min-h-0 flex-grow-0">
                   
                   {/* 1. Featured Plans (Scrollable) */}
                   <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest px-1">
                         <TrendingUp className="w-4 h-4" /> 本月精选方案
                      </div>
                      <div className="max-h-[140px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {insurancePlans.filter((p: any) => p.is_latest).map((plan: any) => (
                           <div 
                             key={plan.id}
                             onClick={() => setIsPlansModalOpen(true)}
                             className="bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between group"
                           >
                              <div className="min-w-0">
                                 <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{plan.title}</h4>
                                 <p className="text-[10px] text-gray-400 truncate">{plan.highlight}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                           </div>
                        ))}
                        {insurancePlans.filter((p: any) => p.is_latest).length === 0 && (
                           <div className="text-xs text-gray-500 py-2 text-center">暂无精选方案</div>
                        )}
                      </div>
                   </div>

                   {/* 2. Cases (Scrollable) */}
                   <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest px-1">
                         <div className="w-1 h-3 bg-orange-400 rounded-full"></div> 实操案例
                      </div>
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {cases.filter((item: any) => !item.is_archived).map((item) => (
                           <div 
                             key={item.id} 
                             onClick={() => setSelectedCase(item)}
                             className="bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer group"
                           >
                              <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `url(${item.image})` }}></div>
                              <div className="text-left flex-grow min-w-0">
                                 <div className="text-[10px] text-primary/80 font-bold mb-0.5">{item.tag}</div>
                                 <div className="text-xs text-gray-300 font-bold truncate group-hover:text-white transition-colors">{item.title}</div>
                              </div>
                              <ArrowRight className="w-3 h-3 text-white/10 group-hover:text-white/50" />
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
             {/* 背景装饰 */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[140px]"></div>
             </div>
          </section>
        </div>

        {/* SECTION 1: Services */}
        <div className="w-full h-full flex-shrink-0 overflow-y-auto overflow-x-hidden pt-28 pb-32 scroll-container">
          <section className="max-w-7xl mx-auto px-6 min-h-full flex flex-col">
            <div className="text-center mb-12 flex-shrink-0">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">我们的核心专业</h2>
              <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 flex-grow">
              {SERVICES.map((s) => (
                <ServiceCard key={s.id} {...s} onLinkClick={() => setIsModalOpen(true)} />
              ))}
            </div>
          </section>
        </div>

        {/* SECTION 2: About (使用 AboutSection 组件) */}
        <div className="w-full h-full flex-shrink-0 overflow-y-auto overflow-x-hidden pt-28 pb-32 scroll-container">
           <AboutSection />
        </div>

        {/* SECTION 3: Knowledge & Tools */}
        <div className="w-full h-full flex-shrink-0 overflow-y-auto overflow-x-hidden pt-28 pb-32 scroll-container">
          <section className="max-w-7xl mx-auto px-6 min-h-full flex flex-col justify-center">
             <div className="grid lg:grid-cols-2 gap-10 md:gap-20 items-center">
              <div className="text-left space-y-8 order-2 lg:order-1">
                <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl text-primary font-black text-xs uppercase tracking-widest border border-primary/20">
                   <BookOpen className="w-4 h-4" /> 深度认知 · 消除盲点
                </div>
                <h3 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter">
                  保险不是开盲盒<br /><span className="opacity-40">我们提供最透明的深度解析</span>
                </h3>
                <div className="space-y-4">
                  {KNOWLEDGE_ITEMS.map((ki, idx) => (
                    <div key={idx} className="group p-5 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-4 mb-2">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{ki.icon}</div>
                         <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">{ki.title}</div>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed ml-14">{ki.desc}</p>
                    </div>
                  ))}
                </div>
                {/* 插入方案推荐卡片到此处，充分利用空间 */}
                <div className="mt-8 pt-8 border-t border-white/5">
                   <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary"/> 精选方案</h4>
                   <div onClick={() => setIsPlansModalOpen(true)} className="bg-gradient-to-br from-indigo-900/40 to-primary/20 border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition-all group">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">{latestPlan.title}</div>
                            <div className="text-sm text-gray-400 mt-1">{latestPlan.description || latestPlan.desc}</div>
                         </div>
                         <ArrowRight className="text-white/30 group-hover:translate-x-1" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-8 order-1 lg:order-2">
                 {/* 工具箱 */}
                 <div className="bg-card border border-white/10 p-8 md:p-12 rounded-[48px] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5"><Activity className="w-64 h-64" /></div>
                    <h4 className="text-2xl font-black mb-8 text-white relative z-10 flex items-center gap-4">
                      精准决策工具箱 <ChevronRight className="w-6 h-6 text-primary" />
                    </h4>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      {QUICK_TOOLS.map((t, idx) => (
                        <button key={idx} className="flex flex-col items-center gap-4 p-6 rounded-[28px] bg-black/40 border border-white/5 hover:border-primary/40 hover:bg-black/60 transition-all group cursor-pointer text-center">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:text-primary transition-colors">{t.icon}</div>
                          <span className="font-bold text-gray-300 text-sm">{t.title}</span>
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION 4: Testimonials */}
        <div className="w-full h-full flex-shrink-0 overflow-y-auto overflow-x-hidden pt-28 pb-32 scroll-container">
           <section className="max-w-7xl mx-auto px-6 h-full flex flex-col">
              <div className="text-center mb-16 flex-shrink-0">
                <h2 className="text-4xl font-bold mb-4">客户声音</h2>
                <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-left pb-20">
                {TESTIMONIALS.map((t, idx) => (
                  <div key={idx} className="bg-card border border-white/5 p-8 rounded-[40px] flex flex-col">
                    <div className="flex items-center gap-1 text-primary mb-6">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-8 text-base flex-grow font-medium">“ {t.content} ”</p>
                    <div className="mt-auto">
                        <div className="font-bold text-white text-lg">{t.name}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
               <footer className="mt-auto py-12 border-t border-white/5 text-center text-gray-500 text-sm">
                  <div className="mb-4 flex justify-center items-center gap-2 text-white font-bold"><Shield className="w-5 h-5"/> InsurePro · {tenantProfile?.full_name || '彭艳'}</div>
                  <p>© 2026 {tenantProfile?.full_name || '彭艳'} · {tenantProfile?.raw_user_meta_data?.company || '阳光保险集团'} | {tenantProfile?.raw_user_meta_data?.title || '高级理财规划师'}</p>
                 <div className="mt-4 flex justify-center gap-6">
                    <button onClick={() => setViewMode('admin')} className="hover:text-white underline">管理入口</button>
                    <button className="hover:text-white">隐私政策</button>
                 </div>
              </footer>
           </section>
        </div>
      </div>

      {/* 3. 桌面端左右切换箭头 (仅在非 Hero 页且非宽屏可见，增强交互提示) */}
      <div className="hidden lg:block pointer-events-none fixed inset-0 z-40">
         <div className="absolute top-1/2 left-4 -translate-y-1/2">
            {activeSection > 0 && (
               <button onClick={() => goToSection(activeSection - 1)} className="pointer-events-auto w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110">
                  <ChevronLeft className="w-6 h-6" />
               </button>
            )}
         </div>
         <div className="absolute top-1/2 right-4 -translate-y-1/2">
            {activeSection < 4 && (
               <button onClick={() => goToSection(activeSection + 1)} className="pointer-events-auto w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110">
                  <ChevronRight className="w-6 h-6" />
               </button>
            )}
         </div>
      </div>

      {/* 4. 移动端底部导航 (四模块+更多) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500 w-max">
        {/* 更多菜单弹出层 */}
        {showMoreMenu && (
           <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-40 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-1 overflow-hidden">
              {[ // 放在更多里的选项: 4(评价)
                { idx: 4, icon: <Star className="w-4 h-4"/>, label: '客户评价' },
              ].map((item) => (
                 <button key={item.idx} onClick={() => goToSection(item.idx)} className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-white/5 text-gray-300 text-xs font-bold active:bg-white/10 text-left">
                    {item.icon} {item.label}
                 </button>
              ))}
              <div className="h-px bg-white/10 my-1"></div>
              <button onClick={() => setViewMode('admin')} className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-white/5 text-gray-300 text-xs font-bold active:bg-white/10 text-left">
                 <Lock className="w-4 h-4"/> 管理入口
              </button>
           </div>
        )}
        
        {/* 底部 TabBar - 紧凑型 */}
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 flex items-center gap-3 md:gap-6 shadow-2xl shadow-black/80 relative">
           {/* 1. 首页 */}
           <button onClick={() => goToSection(0)} className={`flex flex-col items-center gap-0.5 min-w-[3rem] transition-all ${activeSection === 0 ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Home className={`w-5 h-5 ${activeSection === 0 && 'fill-current'}`} />
              <span className="text-[10px] transform scale-90 font-bold">首页</span>
           </button>

           {/* 2. 服务 (Home右边) */}
           <button onClick={() => goToSection(1)} className={`flex flex-col items-center gap-0.5 min-w-[3rem] transition-all ${activeSection === 1 ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Briefcase className="w-5 h-5" />
              <span className="text-[10px] transform scale-90 font-bold">服务</span>
           </button>
           
           {/* 3. 百科 (服务右边) */}
           <button onClick={() => goToSection(3)} className={`flex flex-col items-center gap-0.5 min-w-[3rem] transition-all ${activeSection === 3 ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] transform scale-90 font-bold">百科</span>
           </button>

           {/* 4. 关于 (第四个模块) */}
           <button onClick={() => goToSection(2)} className={`flex flex-col items-center gap-0.5 min-w-[3rem] transition-all ${activeSection === 2 ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <User className="w-5 h-5" />
              <span className="text-[10px] transform scale-90 font-bold">关于</span>
           </button>

           {/* 分隔线 */}
           <div className="w-px h-6 bg-white/10 mx-1"></div>

           {/* 更多 */}
           <button onClick={() => setShowMoreMenu(!showMoreMenu)} className={`flex flex-col items-center gap-0.5 min-w-[2.5rem] transition-all ${showMoreMenu ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}>
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] transform scale-90 font-bold">更多</span>
           </button>
        </div>
      </div>

      {/* Admin Dashboard (Handled via early return) */}

      {/* 弹窗组件 */}
      <AppointmentModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        form={inquiryForm} subjects={INQUIRY_SUBJECTS} setForm={setInquiryForm}
        onSubmit={handleInquirySubmit}
      />
      <PlansModal 
        isOpen={isPlansModalOpen} onClose={() => setIsPlansModalOpen(false)} 
        plans={insurancePlans} 
      />
      <CaseDetailsModal 
        isOpen={!!selectedCase} 
        onClose={() => setSelectedCase(null)} 
        item={selectedCase} 
      />
      <AssessmentModal 
        isOpen={isAssessmentOpen} 
        onClose={() => setIsAssessmentOpen(false)} 
        questions={assessmentQuestions}
        onComplete={handleAssessmentComplete}
      />
      <WeChatModal 
        isOpen={isWeChatModalOpen} 
        onClose={() => setIsWeChatModalOpen(false)} 
      />
    </div>
  );
}

export default App;
