import React from 'react';
import { X, CheckCircle2, ChevronDown, User, Calendar, ArrowRight } from "lucide-react";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  subjects: string[];
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AppointmentModal = ({ isOpen, onClose, form, subjects, setForm, onSubmit }: AppointmentModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-left">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-neutral-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">预约彭艳经理</h3>
              <p className="text-gray-400 text-sm">请留下您的联系方式，我将在 2 小时内部与您联系</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">您的姓名</label>
              <input 
                type="text" required placeholder="怎么称呼您？" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none transition-all placeholder:text-gray-800" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">联系电话</label>
              <input 
                type="tel" required placeholder="请输入您的手机号" 
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none transition-all placeholder:text-gray-800" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">咨询需求</label>
              <div className="relative">
                <select 
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer text-sm"
                >
                  {subjects.map(s => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {form.subject === "其他需求..." && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">详细说明</label>
                <textarea 
                  placeholder="请具体描述您的需求或疑问..." 
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none transition-all placeholder:text-gray-800 resize-none" 
                  rows={3}
                  required
                />
              </div>
            )}

            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 cursor-pointer group hover:bg-white/10 transition-all" onClick={() => setForm({...form, willingToCall: !form.willingToCall})}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.willingToCall ? 'bg-primary border-primary' : 'border-white/10 bg-transparent'}`}>
                {form.willingToCall && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div className="text-sm font-bold text-gray-300">愿意接收彭艳经理的电话回访</div>
            </div>
            <button type="submit" className="w-full bg-primary text-white py-5 rounded-3xl font-bold text-lg mt-4 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20">
              立即提交预约
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: any[];
}

export const PlansModal = ({ isOpen, onClose, plans }: PlansModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[48px] overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-8 md:p-12 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-white">阳光保险 · 方案合集</h3>
              <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Comprehensive Insurance Plans</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-6">
            {plans.map((plan: any) => (
              <div key={plan.id} className="p-8 rounded-[32px] bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{plan.company}</span>
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{plan.type}</span>
                </div>
                <h4 className="text-2xl font-bold mb-4">{plan.title}</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {plan.highlight.split(' · ').map((h: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter">
                      {h}
                    </span>
                  ))}
                </div>
                <div className="p-6 rounded-2xl bg-black/30 border border-white/5 mb-6">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">保障权益核心</div>
                  <div className="text-xl font-bold text-primary">{plan.benefit}</div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">{plan.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> 官方正版授权
                  </div>
                  <button onClick={onClose} className="px-6 py-3 bg-white text-black rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 text-sm">
                    咨询彭艳详情 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
