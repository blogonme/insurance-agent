import React from 'react';
import { MessageSquare, Activity, FileText, UserPlus, ClipboardList } from "lucide-react";
import { Inquiry } from "../../../types";

interface InquiryCardProps {
    inq: Inquiry;
    onViewReport: (inq: Inquiry) => void;
    onViewQuestionnaire: (inq: Inquiry) => void;
    onTransferToCRM: (inq: Inquiry) => void;
    onHandleInquiry: (inq: Inquiry) => void;
}

const InquiryCard = ({ inq, onViewReport, onViewQuestionnaire, onTransferToCRM, onHandleInquiry }: InquiryCardProps) => {
    return (
        <div className="p-8 rounded-[40px] border bg-white border-slate-100 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${inq.status === 'pending' ? 'bg-amber-500/10 text-amber-600 shadow-amber-500/10' : 'bg-slate-100 text-slate-400 shadow-none'}`}>
                    <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-xl font-black text-slate-900">{inq.customer_name}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inq.status === 'pending' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : inq.status === 'closed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {inq.status === 'pending' ? '待处理' : inq.status === 'closed' ? '已转 CRM' : '已跟进'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                        <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> {inq.subject}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span>{inq.phone}</span>
                    </div>


                    {inq.handling_notes && (
                        <div className="mt-3 text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-500 italic block">
                            <span className="font-bold text-slate-400 not-italic mr-2">处理记录:</span> {inq.handling_notes}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {inq.assessment_data && Object.keys(inq.assessment_data).length > 0 && (
                    <>
                        <button
                            onClick={() => onViewQuestionnaire(inq)}
                            className="px-6 py-3.5 rounded-2xl font-black text-sm bg-amber-500 text-slate-900 border border-amber-600/10 hover:scale-[1.05] transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
                        >
                            <ClipboardList className="w-4 h-4" /> 查看原始问卷
                        </button>
                        <button
                            onClick={() => onViewReport(inq)}
                            className="px-6 py-3.5 rounded-2xl font-black text-sm bg-navy text-gold hover:scale-[1.05] transition-all flex items-center gap-2 shadow-xl shadow-navy/20 border border-gold/30"
                        >
                            <FileText className="w-4 h-4" /> 查看精算报告
                        </button>
                    </>
                )}
                {inq.status !== 'closed' && (
                    <button
                        onClick={() => onTransferToCRM(inq)}
                        className="px-6 py-3.5 rounded-2xl font-black text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-[1.05] transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> 转入 CRM
                    </button>
                )}
                <button
                    onClick={() => onHandleInquiry(inq)}
                    className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all ${inq.status === 'pending' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    {inq.status === 'pending' ? '标记为已处理' : '恢复为待处理'}
                </button>
            </div>
        </div>
    );
};

export default InquiryCard;
