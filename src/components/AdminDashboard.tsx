import React, { useState } from 'react';
import { 
  Shield, Menu, X, LayoutDashboard, MessageSquare, TrendingUp, 
  Palette, FileSpreadsheet, Globe, LogOut, Trash2, 
  Edit3, Plus, Settings, Lock, Activity, Search, Link, GanttChart, CheckCircle2
} from "lucide-react";
import { ThemeSelector } from "../ThemeSelector";
import { searchNews } from "../services/SearchService";

interface AdminDashboardProps {
  inquiries: any[];
  insurancePlans: any[];
  cases: any[];
  assessmentQuestions: any[];
  setInquiries: (data: any[]) => void;
  setInsurancePlans: (data: any[]) => void;
  setCases: (data: any[]) => void;
  setAssessmentQuestions: (data: any[]) => void;
  onExit: () => void;
  onLogout: () => void;
  authKey: string;
}

const AdminDashboard = ({ 
  inquiries, 
  insurancePlans,
  cases, 
  assessmentQuestions,
  setInquiries, 
  setInsurancePlans,
  setCases, 
  setAssessmentQuestions,
  onExit, 
  onLogout,
  authKey
}: AdminDashboardProps) => {
  const [adminTab, setAdminTab] = useState<'dashboard' | 'messages' | 'appearance' | 'plans' | 'cases' | 'assessment'>('dashboard');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  // Plans State
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  // Cases State
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Case Archival State
  const [caseView, setCaseView] = useState<'published' | 'archived'>('published');

  const handleArchiveCase = (id: number) => {
    setCases(cases.map((c: any) => c.id === id ? { ...c, isArchived: true } : c));
  };

  const handleRestoreCase = (id: number) => {
    setCases(cases.map((c: any) => c.id === id ? { ...c, isArchived: false } : c));
  };

  // Assessment Config State
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // parse options from comma separated string if strictly string, or keep array
    // assuming editingQuestion.options is a string when editing, need to convert
    const optionsArray = typeof editingQuestion.options === 'string' ? editingQuestion.options.split(',').map((s:string)=>s.trim()) : editingQuestion.options;
    
    const formatted = { ...editingQuestion, options: optionsArray };

    if (formatted.id) {
       setAssessmentQuestions(assessmentQuestions.map(q => q.id === formatted.id ? formatted : q));
    } else {
       const newId = Math.max(0, ...assessmentQuestions.map(q => q.id)) + 1;
       setAssessmentQuestions([...assessmentQuestions, { ...formatted, id: newId }]);
    }
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: number) => {
      if(confirm('确定删除此问题吗？')) {
          setAssessmentQuestions(assessmentQuestions.filter(q => q.id !== id));
      }
  };

  // Password State
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" });
  const [passChangeMsg, setPassChangeMsg] = useState({ text: "", type: "" });

  const CASE_TAGS = ["重疾理赔", "财富增值", "法商智慧", "养老规划", "医疗理赔"];
  const SEARCH_PRESETS = ["重疾险案例", "家庭信托案例", "养老金规划", "百万医疗理赔"];

  // ... (keep inquiry handlers same) ...

  const handleToggleInquiryStatus = (id: number) => {
    setInquiries(inquiries.map(i => 
      i.id === id ? { ...i, status: i.status === 'pending' ? 'completed' : 'pending' } : i
    ));
  };

  const handleDeleteInquiry = (id: number) => {
    if (confirm("确定要删除这条咨询记录吗？")) {
      setInquiries(inquiries.filter(i => i.id !== id));
    }
  };

  // ... (keep plan handlers same) ...
  const handleSetLatest = (id: number) => {
    setInsurancePlans(insurancePlans.map((p: any) => ({ ...p, isLatest: p.id === id })));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan.id) {
      setInsurancePlans(insurancePlans.map((p: any) => p.id === editingPlan.id ? editingPlan : p));
    } else {
      const newId = Math.max(0, ...insurancePlans.map((p: any) => p.id)) + 1;
      setInsurancePlans([...insurancePlans, { ...editingPlan, id: newId }]);
    }
    setShowPlanForm(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (id: number) => {
    if (confirm("确定要删除这个保险方案吗？")) {
      setInsurancePlans(insurancePlans.filter((p: any) => p.id !== id));
    }
  };

  // Case Handlers
  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase.id) {
      setCases(cases.map((c: any) => c.id === editingCase.id ? editingCase : c));
    } else {
      const newId = Math.max(0, ...cases.map((c: any) => c.id)) + 1;
      setCases([...cases, { ...editingCase, id: newId }]);
    }
    setShowCaseForm(false);
    setEditingCase(null);
  };

  const handleDeleteCase = (id: number) => {
    if (confirm("确定要删除这个案例吗？")) setCases(cases.filter((c: any) => c.id !== id));
  };

   const [searchEngine, setSearchEngine] = useState<'baidu' | 'bing'>('baidu');

   const handleSearchNews = async (keyword: string) => {
    setSearchLoading(true);
    setSearchKeyword(keyword);
    const results = await searchNews(keyword, searchEngine);
    setSearchResults(results);
    setSearchLoading(false);
  };

  const handleSelectNews = (news: any) => {
    setEditingCase({
      ...editingCase,
      title: news.title,
      // 这里的 image 可能需要占位符，因为新闻图片可能抓取不到
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=200&h=150", 
      tag: "行业资讯" // 默认标签
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem(authKey);
    if (passForm.old !== stored) {
      setPassChangeMsg({ text: "旧密码验证失败", type: "error" });
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setPassChangeMsg({ text: "两次输入的新密码不一致", type: "error" });
      return;
    }
    localStorage.setItem(authKey, passForm.new);
    setPassChangeMsg({ text: "密码修改成功！", type: "success" });
    setPassForm({ old: "", new: "", confirm: "" });
  };

  return (
    <div className="min-h-screen text-white flex overflow-hidden w-full" style={{ background: 'var(--app-background)' }}>
      {isAdminMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsAdminMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative w-72 h-full border-r border-white/5 flex flex-col p-6 shrink-0 bg-black/40 backdrop-blur-3xl z-[70] transition-transform duration-300 ${isAdminMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-14 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-left">后台管理</span>
          </div>
          <button className="md:hidden p-2 text-gray-400" onClick={() => setIsAdminMenuOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        <nav className="flex-grow space-y-4">
          <button onClick={() => { setAdminTab('dashboard'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all ${adminTab === 'dashboard' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <LayoutDashboard className="w-6 h-6" /> 系统概览
          </button>
          <button onClick={() => { setAdminTab('messages'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all relative ${adminTab === 'messages' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <MessageSquare className="w-6 h-6" /> 咨询管理
            {inquiries.filter((i:any) => i.status === 'pending').length > 0 && (
              <span className="absolute top-4 right-5 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                {inquiries.filter((i:any) => i.status === 'pending').length}
              </span>
            )}
          </button>
          <button onClick={() => { setAdminTab('plans'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all ${adminTab === 'plans' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <FileSpreadsheet className="w-6 h-6" /> 方案管理
          </button>
          <button onClick={() => { setAdminTab('cases'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all ${adminTab === 'cases' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <TrendingUp className="w-6 h-6" /> 案例管理
          </button>
          <button onClick={() => { setAdminTab('assessment'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all ${adminTab === 'assessment' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <GanttChart className="w-6 h-6" /> 评估配置
          </button>
          <button onClick={() => { setAdminTab('appearance'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all ${adminTab === 'appearance' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <Palette className="w-6 h-6" /> 界面风格
          </button>
        </nav>

        <div className="border-t border-white/5 pt-8 space-y-3">
          <button onClick={onExit} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-gray-500 hover:text-white font-bold transition-all text-sm">
            <Globe className="w-5 h-5" /> 查看门户首页
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 text-red-500 font-bold transition-all text-sm">
            <LogOut className="w-5 h-5" /> 退出管理员账号
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden text-left">
        <header className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
             <span className="font-bold text-lg">Admin</span>
          </div>
          <button onClick={() => setIsAdminMenuOpen(true)} className="p-2 text-gray-400"><Menu className="w-6 h-6" /></button>
        </header>

        <main className="flex-grow overflow-y-auto p-6 md:p-12">
          <div className="max-w-5xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
                  {adminTab === 'dashboard' ? '控制面板' : 
                   adminTab === 'plans' ? '保险方案管理' : 
                   adminTab === 'cases' ? '实操案例管理' :
                   adminTab === 'messages' ? '咨询管理' : '界面外观设置'}
                </h2>
                <p className="text-gray-500 font-medium">欢迎回来，彭艳经理 · 您可以在此掌控站点的所有动态</p>
              </div>
            </header>

            {adminTab === 'dashboard' && (
              <>
                 <div className="grid md:grid-cols-3 gap-6">
                   {[
                     { label: "活跃咨询", value: inquiries.filter((i:any) => i.status === 'pending').length.toString(), sub: "待处理请求", icon: <MessageSquare className="w-5 h-5" /> },
                     { label: "全站访客", value: "2.4k", sub: "+15% 较上周", icon: <Activity className="w-5 h-5" /> },
                     { label: "保障余额", value: "5.2亿", sub: "业务覆盖 500+ 家庭", icon: <Shield className="w-5 h-5" /> },
                   ].map((stat, id) => (
                     <div key={id} className="p-8 rounded-[40px] bg-card border border-white/5 flex flex-col items-start gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">{stat.icon}</div>
                       <div>
                         <div className="text-gray-500 text-xs font-bold uppercase mb-1 tracking-widest">{stat.label}</div>
                         <div className="text-4xl font-extrabold mb-1">{stat.value}</div>
                         <div className="text-primary text-xs font-bold">{stat.sub}</div>
                       </div>
                     </div>
                   ))}
                 </div>
                 {/* Password Reset Section */}
                 <section className="bg-card p-12 rounded-[56px] border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03]"><Lock className="w-64 h-64" /></div>
                   <div className="flex items-center gap-4 mb-10 relative z-10">
                     <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary"><Settings className="w-6 h-6" /></div>
                     <h3 className="text-3xl font-bold">安全与授权密码</h3>
                   </div>
                   <form onSubmit={handleChangePassword} className="max-w-md space-y-8 relative z-10 text-left">
                     <input type="password" required placeholder="当前验证密码" value={passForm.old} onChange={(e) => setPassForm({...passForm, old: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 focus:border-primary focus:outline-none" />
                     <div className="grid grid-cols-2 gap-4">
                       <input type="password" required placeholder="新密码" value={passForm.new} onChange={(e) => setPassForm({...passForm, new: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 focus:border-primary focus:outline-none" />
                       <input type="password" required placeholder="确认新密码" value={passForm.confirm} onChange={(e) => setPassForm({...passForm, confirm: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 focus:border-primary focus:outline-none" />
                     </div>
                     {passChangeMsg.text && <div className={`p-4 rounded-xl text-sm ${passChangeMsg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{passChangeMsg.text}</div>}
                     <button type="submit" className="bg-primary text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90">更新后台授权密码</button>
                   </form>
                 </section>
              </>
            )}

            {adminTab === 'appearance' && <ThemeSelector />}

            {adminTab === 'messages' && (
              <div className="space-y-6">
                {inquiries.map((item: any) => (
                  <div key={item.id} className={`p-8 rounded-[40px] border flex flex-col md:flex-row items-center justify-between gap-6 ${item.status === 'pending' ? 'bg-primary/5 border-primary/20' : 'bg-card border-white/5 opacity-60'}`}>
                    <div className="flex-grow space-y-2">
                       <div className="flex items-center gap-3">
                          <span className="text-xl font-bold">{item.name}</span>
                          <span className="text-gray-500 text-xs font-mono">{item.phone}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.willingToCall ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            {item.willingToCall ? '愿意电话联系' : '仅在线沟通'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm bg-black/20 p-4 rounded-2xl italic">“ {item.finalContent || item.content || item.subject} ”</p>
                        <div className="text-[10px] text-gray-600 font-bold">2026.01.26</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleToggleInquiryStatus(item.id)} className={`px-6 py-3 rounded-xl font-bold text-xs ${item.status === 'pending' ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'}`}>
                        {item.status === 'pending' ? '完成处理' : '恢复待办'}
                      </button>
                      <button onClick={() => handleDeleteInquiry(item.id)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'plans' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">方案列表</h3>
                  <button onClick={() => { setEditingPlan({ company: "阳光人寿", title: "", type: "理财保障", highlight: "", benefit: "", desc: "", isLatest: false }); setShowPlanForm(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> 新增方案</button>
                </div>

                {showPlanForm ? (
                   <form onSubmit={handleSavePlan} className="bg-card p-10 rounded-[40px] space-y-6">
                      <input placeholder="方案标题" value={editingPlan.title} onChange={e => setEditingPlan({...editingPlan, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4" />
                      <div className="flex gap-4">
                        <button type="submit" className="bg-primary px-8 py-3 rounded-xl font-bold">保存</button>
                        <button type="button" onClick={() => setShowPlanForm(false)} className="px-8 py-3 bg-white/5 rounded-xl">取消</button>
                      </div>
                   </form>
                ) : (
                  <div className="space-y-4">
                    {insurancePlans.map((plan: any) => (
                      <div key={plan.id} className="p-6 rounded-[32px] border bg-card border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{plan.company}</div>
                          <div className="font-bold">{plan.title}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingPlan(plan); setShowPlanForm(true); }} className="p-2 bg-white/5 rounded-lg"><Edit3 className="w-5 h-5" /></button>
                           <button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-white/5 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {adminTab === 'cases' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                       <h3 className="text-xl font-bold">案例管理</h3>
                       <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                          <button onClick={() => setCaseView('published')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${caseView === 'published' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-white'}`}>已发布</button>
                          <button onClick={() => setCaseView('archived')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${caseView === 'archived' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-white'}`}>已归档</button>
                       </div>
                    </div>
                    <button onClick={() => { setEditingCase({ title: "", tag: "重疾理赔", image: "" }); setSearchResults([]); setSearchKeyword(""); setShowCaseForm(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> 新增案例</button>
                  </div>

                  {showCaseForm ? (
                     <div className="bg-card p-10 rounded-[40px] space-y-8 animate-in slide-in-from-bottom-4">
                        {/* ... (Search Section and Form remain same) ... */}
                        {/* Search Section */}
                        <div className="bg-black/30 p-6 rounded-3xl border border-white/5">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 text-primary font-bold">
                                 <Globe className="w-4 h-4" /> 网页搜索导入
                              </div>
                              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                 <button 
                                   type="button"
                                   onClick={() => setSearchEngine('baidu')} 
                                   className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${searchEngine === 'baidu' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                 >
                                   百度
                                 </button>
                                 <button 
                                   type="button"
                                   onClick={() => setSearchEngine('bing')} 
                                   className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${searchEngine === 'bing' ? 'bg-[#008373] text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                 >
                                   Bing
                                 </button>
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-3 mb-4">
                              {SEARCH_PRESETS.map(keyword => (
                                 <button key={keyword} onClick={() => handleSearchNews(keyword)} className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold transition-all">
                                    {keyword}
                                 </button>
                              ))}
                           </div>
                           <div className="flex gap-4 mb-4">
                              <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                  placeholder="或输入自定义关键词..." 
                                  value={searchKeyword} 
                                  onChange={e => setSearchKeyword(e.target.value)} 
                                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none" 
                                />
                              </div>
                              <button onClick={() => handleSearchNews(searchKeyword)} className="px-6 rounded-xl bg-white/10 font-bold text-sm hover:bg-white/20">搜索</button>
                           </div>

                           {searchLoading && <div className="text-center py-4 text-gray-500 animate-pulse text-sm">正在搜索全网新闻...</div>}
                           
                           {searchResults.length > 0 && (
                              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                 {searchResults.map((res, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex gap-3 group relative">
                                       <div className="flex-grow min-w-0">
                                          <a 
                                            href={res.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="font-bold text-sm text-white hover:text-primary mb-1 line-clamp-1 flex items-center gap-1 group/link transition-colors"
                                            title="点击查看新闻详情"
                                          >
                                              {res.title}
                                              <Link className="inline w-3 h-3 text-gray-500 group-hover/link:text-primary transition-colors flex-shrink-0" />
                                          </a>
                                          <div className="text-xs text-gray-500 line-clamp-2">{res.snippet}</div>
                                       </div>
                                       <button 
                                         type="button"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             handleSelectNews(res);
                                         }}
                                         className="px-4 py-1.5 h-fit bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold self-center transition-all shrink-0 border border-primary/20 hover:border-primary shadow-sm hover:shadow-primary/20"
                                       >
                                         选择
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>

                        <form onSubmit={handleSaveCase} className="space-y-6">
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">案例标题</label>
                                 <input required value={editingCase.title} onChange={e => setEditingCase({...editingCase, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4" />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">案例标签</label>
                                 <select value={editingCase.tag} onChange={e => setEditingCase({...editingCase, tag: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 appearance-none">
                                    {CASE_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">封面图片 URL</label>
                              <div className="flex gap-4">
                                 <input value={editingCase.image} onChange={e => setEditingCase({...editingCase, image: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4" />
                                 {editingCase.image && (
                                    <div className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-white/10" style={{ backgroundImage: `url(${editingCase.image})` }}></div>
                                 )}
                              </div>
                           </div>
                           <div className="flex gap-4 pt-4 border-t border-white/5">
                             <button type="submit" className="bg-primary px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20">保存案例</button>
                             <button type="button" onClick={() => setShowCaseForm(false)} className="px-10 py-4 bg-white/5 rounded-2xl font-bold">取消</button>
                           </div>
                        </form>
                     </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                       {cases.filter((c: any) => caseView === 'published' ? !c.isArchived : c.isArchived).map((c: any) => (
                          <div key={c.id} className="p-4 rounded-[28px] border border-white/5 bg-card flex items-center gap-4 group">
                             <div className="w-16 h-16 rounded-2xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${c.image})` }}></div>
                             <div className="flex-grow min-w-0">
                                <div className="text-[10px] font-bold text-primary mb-0.5">{c.tag}</div>
                                <div className="font-bold text-sm truncate">{c.title}</div>
                             </div>
                             <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                {caseView === 'published' ? (
                                   <button onClick={() => handleArchiveCase(c.id)} className="px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 hover:text-orange-500 rounded-lg text-xs font-bold flex items-center gap-1 transition-all">
                                      <LogOut className="w-3 h-3" /> 归档
                                   </button>
                                ) : (
                                   <button onClick={() => handleRestoreCase(c.id)} className="px-3 py-1.5 bg-white/5 hover:bg-green-500/20 hover:text-green-500 rounded-lg text-xs font-bold flex items-center gap-1 transition-all">
                                      <CheckCircle2 className="w-3 h-3" /> 恢复
                                   </button>
                                )}
                                <button onClick={() => { setEditingCase(c); setShowCaseForm(true); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCase(c.id)} className="p-2 bg-white/5 rounded-lg hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>
                       ))}
                       {cases.filter((c: any) => caseView === 'published' ? !c.isArchived : c.isArchived).length === 0 && (
                          <div className="col-span-2 text-center py-10 text-gray-500 text-sm">
                             {caseView === 'published' ? "暂无已发布案例" : "暂无归档案例"}
                          </div>
                       )}
                    </div>
                  )}
               </div>
            )}

            {adminTab === 'assessment' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">评估问卷配置</h3>
                    <button onClick={() => { setEditingQuestion({ question: "", type: "single", options: "" }); setShowQuestionForm(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> 新增问题</button>
                 </div>

                 {showQuestionForm ? (
                    <form onSubmit={handleSaveQuestion} className="bg-card p-10 rounded-[40px] space-y-6">
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">问题题目</label>
                          <input required value={editingQuestion.question} onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">选项 (用英文逗号分隔)</label>
                          <textarea rows={3} required value={Array.isArray(editingQuestion.options) ? editingQuestion.options.join(', ') : editingQuestion.options} onChange={e => setEditingQuestion({...editingQuestion, options: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 resize-none" placeholder="选项1, 选项2, 选项3" />
                       </div>
                       <div className="flex gap-4">
                          <button type="submit" className="bg-primary px-8 py-3 rounded-xl font-bold">保存</button>
                          <button type="button" onClick={() => setShowQuestionForm(false)} className="px-8 py-3 bg-white/5 rounded-xl">取消</button>
                       </div>
                    </form>
                 ) : (
                    <div className="space-y-4">
                       {assessmentQuestions.map((q: any) => (
                          <div key={q.id} className="p-6 rounded-[32px] border bg-card border-white/5 flex items-center justify-between group">
                             <div>
                                <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">问题 {q.id}</div>
                                <h4 className="text-lg font-bold mb-2">{q.question}</h4>
                                <div className="flex flex-wrap gap-2">
                                   {q.options.map((opt: string, idx: number) => (
                                      <span key={idx} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500">{opt}</span>
                                   ))}
                                </div>
                             </div>
                             <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingQuestion(q); setShowQuestionForm(true); }} className="p-2 bg-white/5 rounded-lg"><Edit3 className="w-5 h-5 text-gray-500" /></button>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-white/5 rounded-lg"><Trash2 className="w-5 h-5 text-gray-500" /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

