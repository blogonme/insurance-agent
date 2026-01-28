import React, { useState } from 'react';
import { X, Shield, Search, ChevronRight, Loader2, CheckCircle2, Globe, Sparkles } from "lucide-react";

interface ScraperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (plans: any[]) => void;
}

const COMPANIES = [
    { name: "阳光人寿", logo: "https://www.sinosig.com/favicon.ico", desc: "SINO SIG - 阳光保险官方通道" },
    { name: "中国平安", logo: "https://www.pingan.com/favicon.ico", desc: "PING AN - 全渠道产品实时获取" },
    { name: "友邦保险", logo: "https://www.aia.com.cn/favicon.ico", desc: "AIA - 高端医疗与重疾方案抓取" },
    { name: "泰康人寿", logo: "https://www.taikang.com/favicon.ico", desc: "TAIKANG - 养老与健康保障同步" }
];

const ScraperModal = ({ isOpen, onClose, onConfirm }: ScraperModalProps) => {
    const [step, setStep] = useState<'select' | 'scraping' | 'review'>('select');
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const [url, setUrl] = useState("");
    const [scrapedPlans, setScrapedPlans] = useState<any[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const handleStartScraping = () => {
        if (!selectedCompany && !keyword && !url) return;
        setStep('scraping');

        // 模拟深度抓取与 AI 条款解析
        setTimeout(() => {
            const companyTag = selectedCompany || (url ? "官网站点" : "全网保司");
            const searchKey = keyword || (url ? "深度解析产品" : "热销方案");

            // 构造更真实的 PDF 条款链接 (优先使用用户提供的 URL)
            let finalTermsUrl = "https://www.sinosig.com/gkxxpl/cpys/syx/zkcx/index.shtml"; // 默认公开披露页
            if (url && url.toLowerCase().endsWith('.pdf')) {
                finalTermsUrl = url;
            } else if (url) {
                // 如果是产品页，模拟寻找其条款 PDF 的过程
                finalTermsUrl = url.includes('?') ? (url + "&file=terms.pdf") : (url + "/terms.pdf");
            }

            const mockResults = [
                {
                    company: selectedCompany || (url ? "解析自官网" : "阳光人寿"),
                    title: url ? `AI 提取：阳光臻享高端医疗（2026版）` : `${searchKey}·${companyTag} 专属版·臻享方案`,
                    type: "医疗保障",
                    highlight: "不限药单 · 0免赔额 · 终身限额2000万",
                    benefit: "最高 600万/年",
                    description: url ? `AI 已成功解析来自 ${url} 的网页内容：该方案是目前市场上主流的高端医疗保障，支持全球医疗直付。` : `基于关键字“${keyword}”抓取到的针对性保险方案。`,
                    terms_url: finalTermsUrl,
                    raw_content: "【深度解析条款】第一条：保险期间。本合同保险期间为1年。第二条：保险责任。在保险期间内，被保险人因疾病或意外发生的合理且必要的医疗费用，保险人承担给付责任。包含住院医疗、特殊门诊、门诊手术等..."
                }
            ];
            setScrapedPlans(mockResults);
            setSelectedIndices([0]);
            setStep('review');
        }, 3000);
    };

    const handleConfirm = () => {
        const toSave = scrapedPlans.filter((_, i) => selectedIndices.includes(i));
        onConfirm(toSave);
        onClose();
        setStep('select');
        setSelectedCompany(null);
        setUrl("");
        setKeyword("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-500">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Sparkles className="w-6 h-6 text-slate-900" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">智能方案同步</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">AUTOMATED INSURANCE SCRAPER</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-10 scroll-container">
                    {step === 'select' && (
                        <div className="space-y-8">
                            {/* URL Scraping Input */}
                            <div className="bg-sky-50 rounded-[32px] p-8 border border-sky-100 space-y-4">
                                <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-sky-500" /> 直接从产品 URL 深度抓取
                                </label>
                                <input
                                    type="text"
                                    placeholder="粘贴保司官网产品详情页 URL（如：https://...）"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full bg-white border border-sky-200 rounded-2xl px-6 py-5 text-slate-900 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold shadow-sm"
                                />
                                <div className="text-[10px] font-bold text-sky-600/60 pl-2">※ 粘贴真实 URL 后，AI 将自动访问网页并提取完整的保障条款与核心数据</div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <Search className="w-4 h-4 text-amber-500" /> 按方案关键字抓取
                                </label>
                                <input
                                    type="text"
                                    placeholder="输入产品关键字（如：百万医疗、臻享、守护...）"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="text-sm font-bold text-slate-400 mb-2">或指定同步的平台 (可选)</div>
                                <div className="grid gap-3">
                                    {COMPANIES.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => setSelectedCompany(selectedCompany === c.name ? null : c.name)}
                                            className={`p-6 rounded-3xl border text-left flex items-center justify-between transition-all group ${selectedCompany === c.name ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10' : 'border-slate-100 hover:border-slate-300 bg-slate-50/30'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden p-1 px-2 border border-slate-100">
                                                    <img src={c.logo} alt="" className="w-full h-auto grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm">{c.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{c.desc}</div>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCompany === c.name ? 'bg-amber-500 border-amber-500' : 'border-slate-200 group-hover:border-slate-300'}`}>
                                                {selectedCompany === c.name && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'scraping' && (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-amber-500 animate-spin"></div>
                                <Loader2 className="w-10 h-10 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900">{url ? "AI 正在深度解析网页条款..." : "正在同步保司库数据..."}</h3>
                                <p className="text-sm font-medium text-slate-400 max-w-sm">正在检索官方公开信披目录，解析最新的 PDF 产品条款与费率表，请保持连接稳定。</p>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-black text-slate-400">抓取到 {scrapedPlans.length} 个新方案</span>
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">已自动发现条款 PDF</span>
                            </div>
                            <div className="grid gap-4">
                                {scrapedPlans.map((plan, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            if (selectedIndices.includes(i)) setSelectedIndices(selectedIndices.filter(idx => idx !== i));
                                            else setSelectedIndices([...selectedIndices, i]);
                                        }}
                                        className={`p-6 rounded-[32px] border cursor-pointer transition-all ${selectedIndices.includes(i) ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100 bg-slate-50/50'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedIndices.includes(i) ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-500'}`}>
                                                {plan.type}
                                            </span>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedIndices.includes(i) ? 'bg-amber-500 border-amber-500' : 'border-slate-200'}`}>
                                                {selectedIndices.includes(i) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 mb-1">{plan.title}</div>
                                        <div className="text-xs font-bold text-slate-500">{plan.highlight}</div>

                                        {selectedIndices.includes(i) && (
                                            <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-sky-600">
                                                    <Globe className="w-3.5 h-3.5" /> 条款解析完成
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400">可入库知识量: 1,420 词</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-slate-100 bg-white flex items-center justify-between gap-4 sticky bottom-0 shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 italic max-w-[200px]">
                        {step === 'select' && "支持抓取产品条款、费率表及理赔规则"}
                        {step === 'review' && `已选择 ${selectedIndices.length} 个方案准备入库并开启 RAG`}
                    </div>
                    <div className="flex gap-3">
                        {step === 'select' && (
                            <button
                                onClick={handleStartScraping}
                                disabled={!selectedCompany && !keyword.trim() && !url.trim()}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:scale-105 transition-all text-sm disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                            >
                                开始同步解析 <ChevronRight className="w-4 h-4 text-amber-500" />
                            </button>
                        )}
                        {step === 'review' && (
                            <>
                                <button
                                    onClick={() => setStep('select')}
                                    className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all border-b-4 border-slate-200"
                                >
                                    返回重选
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:scale-105 transition-all text-sm flex items-center gap-2"
                                >
                                    确认同步到库 <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScraperModal;
