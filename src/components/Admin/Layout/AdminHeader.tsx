import React from 'react';
import { Shield, Menu } from "lucide-react";

interface AdminHeaderProps {
    setIsAdminMenuOpen: (open: boolean) => void;
}

const AdminHeader = ({ setIsAdminMenuOpen }: AdminHeaderProps) => {
    return (
        <header className="md:hidden flex items-center justify-between p-6 border-b border-slate-200 bg-white/60 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-500" />
                </div>
                <span className="font-serif italic font-black text-lg text-slate-900">Elite Admin</span>
            </div>
            <button
                onClick={() => setIsAdminMenuOpen(true)}
                className="p-2 text-slate-900/60 hover:text-slate-900 transition-all"
            >
                <Menu className="w-6 h-6" />
            </button>
        </header>
    );
};

export default AdminHeader;
