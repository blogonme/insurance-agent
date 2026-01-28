import React from 'react';
import { X, Shield, Award, FileText, Zap, ExternalLink } from "lucide-react";
import { InsurancePlan } from "../../../types";

interface PlanDetailsModalProps {
    plan: InsurancePlan;
    onClose: () => void;
}

const PlanDetailsModal = ({ plan, onClose }: PlanDetailsModalProps) => {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] md:rounded-[48px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-none">{plan.title}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{plan.company} · {plan.type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-grow overflow-y-auto p-8 md:p-10 space-y-10 scroll-container">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-gold" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">最高保障利益 / BENEFIT</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{plan.benefit}</div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">核心产品特色 / HIGHLIGHT</span>
                            </div>
                            <div className="text-sm font-bold text-slate-700 leading-relaxed">{plan.highlight}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pl-4 border-l-4 border-amber-500">方案深度解析</h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-[32px] p-6">
                            {plan.description}
                        </p>
                    </div>

                    {/* Terms / RAG Content */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-4">条款原文 (RAG 知识库内容)</h3>
                            {plan.terms_url && (
                                <a
                                    href={plan.terms_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                    <FileText className="w-3.5 h-3.5" /> 查看条款 PDF <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 pointer-events-none rounded-[32px]"></div>
                            <div className="bg-slate-900 text-slate-400 text-xs font-mono p-8 rounded-[32px] leading-relaxed max-h-[300px] overflow-y-auto border border-slate-800 shadow-inner custom-scrollbar">
                                {plan.raw_content ? (
                                    <pre className="whitespace-pre-wrap font-sans text-[13px] leading-7">
                                        {plan.raw_content}
                                    </pre>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-30 italic">
                                        <FileText className="w-12 h-12 mb-4" />
                                        <p>暂无抓取的条款原文内容，建议通过同步功能更新</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-white/80 backdrop-blur-md">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-xl shadow-slate-900/20 hover:scale-105 transition-all"
                    >
                        关闭查阅
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanDetailsModal;
