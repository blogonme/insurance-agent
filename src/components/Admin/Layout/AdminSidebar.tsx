import React from 'react';
import {
    Shield, LayoutDashboard, MessageSquare, Users, FileSpreadsheet,
    TrendingUp, GanttChart, Palette, Globe, LogOut, X
} from "lucide-react";

interface AdminSidebarProps {
    adminTab: string;
    setAdminTab: (tab: any) => void;
    isAdminMenuOpen: boolean;
    setIsAdminMenuOpen: (open: boolean) => void;
    inquiriesCount: number;
    onExit: () => void;
    onLogout: () => void;
}

const AdminSidebar = ({
    adminTab,
    setAdminTab,
    isAdminMenuOpen,
    setIsAdminMenuOpen,
    inquiriesCount,
    onExit,
    onLogout
}: AdminSidebarProps) => {
    const menuItems = [
        { id: 'dashboard', label: '系统概览', icon: LayoutDashboard },
        { id: 'messages', label: '咨询管理', icon: MessageSquare, badge: inquiriesCount },
        { id: 'crm', label: '客户中心', icon: Users },
        { id: 'contract-library', label: '合同中心', icon: FileSpreadsheet },
        { id: 'plans', label: '方案管理', icon: FileSpreadsheet },
        { id: 'cases', label: '案例管理', icon: TrendingUp },
        { id: 'assessment', label: '评估配置', icon: GanttChart },
        { id: 'appearance', label: '界面风格', icon: Palette },
    ];

    return (
        <div className={`fixed md:relative w-[85vw] max-w-72 h-full border-r border-slate-800 flex flex-col p-6 shrink-0 bg-white/80 backdrop-blur-3xl z-[70] transition-all duration-500 ease-out ${isAdminMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 shadow-2xl md:shadow-none'}`}>
            <div className="flex items-center justify-between mb-14 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <Shield className="w-7 h-7 text-amber-500" />
                    </div>
                    <span className="font-serif italic font-black text-2xl tracking-tight text-slate-900">Elite Admin</span>
                </div>
                <button className="md:hidden p-2 text-slate-900/40" onClick={() => setIsAdminMenuOpen(false)}>
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-grow space-y-3 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setAdminTab(item.id as any); setIsAdminMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 p-5 rounded-[24px] font-black text-sm transition-all relative ${adminTab === item.id ? "bg-slate-900 text-white" : "text-slate-900/40 hover:bg-slate-900/5 hover:text-slate-900"}`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" /> {item.label}
                        {item.badge ? (
                            <span className="absolute top-4 right-5 w-5 h-5 bg-amber-500 text-slate-900 text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                {item.badge}
                            </span>
                        ) : null}
                    </button>
                ))}
            </nav>

            <div className="border-t border-slate-900/5 pt-8 space-y-3">
                <button onClick={onExit} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-900/5 text-slate-900/40 hover:text-slate-900 font-black transition-all text-xs uppercase tracking-widest">
                    <Globe className="w-5 h-5" /> Portal View
                </button>
                <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-600 hover:text-red-700 font-black transition-all text-xs uppercase tracking-widest">
                    <LogOut className="w-5 h-5" /> Security Sign out
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
