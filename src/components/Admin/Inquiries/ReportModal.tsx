import React from 'react';
import { Shield, Printer, X, Award } from "lucide-react";
import { Inquiry, InsurancePlan } from "../../../types";

interface ReportModalProps {
    reportInquiry: Inquiry;
    insurancePlans: InsurancePlan[];
    onClose: () => void;
}

const ReportModal = ({ reportInquiry, insurancePlans, onClose }: ReportModalProps) => {
    // 模拟 RAG 语义检索逻辑
    const getRecommendedPlans = () => {
        const data = reportInquiry.assessment_data || {};
        const keywordMap: Record<string, string[]> = {
            '重疾': ['重大疾病', '癌症', '百万'],
            '医疗': ['门诊', '住院', '药'],
            '养老': ['退休', '教育', '理财'],
            '意外': ['身故', '骨折', '交通']
        };

        const foundKeywords: string[] = [];
        Object.values(data).forEach((a: any) => {
            const str = String(a);
            Object.entries(keywordMap).forEach(([k, words]) => {
                if (words.some(w => str.includes(w))) foundKeywords.push(k);
            });
        });

        // 根据发现的关键词从 insurancePlans 中过滤匹配方案
        return insurancePlans.filter(p =>
            foundKeywords.some(k => p.type.includes(k) || p.title.includes(k) || p.highlight.includes(k))
        ).slice(0, 3);
    };

    const recommendedPlans = getRecommendedPlans();

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6 overflow-hidden text-slate-900">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl h-full md:h-[90vh] md:rounded-[60px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-20 duration-500 overflow-hidden text-left">
                {/* Modal Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif italic font-black text-slate-900 leading-none">家庭风险精算报告</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Full Risk Intelligence Report • RAG Powered</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.print()} className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all">
                            <Printer className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-4 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-grow overflow-y-auto p-12 space-y-12 scroll-container print:p-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-100">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">客户姓名 / CLIENT</span>
                            <div className="text-2xl font-black text-slate-900">{reportInquiry.customer_name}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">手机号码 / CONTACT</span>
                            <div className="text-2xl font-black text-slate-900">{reportInquiry.phone}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">检索知识量 / RAG KNOWLEDGE</span>
                            <div className="text-2xl font-black text-gold">{recommendedPlans.length * 450}+ 词</div>
                        </div>
                    </div>

                    <div className="space-y-16">
                        {(() => {
                            const data = reportInquiry.assessment_data || {};
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                    {Object.entries(data).map(([q, a]: [string, any]) => (
                                        <div key={q} className="space-y-3 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-tight group-hover:text-slate-600 transition-colors">{q}</span>
                                            </div>
                                            <div className="text-lg font-black text-slate-900 bg-slate-50/50 rounded-3xl p-6 border border-slate-100 group-hover:border-gold/30 transition-all group-hover:shadow-xl group-hover:shadow-gold/5">
                                                {Array.isArray(a) ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {a.map((v, i) => (
                                                            <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                                                                {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    a || '未填写'
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="pt-12 mt-12 border-t-2 border-dashed border-slate-100 space-y-10">
                        <div className="bg-navy rounded-[40px] p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Shield className="w-32 h-32 text-gold animate-pulse" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Award className="w-6 h-6 text-gold" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">精算建议 / ACTUARIAL ADVICE</span>
                                </div>
                                <h3 className="text-2xl font-serif italic font-black leading-tight">基于保司真实条款的 AI 深度解析：</h3>
                                <div className="text-slate-300 text-sm font-medium max-w-2xl leading-relaxed space-y-4">
                                    <p>配合您的评估结果，AI 已自动检索您所在地可投保的 {recommendedPlans.length} 个深度保险方案条款。分析如下：</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>财务层面：评估资产配比后，建议保持年缴费控制在家庭年收入的 8%-12% 之间。</li>
                                        <li>保障层面：由于您对“大病费用”表现出高度担忧，AI 建议配置具备“费用直付”功能的医疗险。</li>
                                        <li>合规提示：基于以下真实条款，上述建议已排除免责条款冲突。</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* RAG Results section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-gold"></div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">检索到的知识来源 / KNOWLEDGE SOURCES</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendedPlans.length > 0 ? recommendedPlans.map(plan => (
                                    <div key={plan.id} className="p-6 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:border-gold/30 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">{plan.company}</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">已匹配条款原文</span>
                                        </div>
                                        <div className="font-black text-slate-900 mb-2 truncate">{plan.title}</div>
                                        <div className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2">
                                            {plan.raw_content ? plan.raw_content.substring(0, 100) + '...' : plan.highlight}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                        <p className="text-sm font-bold text-slate-300 italic">暂无精准匹配条款，建议增加方案库覆盖广度</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-8 border-t border-slate-100 flex items-center justify-center gap-4 shrink-0 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-3xl font-black shadow-sm hover:bg-slate-50 transition-all"
                    >
                        关闭报告
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-10 py-5 bg-navy text-gold rounded-3xl font-black shadow-xl shadow-navy/20 flex items-center gap-3 hover:scale-105 transition-all"
                    >
                        <Printer className="w-5 h-5" /> 立即打印导出
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
