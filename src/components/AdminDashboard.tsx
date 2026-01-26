import React, { useState } from 'react';
import { 
  Shield, Menu, X, LayoutDashboard, MessageSquare, TrendingUp, 
  Palette, FileSpreadsheet, Globe, LogOut, Clock, Trash2, 
  Edit3, Plus, Settings, Lock, ChevronRight, Activity, CheckCircle2 
} from "lucide-react";
import { ThemeSelector } from "../ThemeSelector";

interface AdminDashboardProps {
  inquiries: any[];
  insurancePlans: any[];
  setInquiries: (data: any[]) => void;
  setInsurancePlans: (data: any[]) => void;
  onExit: () => void;
  onLogout: () => void;
  authKey: string;
}

const AdminDashboard = ({ 
  inquiries, 
  insurancePlans, 
  setInquiries, 
  setInsurancePlans, 
  onExit, 
  onLogout,
  authKey
}: AdminDashboardProps) => {
  const [adminTab, setAdminTab] = useState<'dashboard' | 'messages' | 'appearance' | 'plans'>('dashboard');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" });
  const [passChangeMsg, setPassChangeMsg] = useState({ text: "", type: "" });

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

  const handleSetLatest = (id: number) => {
    setInsurancePlans(insurancePlans.map((p: any) => ({
      ...p,
      isLatest: p.id === id
    })));
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
    setPassChangeMsg({ text: "密码修改成功！请下次使用新密码登录", type: "success" });
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
          <button onClick={() => { setAdminTab('appearance'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all ${adminTab === 'appearance' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <Palette className="w-6 h-6" /> 界面风格
          </button>
          <button onClick={() => { setAdminTab('plans'); setIsAdminMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-bold text-lg transition-all ${adminTab === 'plans' ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-white"}`}>
            <FileSpreadsheet className="w-6 h-6" /> 方案管理
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
                  {adminTab === 'dashboard' ? '控制面板' : adminTab === 'appearance' ? '界面外观设置' : adminTab === 'plans' ? '保险方案管理' : '管理后台'}
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
                        <div className="text-[10px] text-gray-600 font-bold"><Clock className="inline w-3 h-3 mr-1" /> {item.createdAt}</div>
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
                      <div className="grid grid-cols-2 gap-6">
                        <input placeholder="方案标题" value={editingPlan.title} onChange={e => setEditingPlan({...editingPlan, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4" />
                        <select value={editingPlan.company} onChange={e => setEditingPlan({...editingPlan, company: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 appearance-none">
                           <option value="阳光人寿">阳光人寿</option>
                           <option value="阳光财险">阳光财险</option>
                        </select>
                      </div>
                      <textarea rows={4} placeholder="详细描述" value={editingPlan.desc} onChange={e => setEditingPlan({...editingPlan, desc: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 resize-none" />
                      <div className="flex gap-4">
                        <button type="submit" className="bg-primary px-8 py-3 rounded-xl font-bold">保存</button>
                        <button type="button" onClick={() => setShowPlanForm(false)} className="px-8 py-3 bg-white/5 rounded-xl">取消</button>
                      </div>
                   </form>
                ) : (
                  <div className="space-y-4">
                    {insurancePlans.map((plan: any) => (
                      <div key={plan.id} className={`p-6 rounded-[32px] border flex items-center justify-between ${plan.isLatest ? 'bg-primary/5 border-primary/30' : 'bg-card border-white/5'}`}>
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">{plan.company} / {plan.type}</div>
                          <h4 className="text-lg font-bold">{plan.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          {!plan.isLatest && <button onClick={() => handleSetLatest(plan.id)} className="p-2 bg-white/5 rounded-lg"><Star className="w-5 h-5 text-gray-500" /></button>}
                          <button onClick={() => { setEditingPlan(plan); setShowPlanForm(true); }} className="p-2 bg-white/5 rounded-lg"><Edit3 className="w-5 h-5 text-gray-500" /></button>
                          <button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-white/5 rounded-lg"><Trash2 className="w-5 h-5 text-gray-500" /></button>
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
