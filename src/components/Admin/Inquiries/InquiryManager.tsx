import React, { useState } from 'react';
import { Search, MessageSquare, CheckCircle2 } from "lucide-react";
import { InsurancePlan, Inquiry } from "../../../types";
import InquiryCard from "./InquiryCard";
import ReportModal from "./ReportModal";
import QuestionnaireModal from "./QuestionnaireModal";
import { db } from "../../../services/db";
import { crmService } from "../../../services/crmService";

interface InquiryManagerProps {
    inquiries: Inquiry[];
    setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
    insurancePlans?: InsurancePlan[];
    tenantId?: string;
}

const InquiryManager = ({ inquiries, setInquiries, insurancePlans = [], tenantId }: InquiryManagerProps) => {
    const [inquiryView, setInquiryView] = useState<'pending' | 'completed'>('pending');
    const [inquirySearchTerm, setInquirySearchTerm] = useState("");
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportInquiry, setReportInquiry] = useState<Inquiry | null>(null);
    const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
    const [questionnaireInquiry, setQuestionnaireInquiry] = useState<Inquiry | null>(null);

    // Handling Modal State
    const [isHandlingModalOpen, setIsHandlingModalOpen] = useState(false);
    const [handlingInquiry, setHandlingInquiry] = useState<Inquiry | null>(null);
    const [handlingNotes, setHandlingNotes] = useState("");

    const handleToggleInquiryStatus = async (id: string, currentStatus: Inquiry['status'], notes?: string) => {
        const nextStatus = currentStatus === 'pending' ? 'contacted' : 'pending';
        const { error } = await db.updateInquiryStatus(id, nextStatus, notes);
        if (!error) {
            setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: nextStatus, handling_notes: notes } : i));
            setIsHandlingModalOpen(false);
            setHandlingNotes("");
        }
    };

    const handleTransferToCRM = async (inquiry: Inquiry) => {
        if (!confirm(`确定将咨询客户 [${inquiry.customer_name}] 转入客户中心吗？`)) return;

        try {
            const newCustomer = {
                full_name: inquiry.customer_name,
                phone: inquiry.phone,
                status: 'prospect' as any,
                metadata: { source: 'inquiry_transfer', original_subject: inquiry.subject },
                tenant_id: tenantId
            };

            const customer = await crmService.upsertCustomer(newCustomer);

            await crmService.logInteraction(customer.id, 'inquiry', {
                subject: inquiry.subject,
                notes: inquiry.handling_notes || "从理赔咨询自动转入",
                assessment_data: inquiry.assessment_data
            }, tenantId);

            const { error: updateError } = await db.updateInquiryStatus(inquiry.id, 'closed', "已转入客户中心");
            if (!updateError) {
                setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, status: 'closed', is_transferred: true, handling_notes: "已转入客户中心" } : i));
                alert("转入成功！已在客户中心创建该客户档案。");
            }
        } catch (err: any) {
            alert("转入失败: " + err.message);
        }
    };

    const filteredInquiries = inquiries.filter(inq => {
        const matchesStatus = inquiryView === 'pending' ? inq.status === 'pending' : inq.status !== 'pending';
        const matchesSearch = !inquirySearchTerm ||
            inq.customer_name?.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
            inq.phone?.includes(inquirySearchTerm);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-8 text-slate-900">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="flex bg-white rounded-2xl p-1.5 border border-slate-200">
                    <button
                        onClick={() => setInquiryView('pending')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${inquiryView === 'pending' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        待处理咨询
                    </button>
                    <button
                        onClick={() => setInquiryView('completed')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${inquiryView === 'completed' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        已处理/归档
                    </button>
                </div>

                <div className="relative group flex-grow max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                        placeholder="搜索客户姓名或手机号..."
                        value={inquirySearchTerm}
                        onChange={e => setInquirySearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 font-bold text-sm focus:border-slate-900 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {filteredInquiries.length > 0 ? filteredInquiries.map((inq) => (
                    <InquiryCard
                        key={inq.id}
                        inq={inq}
                        onViewReport={(i) => { setReportInquiry(i); setShowReportModal(true); }}
                        onViewQuestionnaire={(i) => { setQuestionnaireInquiry(i); setShowQuestionnaireModal(true); }}
                        onTransferToCRM={handleTransferToCRM}
                        onHandleInquiry={(i) => {
                            if (i.status === 'pending') {
                                setHandlingInquiry(i);
                                setHandlingNotes("");
                                setIsHandlingModalOpen(true);
                            } else {
                                handleToggleInquiryStatus(i.id, i.status);
                            }
                        }}
                    />
                )) : (
                    <div className="text-center py-32 opacity-20">
                        <MessageSquare className="w-20 h-20 mx-auto mb-6" />
                        <p className="font-serif italic font-black text-2xl">暂无{inquiryView === 'pending' ? '待处理' : '已归档'}咨询</p>
                    </div>
                )}
            </div>

            {isHandlingModalOpen && handlingInquiry && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsHandlingModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[48px] border border-slate-200 shadow-2xl p-10 md:p-12 animate-in zoom-in-95 duration-300">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="font-serif text-amber-600 italic font-black text-lg">Action Required</div>
                                <h3 className="font-serif text-3xl italic font-black text-slate-900 leading-tight">记录处理动作</h3>
                                <p className="text-slate-400 text-sm font-bold">请简要记录您与 <span className="text-slate-600">[{handlingInquiry.customer_name}]</span> 的沟通结果或后台处理进度。</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">沟通备注 / Handling Notes</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={handlingNotes}
                                    onChange={e => setHandlingNotes(e.target.value)}
                                    placeholder="例如：已电话回访，客户对重疾险方案感兴趣，已约线下签约..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300 font-bold resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={() => handleToggleInquiryStatus(handlingInquiry.id, handlingInquiry.status, handlingNotes)}
                                    className="flex-grow bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                                >
                                    确认并标记已处理 <CheckCircle2 className="w-5 h-5 text-amber-500" />
                                </button>
                                <button onClick={() => setIsHandlingModalOpen(false)} className="px-8 py-5 bg-slate-100 rounded-3xl font-black text-slate-400 hover:text-slate-600">取消</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && reportInquiry && (
                <ReportModal
                    reportInquiry={reportInquiry}
                    insurancePlans={insurancePlans}
                    onClose={() => setShowReportModal(false)}
                />
            )}

            {showQuestionnaireModal && questionnaireInquiry && (
                <QuestionnaireModal inquiry={questionnaireInquiry} onClose={() => setShowQuestionnaireModal(false)} />
            )}
        </div>
    );
};

export default InquiryManager;
