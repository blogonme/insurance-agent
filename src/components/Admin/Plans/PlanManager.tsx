import React, { useState } from 'react';
import { Plus, Edit3, Trash2, FileSpreadsheet, Sparkles } from "lucide-react";
import { InsurancePlan } from "../../../types";
import { db } from "../../../services/db";
import ScraperModal from './ScraperModal';
import PlanDetailsModal from './PlanDetailsModal';

interface PlanManagerProps {
    insurancePlans: InsurancePlan[];
    setInsurancePlans: React.Dispatch<React.SetStateAction<InsurancePlan[]>>;
    tenantId?: string;
}

const PlanManager = ({ insurancePlans, setInsurancePlans, tenantId }: PlanManagerProps) => {
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [showScraperModal, setShowScraperModal] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState<InsurancePlan | null>(null);
    const [editingPlan, setEditingPlan] = useState<any>(null);

    const handleAIFill = () => {
        const text = prompt("请粘贴保险条款摘要或产品 URL，AI 将自动分析并填充：");
        if (!text) return;

        // 模拟 AI 提取逻辑
        alert("AI 正在深度解析文本内容...");
        setTimeout(() => {
            setEditingPlan({
                ...editingPlan,
                title: "AI 提取：阳光臻享高端医疗（2026专业版）",
                company: "阳光人寿",
                type: "高端医疗险",
                highlight: "全球医疗直付 · 0免赔额 · 含昂贵医院",
                benefit: "最高 800万/年",
                terms_url: text.includes("http") ? text : "https://www.sinosig.com/gkxxpl/cpys/syx/zkcx/index.shtml",
                raw_content: "【AI 已为您自动提取条款核心内容】\n第一条：保险期间。本合同保险期间为1年。\n第二条：保险责任。本产品提供全面的住院与手术保障，支持公立医院特需部、国际部及指定私立医院直付。特别涵盖恶性肿瘤质子重离子治疗保障，保额上限800万元...\n(以上内容由 AI 解析，建议您点击右侧【查看条款 PDF】核对官方原文)",
                description: "基于您的输入提取：该产品是阳光人寿旗下的旗舰级医疗保障方案，特色在于极高的保额上限和优质的直付网络服务，非常适合有高品质就医需求的人群。"
            });
        }, 1500);
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return alert("租户 ID 缺失");
        const formattedPlan = { ...editingPlan, tenant_id: tenantId };
        const { data, error } = await db.upsertPlan(formattedPlan);
        if (!error && data) {
            if (editingPlan.id) setInsurancePlans(prev => prev.map(p => p.id === data.id ? data as InsurancePlan : p));
            else setInsurancePlans(prev => [data as InsurancePlan, ...prev]);
            setShowPlanForm(false);
            setEditingPlan(null);
        } else alert(error?.message || "保存失败");
    };

    const handleScraperConfirm = async (plans: any[]) => {
        if (!tenantId) return;
        const savedPlans: InsurancePlan[] = [];
        for (const p of plans) {
            const { data, error } = await db.upsertPlan({ ...p, tenant_id: tenantId });
            if (!error && data) savedPlans.push(data as InsurancePlan);
        }
        if (savedPlans.length > 0) {
            setInsurancePlans(prev => [...savedPlans, ...prev]);
            alert(`成功同步并存入 ${savedPlans.length} 个保险方案，RAG 向量库已就绪。`);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (confirm("确定要删除这个方案吗？")) {
            const { error } = await db.deletePlan(id);
            if (!error) setInsurancePlans(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {!showPlanForm && (
                <div className="flex justify-end gap-3 pr-2">
                    <button
                        onClick={() => setShowScraperModal(true)}
                        className="bg-amber-500 text-slate-900 px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" /> 智能同步获取
                    </button>
                    <button
                        onClick={() => { setEditingPlan({}); setShowPlanForm(true); }}
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" /> 手动新增方案
                    </button>
                </div>
            )}

            {showPlanForm ? (
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl p-10 md:p-12 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                                <FileSpreadsheet className="w-6 h-6 text-amber-500" />
                            </div>
                            <h3 className="font-serif text-3xl italic font-black text-slate-900">{editingPlan.id ? '编辑保险方案' : '新增保险方案'}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {!editingPlan.id && (
                                <button
                                    type="button"
                                    onClick={handleAIFill}
                                    className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-amber-100 transition-all border border-amber-200"
                                >
                                    <Sparkles className="w-4 h-4" /> AI 智能辅助填表
                                </button>
                            )}
                            <button onClick={() => { setShowPlanForm(false); setEditingPlan(null); }} className="p-3 text-slate-400 hover:text-slate-900 transition-colors">关闭</button>
                        </div>
                    </div>
                    <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">方案标题 / PLAN TITLE</label>
                            <input
                                required
                                value={editingPlan.title || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all"
                                placeholder="输入方案名称..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">保险机构 / COMPANY</label>
                            <input
                                required
                                value={editingPlan.company || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, company: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all"
                                placeholder="如：阳光人寿、中国平安..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">保障类型 / TYPE</label>
                            <input
                                required
                                value={editingPlan.type || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, type: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all"
                                placeholder="如：医疗险、重疾险、意外险..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">核心卖点 / HIGHLIGHT</label>
                            <input
                                required
                                value={editingPlan.highlight || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, highlight: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all"
                                placeholder="如：不限药单、0免赔、大病直付..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">最高保额 / BENEFIT</label>
                            <input
                                required
                                value={editingPlan.benefit || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, benefit: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all"
                                placeholder="如：最高600万/年"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">产品条款 PDF 链接 / TERMS URL</label>
                            <input
                                value={editingPlan.terms_url || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, terms_url: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all"
                                placeholder="粘贴真实 PDF 条款链接（如：https://www.sinosig.com/...pdf）"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">条款原文 / RAW TERMS (用于 RAG 检索)</label>
                            <textarea
                                value={editingPlan.raw_content || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, raw_content: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[40px] px-8 py-6 text-slate-900 font-mono text-xs outline-none focus:border-slate-900 transition-all min-h-[200px]"
                                placeholder="粘贴完整的保险条款文本内容，AI 将基于此进行语义检索与建议..."
                            />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">方案解析 / DESCRIPTION</label>
                            <textarea
                                required
                                value={editingPlan.description || ''}
                                onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[40px] px-8 py-6 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all min-h-[120px]"
                                placeholder="深入解析方案的保障细节、免赔逻辑等..."
                            />
                        </div>
                        <div className="md:col-span-2 pt-6">
                            <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black shadow-2xl shadow-slate-900/20 hover:scale-[1.01] transition-all">保存方案信息</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insurancePlans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlanDetails(plan)}
                            className="group bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileSpreadsheet className="w-16 h-16 text-slate-900" />
                            </div>
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.company}</span>
                                    <h4 className="font-serif text-2xl italic font-black text-slate-900 leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">{plan.title}</h4>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingPlan(plan); setShowPlanForm(true); }}
                                            className="p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                                            className="p-4 bg-slate-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all uppercase">
                                        {plan.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ScraperModal
                isOpen={showScraperModal}
                onClose={() => setShowScraperModal(false)}
                onConfirm={handleScraperConfirm}
            />

            {selectedPlanDetails && (
                <PlanDetailsModal
                    plan={selectedPlanDetails}
                    onClose={() => setSelectedPlanDetails(null)}
                />
            )}
        </div>
    );
};

export default PlanManager;
