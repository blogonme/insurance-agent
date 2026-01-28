import React, { useState } from 'react';
import { X, Search, ChevronDown, TrendingUp, Activity } from "lucide-react";
import { searchNews } from "../../../services/SearchService";
import { db } from "../../../services/db";
import { Case } from "../../../types";

interface AIImportModalProps {
    tenantId?: string;
    onClose: () => void;
    onSuccess: (newCase: Case) => void;
}

const SEARCH_PRESETS = ["重疾理赔", "医疗险案例", "家庭信托", "财富传承", "保险纠纷"];

const AIImportModal = ({ tenantId, onClose, onSuccess }: AIImportModalProps) => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchEngine, setSearchEngine] = useState<'baidu' | 'bing'>('baidu');
    const [isPresetOpen, setIsPresetOpen] = useState(false);

    const handleSearchNews = async (keywordToSearch: string) => {
        if (!keywordToSearch) return;
        setSearchLoading(true);
        setSearchKeyword(keywordToSearch);
        try {
            let results = await searchNews(keywordToSearch, searchEngine);
            if (results.length === 0) {
                try {
                    const response = await fetch('/src/data/search_results.json');
                    if (response.ok) {
                        const localData = await response.json();
                        results = localData.filter((r: any) =>
                            r.title.includes(keywordToSearch) || keywordToSearch.length < 3
                        ).slice(0, 5);
                    }
                } catch (e) { }
            }
            setSearchResults(results);
        } catch (err) {
            console.error('Search failed:', err);
            setSearchResults([]);
        } finally {
            setTimeout(() => setSearchLoading(false), 500);
        }
    };

    const handleQuickSaveCase = async (news: any) => {
        if (!tenantId) return alert("租户 ID 缺失，无法保存案例");

        const newCaseData = {
            tenant_id: tenantId,
            title: news.title,
            description: news.snippet || "AI 正在解析理赔核心事实...",
            expert_insight: "基于全网数据分析：该理赔案例具有极强的行业典型性。其核心风险点在于条款定义的深度解析，建议以此为蓝本进行方案二次复刻。",
            image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
            tag: "行业资讯",
            is_archived: false,
            created_at: new Date().toISOString()
        };

        setSearchLoading(true);
        try {
            const { data, error } = await db.upsertCase(newCaseData);
            if (error) throw error;
            if (data) {
                onSuccess(data as Case);
                onClose();
            }
        } catch (err: any) {
            alert('保存失败: ' + err.message);
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 text-slate-900">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[32px] md:rounded-[48px] border border-slate-200 shadow-2xl p-8 md:p-12 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tighter">AI 智能案例导入</h3>
                        <p className="text-slate-400 text-xs md:text-sm mt-1 font-bold">利用实时全网数据一键生成理赔案例</p>
                    </div>
                    <button onClick={onClose} className="p-3 md:p-5 hover:bg-slate-100 rounded-2xl md:rounded-3xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6 md:space-y-8 overflow-y-auto no-scrollbar pr-2 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">核心业务直达</label>
                            <button
                                onClick={() => setIsPresetOpen(!isPresetOpen)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-5 md:px-6 py-4 md:py-5 font-bold text-sm md:text-base flex items-center justify-between hover:border-slate-400 transition-all"
                            >
                                <span className={searchKeyword ? "text-slate-900 font-black" : "text-slate-400"}>
                                    {searchKeyword || "选择预设..."}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isPresetOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isPresetOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[110] p-2">
                                    {SEARCH_PRESETS.map(k => (
                                        <button
                                            key={k}
                                            onClick={() => { handleSearchNews(k); setIsPresetOpen(false); }}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 font-bold text-sm"
                                        >
                                            {k}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            placeholder="保险关键词..."
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearchNews(searchKeyword)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-32 py-5 font-bold text-lg focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                        />
                        <button
                            onClick={() => handleSearchNews(searchKeyword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:scale-[1.02] transition-all"
                        >
                            检索
                        </button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        {searchLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-6"></div>
                                <p className="text-slate-400 font-extrabold tracking-widest text-xs uppercase animate-pulse">AI Searching...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid gap-4">
                                {searchResults.map((res, idx) => (
                                    <div key={idx} onClick={() => handleQuickSaveCase(res)} className="group p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all cursor-pointer shadow-sm">
                                        <div className="flex gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-white shrink-0 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                                                <TrendingUp className="w-6 h-6 text-amber-500 opacity-50" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-extrabold text-lg group-hover:text-slate-900 truncate mb-1">{res.title}</h4>
                                                <p className="text-slate-400 text-xs line-clamp-2">{res.snippet}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-20">
                                <Activity className="w-12 h-12 mx-auto mb-4" />
                                <p className="font-black text-slate-900">Neural Search Active</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIImportModal;
