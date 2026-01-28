import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from "lucide-react";
import { AssessmentQuestion } from "../../../types";
import { db } from "../../../services/db";

interface AssessmentConfigProps {
    assessmentQuestions: AssessmentQuestion[];
    setAssessmentQuestions: React.Dispatch<React.SetStateAction<AssessmentQuestion[]>>;
    tenantId?: string;
}

const AssessmentConfig = ({ assessmentQuestions, setAssessmentQuestions, tenantId }: AssessmentConfigProps) => {
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return alert("租户 ID 缺失");

        let optionsArray = [];
        if (editingQuestion.input_type === 'single_choice' || editingQuestion.input_type === 'multiple_choice') {
            optionsArray = typeof editingQuestion.options === 'string'
                ? editingQuestion.options.split(/[，,]/).map((s: string) => s.trim()).filter(Boolean)
                : editingQuestion.options;
        }

        const formatted = {
            ...editingQuestion,
            options: optionsArray,
            tenant_id: tenantId,
            category: editingQuestion.category || "其他",
            input_type: editingQuestion.input_type || "single_choice"
        };

        const { data, error } = await db.upsertAssessmentQuestion(formatted);
        if (!error && data) {
            if (editingQuestion.id) setAssessmentQuestions(prev => prev.map(q => q.id === data.id ? data as AssessmentQuestion : q));
            else setAssessmentQuestions(prev => [...prev, data as AssessmentQuestion]);
            setShowQuestionForm(false);
            setEditingQuestion(null);
        } else alert(error?.message || "保存失败");
    };

    const handleDeleteQuestion = async (id: string) => {
        if (confirm('确定删除此问题吗？')) {
            const { error } = await db.deleteAssessmentQuestion(id);
            if (!error) setAssessmentQuestions(prev => prev.filter(q => q.id !== id));
        }
    };

    const groups = assessmentQuestions.reduce((acc, q) => {
        const cat = q.category || "未分类";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(q);
        return acc;
    }, {} as Record<string, typeof assessmentQuestions>);

    return (
        <div className="space-y-8">
            <div className="flex justify-end pr-2">
                {!showQuestionForm && (
                    <button
                        onClick={() => { setEditingQuestion({ question: "", type: "single", options: "" }); setShowQuestionForm(true); }}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-slate-900/20"
                    >
                        <Plus className="w-5 h-5 text-amber-500" /> 新增评估问题
                    </button>
                )}
            </div>

            {showQuestionForm && (
                <form onSubmit={handleSaveQuestion} className="bg-white p-10 rounded-[48px] space-y-8 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">核心问题</label>
                            <input required value={editingQuestion.question} onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-bold text-lg outline-none focus:border-slate-900" placeholder="例如：您的家庭年度总收入是多少？" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Phase / 阶段</label>
                                <input value={editingQuestion.category || ""} onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-bold outline-none focus:border-slate-900" placeholder="如：家庭基础画像" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">题型</label>
                                <select value={editingQuestion.input_type || "single_choice"} onChange={e => setEditingQuestion({ ...editingQuestion, input_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-bold outline-none focus:border-slate-900 appearance-none">
                                    <option value="text">文本输入</option>
                                    <option value="number">数值输入</option>
                                    <option value="date">日期选择</option>
                                    <option value="single_choice">单项选择</option>
                                    <option value="multiple_choice">多项选择</option>
                                </select>
                            </div>
                        </div>
                        {(editingQuestion.input_type === 'single_choice' || editingQuestion.input_type === 'multiple_choice') && (
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">备选答案 (以逗号分隔)</label>
                                <textarea rows={3} required value={Array.isArray(editingQuestion.options) ? editingQuestion.options.join(', ') : editingQuestion.options} onChange={e => setEditingQuestion({ ...editingQuestion, options: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-bold resize-none outline-none focus:border-slate-900" placeholder="选项A, 选项B, 选项C" />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black shadow-xl shadow-slate-900/20">确认保存评估配置</button>
                        <button type="button" onClick={() => setShowQuestionForm(false)} className="px-12 py-5 bg-slate-100 rounded-3xl font-black text-slate-600">取消</button>
                    </div>
                </form>
            )}

            <div className="space-y-12">
                {Object.entries(groups).map(([category, questions]) => (
                    <div key={category} className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-px bg-navy/10 flex-grow"></div>
                            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] whitespace-nowrap">{category} / 问题组</h3>
                            <div className="h-px bg-navy/10 flex-grow"></div>
                        </div>
                        <div className="grid gap-5">
                            {questions.map((q) => (
                                <div key={q.id} className="p-8 rounded-[40px] border bg-white border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-slate-300 transition-all shadow-sm">
                                    <div className="flex-grow md:pr-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-2xl font-black tracking-tight text-slate-900">{q.question}</h4>
                                            {!q.tenant_id && (
                                                <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black rounded-full uppercase tracking-widest border border-gold/20">系统默认模板</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {q.options.map((opt, idx) => (
                                                <span key={idx} className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-400">{opt}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0 self-end md:self-center text-slate-900">
                                        <button onClick={() => { setEditingQuestion(q); setShowQuestionForm(true); }} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                                            <Edit3 className="w-6 h-6" />
                                        </button>
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-4 bg-slate-50 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all">
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssessmentConfig;
