import React from 'react';
import { MessageSquare, Activity, Shield } from "lucide-react";
import { Inquiry } from "../../../types";

interface DashboardHomeProps {
    inquiries: Inquiry[];
}

const DashboardHome = ({ inquiries }: DashboardHomeProps) => {
    const stats = [
        {
            label: "活跃咨询",
            value: inquiries.filter(i => i.status === 'pending').length.toString(),
            sub: "待处理请求",
            icon: <MessageSquare className="w-5 h-5" />
        },
        {
            label: "全站访客",
            value: "2.4k",
            sub: "+15% 较上周",
            icon: <Activity className="w-5 h-5" />
        },
        {
            label: "保障余额",
            value: "5.2亿",
            sub: "业务覆盖 500+ 家庭",
            icon: <Shield className="w-5 h-5" />
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, id) => (
                <div key={id} className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-white border border-slate-200 flex flex-col items-start gap-4 shadow-sm">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        {stat.icon}
                    </div>
                    <div>
                        <div className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase mb-1 tracking-widest">{stat.label}</div>
                        <div className="text-3xl md:text-4xl font-extrabold mb-1">{stat.value}</div>
                        <div className="text-amber-600 text-[10px] md:text-xs font-bold">{stat.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardHome;
