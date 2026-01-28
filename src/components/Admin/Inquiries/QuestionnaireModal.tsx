import React from 'react';
import { X, ClipboardList, HelpCircle } from "lucide-react";
import { Inquiry } from "../../../types";

interface QuestionnaireModalProps {
    inquiry: Inquiry;
    onClose: () => void;
}

const QuestionnaireModal = ({ inquiry, onClose }: QuestionnaireModalProps) => {
    const assessmentData = inquiry.assessment_data || {};

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[85vh] md:rounded-[48px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden text-slate-900">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif italic font-black leading-none">原始风险问卷</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">RAW QUESTIONNAIRE DATA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-10 space-y-8 scroll-container">
                    <div className="grid grid-cols-2 gap-6 pb-8 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">客户姓名</span>
                            <div className="font-bold text-slate-900">{inquiry.customer_name}</div>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">手机号码</span>
                            <div className="font-bold text-slate-900">{inquiry.phone}</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(assessmentData).length > 0 ? (
                            Object.entries(assessmentData).map(([question, answer], idx) => (
                                <div key={idx} className="group space-y-3">
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                        <span className="text-sm font-bold text-slate-600 leading-relaxed">{question}</span>
                                    </div>
                                    <div className="ml-7 p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-amber-500/30 transition-all font-black text-slate-900">
                                        {Array.isArray(answer) ? (
                                            <div className="flex flex-wrap gap-2">
                                                {answer.map((v, i) => (
                                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500">
                                                        {String(v)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : typeof answer === 'object' && answer !== null ? (
                                            <div className="text-xs text-slate-500 font-mono bg-white p-2 rounded-lg">
                                                {JSON.stringify(answer)}
                                            </div>
                                        ) : (
                                            String(answer || '') || <span className="text-slate-300 font-normal italic">未选择/填答</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center opacity-20">
                                <ClipboardList className="w-12 h-12 mx-auto mb-4" />
                                <p className="font-black">无问卷详情数据</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-slate-100 flex items-center justify-end shrink-0 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:scale-105 transition-all text-sm"
                    >
                        完成查阅
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionnaireModal;
