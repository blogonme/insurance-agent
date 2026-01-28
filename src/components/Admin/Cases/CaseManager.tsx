import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from "lucide-react";
import { Case } from "../../../types";
import { db } from "../../../services/db";
import AIImportModal from "./AIImportModal";

interface CaseManagerProps {
    cases: Case[];
    setCases: React.Dispatch<React.SetStateAction<Case[]>>;
    tenantId?: string;
}

const CaseManager = ({ cases, setCases, tenantId }: CaseManagerProps) => {
    const [showCaseForm, setShowCaseForm] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [editingCase, setEditingCase] = useState<any>(null);
    const [caseView, setCaseView] = useState<'published' | 'archived'>('published');

    const handleSaveCase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return alert("租户 ID 缺失");
        const formattedCase = { ...editingCase, tenant_id: tenantId };
        const { data, error } = await db.upsertCase(formattedCase);
        if (!error && data) {
            if (editingCase.id) setCases(prev => prev.map(c => c.id === data.id ? data as Case : c));
            else setCases(prev => [data as Case, ...prev]);
            setShowCaseForm(false);
        } else alert(error?.message || "保存失败");
    };

    const handleDeleteCase = async (id: string) => {
        if (confirm("确定要删除这个案例吗？")) {
            const { error } = await db.deleteCase(id);
            if (!error) setCases(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-slate-100 p-2 rounded-[28px] md:rounded-[32px] gap-3">
                <div className="flex bg-white rounded-xl md:rounded-2xl p-1 md:p-1.5 border border-slate-200 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setCaseView('published')}
                        className={`flex-1 sm:flex-none whitespace-nowrap px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${caseView === 'published' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        已发布案例
                    </button>
                    <button
                        onClick={() => setCaseView('archived')}
                        className={`flex-1 sm:flex-none whitespace-nowrap px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${caseView === 'archived' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        已归档
                    </button>
                </div>
                <button
                    onClick={() => setShowSearchModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 md:gap-3 transition-all hover:scale-[1.02] shadow-2xl shadow-slate-900/30 text-xs md:text-sm"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5 text-amber-500" /> 智能导入案例
                </button>
            </div>

            {showCaseForm ? (
                <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8 animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSaveCase} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">案例标题</label>
                                <input required value={editingCase.title || ""} onChange={e => setEditingCase({ ...editingCase, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold outline-none focus:border-slate-900" />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-6">
                            <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black shadow-xl shadow-slate-900/20">保存案例</button>
                            <button type="button" onClick={() => setShowCaseForm(false)} className="px-12 py-5 bg-slate-100 rounded-3xl font-black text-slate-600">取消</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {cases.filter((c) => caseView === 'published' ? !c.is_archived : c.is_archived).map((c) => (
                        <div key={c.id} className="p-4 md:p-6 rounded-[32px] md:rounded-[40px] border border-slate-100 bg-white flex items-center gap-4 md:gap-6 group hover:border-slate-300 transition-all shadow-sm">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-cover bg-center shrink-0 shadow-lg" style={{ backgroundImage: `url(${c.image})` }}></div>
                            <div className="flex-grow min-w-0">
                                <div className="text-[9px] md:text-[10px] font-black text-amber-600 mb-0.5 md:mb-1 uppercase tracking-widest">{c.tag}</div>
                                <div className="font-bold text-lg md:text-xl text-slate-900 leading-tight line-clamp-1 md:line-clamp-2">{c.title}</div>
                            </div>
                            <div className="flex gap-1.5 md:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all shrink-0 text-slate-900">
                                <button onClick={() => { setEditingCase(c); setShowCaseForm(true); }} className="p-2.5 md:p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteCase(c.id)} className="p-2.5 md:p-3 bg-slate-50 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showSearchModal && (
                <AIImportModal
                    tenantId={tenantId}
                    onClose={() => setShowSearchModal(false)}
                    onSuccess={(newCase) => setCases(prev => [newCase, ...prev])}
                />
            )}
        </div>
    );
};

export default CaseManager;
