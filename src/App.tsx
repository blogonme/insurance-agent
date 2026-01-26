import {
  Shield, ChevronRight, ChevronLeft, Menu, X, ArrowRight, Star, CheckCircle2, 
  Home, BookOpen, Briefcase, Calendar, Award, User, Lock, Eye, 
  EyeOff, PlusCircle, ArrowUpCircle, Activity, TrendingUp, MoreHorizontal
} from "lucide-react";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { ThemeSelector } from "./ThemeSelector";
import { 
  INITIAL_PLANS, SERVICES, KNOWLEDGE_ITEMS, 
  QUICK_TOOLS, TESTIMONIALS, INQUIRY_SUBJECTS, CASES 
} from "./data.tsx";
import { ServiceCard, AboutSection } from "./components/LandingComponents";
import { AppointmentModal, PlansModal } from "./components/Modals";

// 延迟加载后台管理模块，提升首屏性能
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

// --- 常量与缓存 Key ---
const AUTH_KEY = "admin_password";
const DEFAULT_PASS = "admin";
const PLANS_STORAGE_KEY = "insurepro_plans";
const INQUIRIES_STORAGE_KEY = "insurepro_inquiries";

function App() {
  // 核心路由与 UI 状态
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'admin'>('landing');
  const [activeSection, setActiveSection] = useState(0); 
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

  const SECTIONS = ['首页', '专业服务', '关于彭艳', '保险百科', '客户评价']; // 对应索引 0-4
  
  // 登录状态
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 保险方案持久化
  const [insurancePlans, setInsurancePlans] = useState(() => {
    const saved = localStorage.getItem(PLANS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  // 咨询数据持久化
  const [inquiries, setInquiries] = useState<any[]>(() => {
    const saved = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [inquiryForm, setInquiryForm] = useState({
    name: "", phone: "", subject: "家庭保障方案定制", content: "", willingToCall: true
  });

  // 副作用：同步至 LocalStorage
  useEffect(() => {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(insurancePlans));
  }, [insurancePlans]);

  useEffect(() => {
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    if (!localStorage.getItem(AUTH_KEY)) localStorage.setItem(AUTH_KEY, DEFAULT_PASS);
  }, []);

  // 逻辑：处理咨询提交
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInquiry = {
      ...inquiryForm,
      finalContent: inquiryForm.subject === "其他需求..." ? inquiryForm.content : inquiryForm.subject,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setInquiries([newInquiry, ...inquiries]);
    setIsModalOpen(false);
    setInquiryForm({ name: "", phone: "", subject: "家庭保障方案定制", content: "", willingToCall: true });
    alert("预约成功！彭艳经理将尽快与您联系。");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPass === localStorage.getItem(AUTH_KEY)) {
      setViewMode('admin');
      setErrorMsg("");
      setLoginPass("");
    } else {
      setErrorMsg("授权密码错误，请重试");
    }
  };

  const goToSection = (index: number) => {
    setActiveSection(index);
    setIsMenuOpen(false);
    setShowMoreMenu(false); // 关闭更多菜单
    // 移除 window.scrollTo，因为现在是水平滑动
  };

  const latestPlan = insurancePlans.find((p: any) => p.isLatest) || insurancePlans[0];

  // --- 视图渲染：后台管理 ---
  if (viewMode === 'admin') {
    return (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-primary font-bold">载入管理系统...</div>}>
        <AdminDashboard 
          inquiries={inquiries}
          insurancePlans={insurancePlans}
          setInquiries={setInquiries}
          setInsurancePlans={setInsurancePlans}
          onExit={() => setViewMode('landing')}
          onLogout={() => setViewMode('landing')}
          authKey={AUTH_KEY}
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
            <h1 className="text-3xl font-extrabold tracking-tight text-white">管理后台登入</h1>
            <p className="text-gray-500 mt-2 text-sm italic">InsurePro Admin System</p>
          </div>
          <form onSubmit={handleLogin} className="bg-card border border-white/10 p-8 rounded-[32px] shadow-2xl text-left">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">用户名</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input readOnly value="admin" className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-gray-400 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">管理密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type={showPass ? "text" : "password"} autoFocus value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:border-primary focus:outline-none transition-all font-mono"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            {errorMsg && <div className="mt-6 text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">{errorMsg}</div>}
            <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-2xl mt-8 hover:opacity-90 transition-all shadow-xl shadow-primary/20">确认登录</button>
            <button type="button" onClick={() => setViewMode('landing')} className="w-full text-gray-500 text-xs font-bold mt-6 hover:text-white uppercase tracking-widest">← 返回站点首页</button>
          </form>
        </div>
      </div>
    );
  }

  // --- 视图渲染：门户首页 (水平翻页重构) ---
  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white selection:bg-primary/30 font-sans relative" style={{ background: 'var(--app-background)' }}>
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
                <div className="flex flex-row items-center justify-between md:justify-start gap-4 md:gap-8 w-full mb-8 px-2">
                   {/* Left: Avatar (Enlarged 2x) */}
                   <div className="flex-shrink-0 relative group cursor-pointer animate-in fade-in zoom-in duration-700">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <img src="/assets/avatar.jpg" alt="彭艳" className="w-36 h-36 md:w-64 md:h-64 rounded-full border-4 border-white/10 shadow-2xl relative z-10 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute bottom-2 right-2 bg-primary text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full border border-black/20 shadow-lg translate-y-1/4 translate-x-1/4 z-20">
                        PRO
                      </div>
                   </div>

                   {/* Right: Text Content */}
                   <div className="flex flex-col items-start text-left flex-grow min-w-0 justify-center h-full">
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-sm font-bold tracking-widest text-primary mb-3 flex items-center gap-2 uppercase whitespace-nowrap">
                        <Award className="w-3 h-3 md:w-4 md:h-4" /> 连续五年阳光精英
                      </div>
                      <h1 className="text-2xl md:text-7xl font-black mb-3 leading-[1.1] tracking-tighter">
                         把专业<br />留给深耕者
                      </h1>
                      <p className="text-gray-400 text-xs md:text-xl leading-relaxed font-medium opacity-80 line-clamp-2 md:line-clamp-none w-full">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-400 block mb-1">保障属于懂生活的人</span>
                        只做您家庭资产的动态防护网。
                      </p>
                   </div>
                </div>

                <div className="flex flex-row gap-3 mb-6 w-full justify-start px-2">
                   <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none px-6 py-3.5 md:px-12 md:py-5 bg-white text-black text-sm md:text-lg font-black rounded-2xl md:rounded-3xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-white/10 group cursor-pointer">
                     开启评估 <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                   </button>
                   <button onClick={() => goToSection(1)} className="flex-1 md:flex-none px-6 py-3.5 md:px-12 md:py-5 bg-neutral-900 border border-white/10 text-sm md:text-lg font-black rounded-2xl md:rounded-3xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                     专属服务
                   </button>
                </div>

                {/* 阳光精选方案卡片 */}
                <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2 mb-6">
                  <div 
                    onClick={() => setIsPlansModalOpen(true)}
                    className="bg-indigo-950/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-indigo-900/60 hover:border-primary/30 transition-all group relative overflow-hidden"
                  >
                     <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                              <TrendingUp className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">本月精选方案</div>
                              <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{latestPlan.title}</h3>
                           </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                     </div>
                  </div>
                </div>

                {/* 保险案例 (Filling the empty space) */}
                <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 px-2">
                   <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="w-1 h-3 bg-primary rounded-full"></div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">实操案例</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {CASES.map((item) => (
                         <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `url(${item.image})` }}></div>
                            <div className="text-left overflow-hidden">
                               <div className="text-[10px] text-primary/80 font-bold mb-0.5">{item.tag}</div>
                               <div className="text-xs text-gray-300 font-medium truncate group-hover:text-white transition-colors">{item.title.split('：')[1]}</div>
                            </div>
                         </div>
                      ))}
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
                            <div className="text-sm text-gray-400 mt-1">{latestPlan.desc}</div>
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
                 <div className="mb-4 flex justify-center items-center gap-2 text-white font-bold"><Shield className="w-5 h-5"/> InsurePro · 彭艳</div>
                 <p>© 2026 彭艳 · 阳光保险集团 | 高级理财规划师</p>
                 <div className="mt-4 flex justify-center gap-6">
                    <button onClick={() => setViewMode('login')} className="hover:text-white underline">管理入口</button>
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
              <button onClick={() => setViewMode('login')} className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-white/5 text-gray-300 text-xs font-bold active:bg-white/10 text-left">
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
    </div>
  );
}

export default App;
