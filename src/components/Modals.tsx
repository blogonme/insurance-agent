import React from 'react';
import { X, CheckCircle2, ChevronDown, User, Calendar, ArrowRight, ChevronRight, Shield, Award } from "lucide-react";
import { AssessmentQuestion } from "../types";
import { useState, useEffect } from "react";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: AssessmentQuestion[];
  onComplete: (answers: Record<string, string>) => void;
}

export const AssessmentModal = ({ isOpen, onClose, questions, onComplete }: AssessmentModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [tempText, setTempText] = useState("");
  const [tempSelection, setTempSelection] = useState<string[]>([]);

  // Get distinct categories as phases
  const categories = Array.from(new Set(questions.map(q => q.category || '评估开始'))).filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAnswers({});
      setTempText("");
      setTempSelection([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setTempText("");
    setTempSelection([]);
  }, [currentStep]);

  if (!isOpen) return null;

  const currentQ = questions[currentStep];
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  const handleSelectOption = (option: string) => {
    if (isAnimating) return;
    if (currentQ.input_type === 'multiple_choice') {
      setTempSelection(prev =>
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      saveAndNext(option);
    }
  };

  const saveAndNext = (answerValue: string) => {
    const finalVal = answerValue || tempText || (tempSelection.length > 0 ? tempSelection.join('、') : "");
    if (!finalVal && currentStep < questions.length) {
      // Allow empty if explicitly skipped or for specific types if needed, 
      // but for risk assessment we usually want answers.
    }

    const newAnswers = { ...answers, [currentQ.question]: finalVal };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 400);
    } else {
      onComplete(newAnswers);
    }
  };

  const renderInput = () => {
    switch (currentQ.input_type) {
      case 'text':
      case 'number':
        return (
          <div className="space-y-6">
            <input
              type={currentQ.input_type}
              autoFocus
              value={tempText}
              onChange={e => setTempText(e.target.value)}
              placeholder={currentQ.placeholder || "请输入..."}
              className="w-full bg-navy/5 border-2 border-navy/5 rounded-[24px] px-8 py-6 text-2xl font-black text-navy focus:border-gold outline-none transition-all"
              onKeyPress={e => e.key === 'Enter' && tempText && saveAndNext(tempText)}
            />
            <button
              onClick={() => saveAndNext(tempText)}
              disabled={!tempText}
              className={`w-full py-6 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 ${tempText ? 'bg-navy text-white shadow-xl shadow-navy/20' : 'bg-navy/5 text-navy/20 cursor-not-allowed'}`}
            >
              下一步 <ArrowRight className="w-6 h-6 text-gold" />
            </button>
          </div>
        );
      case 'date':
        return (
          <div className="space-y-6">
            <input
              type="date"
              value={tempText}
              onChange={e => setTempText(e.target.value)}
              className="w-full bg-navy/5 border-2 border-navy/5 rounded-[24px] px-8 py-6 text-2xl font-black text-navy focus:border-gold outline-none transition-all"
            />
            <button
              onClick={() => saveAndNext(tempText)}
              disabled={!tempText}
              className={`w-full py-6 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 ${tempText ? 'bg-navy text-white shadow-xl shadow-navy/20' : 'bg-navy/5 text-navy/20 cursor-not-allowed'}`}
            >
              下一步 <ArrowRight className="w-6 h-6 text-gold" />
            </button>
          </div>
        );
      case 'multiple_choice':
      case 'single_choice':
      default:
        return (
          <div className="grid gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentQ.input_type === 'multiple_choice' && tempSelection.includes(opt);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className={`group flex items-center justify-between p-6 rounded-[24px] border-2 transition-all text-left ${isSelected
                      ? "bg-navy border-navy text-white shadow-xl shadow-navy/20"
                      : "bg-white border-navy/5 hover:border-gold hover:bg-gold/5 text-navy"
                    }`}
                >
                  <span className="font-black text-lg">{opt}</span>
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-gold" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-navy/5 group-hover:border-gold transition-all"></div>
                  )}
                </button>
              );
            })}
            {currentQ.input_type === 'multiple_choice' && (
              <button
                onClick={() => saveAndNext(tempSelection.join('、'))}
                disabled={tempSelection.length === 0}
                className={`mt-6 w-full py-6 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 ${tempSelection.length > 0 ? 'bg-navy text-white shadow-xl shadow-navy/20' : 'bg-navy/5 text-navy/20 cursor-not-allowed'}`}
              >
                确认并继续 <ArrowRight className="w-6 h-6 text-gold" />
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-left">
      <div className="absolute inset-0 bg-navy/80 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-navy/5">
          <div className="h-full bg-gold transition-all duration-700 ease-in-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="p-10 flex-grow flex flex-col overflow-y-auto scroll-container">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-gold" /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Family Risk Intelligence</span>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-navy/5 rounded-full transition-all text-navy/20 hover:text-navy"><X className="w-6 h-6" /></button>
          </div>

          <div className={`flex-grow space-y-10 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4 filter blur-sm' : 'opacity-100 translate-y-0'}`}>
            {questions.length > 0 ? (
              <>
                <div className="space-y-4">
                  <div className="font-serif text-gold italic font-black text-xl">
                    {currentQ.category || "评估进行中"}
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl italic font-black text-navy leading-tight tracking-tighter">
                    {currentQ.question}
                  </h2>
                  {currentQ.input_type === 'multiple_choice' && <p className="text-gold font-black text-[10px] uppercase tracking-widest leading-none">多项选择</p>}
                </div>

                {renderInput()}
              </>
            ) : (
              <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                  <Shield className="w-10 h-10 text-gold opacity-50" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-serif italic font-black text-navy">精算引擎载入中...</p>
                  <p className="text-navy/40 text-sm font-medium">请稍候，我们正在为您调取最新的风险评估模型。如果长时间无反应，请尝试刷新页面。</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  subjects: string[];
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AppointmentModal = ({ isOpen, onClose, form, subjects, setForm, onSubmit }: AppointmentModalProps) => {
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) setIsPrivacyAgreed(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-left">
      <div className="absolute inset-0 bg-navy/70 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-12 space-y-10">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="font-serif text-gold italic font-black text-lg">Reservation</div>
              <h3 className="font-serif text-4xl italic font-black text-navy leading-tight tracking-tighter">预约尊荣咨询</h3>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-navy/5 rounded-full text-navy/20 hover:text-navy transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!isPrivacyAgreed ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 rounded-[40px] bg-amber-500/5 border border-amber-500/10 space-y-4">
                <Shield className="w-10 h-10 text-amber-500 mb-2" />
                <p className="text-navy font-bold text-lg leading-relaxed">
                  是否愿意提供个人信息以开启您的专属保险定制方案？
                </p>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  您的数据将严格加密存储，仅由保险专家用于制定针对性的风险防控建议。我们将即使与您沟通以确认需求。
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setIsPrivacyAgreed(true)}
                  className="w-full bg-navy text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-navy/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                >
                  愿意提供，开启专属定制 <ArrowRight className="w-6 h-6 text-gold" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 text-slate-400 py-5 rounded-2xl font-bold hover:text-slate-600 transition-all"
                >
                  暂不提供，退出流程
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" onSubmit={onSubmit}>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] pl-2">Client Identity / Name</label>
                <input type="text" required placeholder="您的姓名" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-navy/5 border border-navy/5 rounded-2xl px-6 py-5 text-navy focus:border-gold outline-none transition-all placeholder:text-navy/20 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] pl-2">Communication / Phone</label>
                <input type="tel" required placeholder="您的手机号码" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-navy/5 border border-navy/5 rounded-2xl px-6 py-5 text-navy focus:border-gold outline-none transition-all placeholder:text-navy/20 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] pl-2">Consultation Goal</label>
                <div className="relative">
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-navy/5 border border-navy/5 rounded-2xl px-6 py-5 text-navy focus:border-gold outline-none transition-all appearance-none cursor-pointer font-bold text-sm">
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold pointer-events-none" />
                </div>
              </div>

              {form.subject === "其他需求..." && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                  <textarea placeholder="具体需求详述..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full bg-navy/5 border border-navy/5 rounded-2xl px-6 py-5 text-navy focus:border-gold outline-none transition-all placeholder:text-navy/20 font-bold resize-none" rows={3} required />
                </div>
              )}

              <button type="submit" className="elite-button w-full bg-navy text-white py-5 rounded-2xl font-black text-lg mt-4 shadow-2xl shadow-navy/30 flex items-center justify-center gap-3">
                提交专属预约请求 <ArrowRight className="w-6 h-6 text-gold" />
              </button>
            </form>
          )}
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/80 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-white rounded-[60px] overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-10 md:p-16 flex flex-col min-h-0 h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <div className="font-serif text-gold italic font-black text-lg">Elite Collection</div>
              <h3 className="font-serif text-4xl italic font-black text-navy leading-tight tracking-tighter">定制化保障合集</h3>
            </div>
            <button onClick={onClose} className="w-14 h-14 rounded-full border border-navy/5 flex items-center justify-center hover:bg-navy/5 transition-all text-navy/20 hover:text-navy">
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto pr-6 scroll-container space-y-10 pb-6">
            {plans.map((plan: any) => (
              <div key={plan.id} className="p-10 rounded-[50px] bg-bg-soft/40 border border-navy/5 hover:border-gold/30 transition-all text-left group">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">{plan.company}</span>
                  <div className="w-1 h-1 rounded-full bg-navy/10"></div>
                  <span className="text-[10px] font-black text-navy/30 uppercase tracking-widest">{plan.type}</span>
                </div>
                <h4 className="font-serif text-3xl italic font-black text-navy mb-6 group-hover:text-gold transition-colors">{plan.title}</h4>

                <div className="flex flex-wrap gap-3 mb-10">
                  {plan.highlight.split(' · ').map((h: string, i: number) => (
                    <span key={i} className="text-[10px] font-black px-5 py-2.5 rounded-2xl bg-white border border-navy/5 text-navy/60 uppercase tracking-widest shadow-sm">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="p-8 rounded-[32px] bg-navy flex items-center justify-between mb-8 shadow-xl shadow-navy/20">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">Core Protection</div>
                    <div className="text-2xl font-black text-white">{plan.benefit}</div>
                  </div>
                  <Award className="w-10 h-10 text-gold/30" />
                </div>

                <p className="text-navy/50 text-lg leading-relaxed mb-10 font-medium italic">“ {plan.description || plan.desc} ”</p>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-navy/5 pt-10">
                  <div className="flex items-center gap-3 text-navy font-black text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-6 h-6 text-gold" /> Official Authorization
                  </div>
                  <button onClick={onClose} className="elite-button bg-navy text-white px-10 py-4 rounded-2xl font-black hover:scale-[1.05] transition-all flex items-center gap-3 text-sm">
                    获取深度方案解读 <ArrowRight className="w-5 h-5 text-gold" />
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

export const CaseDetailsModal = ({ isOpen, onClose, item }: any) => {
  if (!isOpen || !item) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-left">
      <div className="absolute inset-0 bg-navy/80 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
        <div className="h-64 bg-cover bg-center relative group" style={{ backgroundImage: `url(${item.image})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-80"></div>
          <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/40 transition-all z-20">
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="absolute bottom-8 left-10 right-10">
            <span className="inline-block px-5 py-2 rounded-full bg-gold/20 text-gold border border-gold/30 text-[10px] font-black uppercase tracking-[0.2em] mb-3 backdrop-blur-md">
              {item.tag}
            </span>
            <h3 className="font-serif text-3xl italic font-black text-white leading-tight tracking-tighter">{item.title}</h3>
          </div>
        </div>
        <div className="p-10 space-y-8 overflow-y-auto scroll-container flex-grow">
          <div className="space-y-6">
            <p className="text-navy/60 text-lg leading-relaxed font-serif italic">
              {item.description || "该案例暂无详细描述。请在管理后台补全以展示专业调性。"}
            </p>
            {item.expert_insight && (
              <div className="p-8 rounded-[32px] bg-bg-soft border border-navy/5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                <Shield className="w-6 h-6 text-gold shrink-0 mt-1" />
                <div className="space-y-2">
                  <span className="text-navy font-black text-xs uppercase tracking-widest block">Strategic Insight / 专业点评</span>
                  <div className="text-navy/40 text-sm font-medium leading-relaxed">
                    {item.expert_insight}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="elite-button w-full bg-navy text-white rounded-2xl py-5 font-black flex items-center justify-center gap-3">
            预约同级方案复刻 <ArrowRight className="w-6 h-6 text-gold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const WeChatModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-navy/90 backdrop-blur-3xl animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[60px] overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl p-12">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-navy/20 hover:text-navy transition-all"><X className="w-6 h-6" /></button>
        <div className="font-serif text-gold italic font-black text-lg mb-2">Connect</div>
        <h3 className="font-serif text-3xl italic font-black text-navy mb-4">关注精英视野</h3>
        <p className="text-navy/40 text-sm font-medium mb-10">在这里，我将定期分享有关复杂理赔、家族信托及资产保全的深度洞察。</p>

        <div className="bg-white p-4 rounded-[40px] border-[10px] border-bg-soft mx-auto mb-10 w-56 h-56 shadow-inner">
          <img src="/assets/qrcode_oa.png" alt="QR" className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Recognition Scan</p>
          <p className="text-xs text-navy/20 font-bold uppercase tracking-widest">ID: INSUREELITE_PY</p>
        </div>
      </div>
    </div>
  );
};
