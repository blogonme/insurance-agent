import React from 'react';
import { X, CheckCircle2, ChevronDown, User, Calendar, ArrowRight, ChevronRight } from "lucide-react";
import { AssessmentQuestion } from "../data";
import { useState, useEffect } from "react";

// ... existing interfaces ...

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
  const [tempSelection, setTempSelection] = useState<string[]>([]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
        setCurrentStep(0);
        setAnswers({});
        setTempSelection([]);
    }
  }, [isOpen]);

  // Reset temp selection on step change
  useEffect(() => {
     setTempSelection([]);
  }, [currentStep]);

  const currentQ = questions[currentStep];

  const handleSelectOption = (option: string) => {
    if (isAnimating) return;
    
    if (currentQ.type === 'multiple') {
        setTempSelection(prev => 
            prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
        );
    } else {
        saveAndNext(option);
    }
  };

  const handleNext = () => {
     if (tempSelection.length === 0) return;
     saveAndNext(tempSelection.join(', '));
  };

  const saveAndNext = (answerValue: string) => {
    const newAnswers = { ...answers, [currentQ.question]: answerValue };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Completed
      onComplete(newAnswers);
    }
  };

  if (!isOpen) return null;
  // currentQ definition moved up
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-left">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header / Progress */}
        <div className="p-8 pb-0 flex items-center justify-between">
            <div className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                保险需求智能评估 · 第 {currentStep + 1}/{questions.length} 步
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        <div className="px-8 mt-6">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        {/* Question Area */}
        <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                {currentQ.question}
            </h2>
            {currentQ.type === 'multiple' && (
                <p className="text-gray-500 text-sm mb-8">（可多选）</p>
            )}
            {currentQ.type !== 'multiple' && <div className="mb-8"></div>}

            <div className={`grid gap-4 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
                {currentQ.options.map((opt, idx) => {
                    const isSelected = currentQ.type === 'multiple' && tempSelection.includes(opt);
                    return (
                        <button 
                            key={idx}
                            onClick={() => handleSelectOption(opt)}
                            className={`group flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                                isSelected 
                                ? "bg-primary border-primary text-white" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-primary/30 text-gray-300"
                            }`}
                        >
                            <span className={`font-bold text-lg ${isSelected ? "text-white" : "group-hover:text-white"}`}>{opt}</span>
                            {isSelected ? (
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            )}
                        </button>
                    );
                })}
            </div>
            
            {/* Next Button for Multiple Selection */}
            {currentQ.type === 'multiple' && (
                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleNext}
                        disabled={tempSelection.length === 0}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                            tempSelection.length > 0 
                            ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20" 
                            : "bg-white/5 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        下一步 <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
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

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export const CaseDetailsModal = ({ isOpen, onClose, item }: CaseDetailsModalProps) => {
  if (!isOpen || !item) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-card border border-white/10 rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl flex flex-col">
        <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${item.image})` }}>
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
           <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors z-20">
              <X className="w-4 h-4 text-white" />
           </button>
           <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest mb-2 backdrop-blur-md">
                {item.tag}
              </span>
              <h3 className="text-xl font-bold text-white leading-tight">{item.title}</h3>
           </div>
        </div>
        <div className="p-8">
           <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {/* 模拟详情内容，实际项目中应在 data 中添加 detail 字段 */}
                本案例为您展示了{item.tag}在实际场景中的应用。通过{item.title.split('：')[0]}的配置，我们在风险发生时为客户争取了最大化的利益保护。如需了解该案例的详细操作流程与法律依据，欢迎预约咨询。
              </p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="text-xs text-gray-400">
                    <span className="text-white font-bold block mb-1">专业点评</span>
                    该方案的核心在于提前布局与精准条款匹配，避免了后期理赔中的常见纠纷。
                 </div>
              </div>
           </div>
           
           <button onClick={onClose} className="w-full mt-8 py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
             预约同款方案咨询 <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

interface WeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeChatModal = ({ isOpen, onClose }: WeChatModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl p-8 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-white mb-2">关注保险经纪人彭艳</h3>
        <p className="text-sm text-gray-500 mb-8">这是我的微信公众号，分享保险干货与案例</p>
        
        <div className="bg-white p-2 rounded-2xl mx-auto mb-6 w-48 h-48">
          <img src="/assets/qrcode_oa.png" alt="公众号二维码" className="w-full h-full object-cover" />
        </div>
        
        <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">长按识别二维码</p>
        <p className="text-xs text-gray-600">或搜索 "InsurePro_Py"</p>
      </div>
    </div>
  );
};
