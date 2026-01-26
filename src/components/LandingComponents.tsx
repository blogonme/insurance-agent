import React, { ReactNode } from 'react';
import { ArrowRight, Shield, User, CheckCircle2 } from "lucide-react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export const ServiceCard = ({ icon, title, description, linkText = "了解详情", onLinkClick }: ServiceCardProps) => (
  <div 
    onClick={onLinkClick}
    className="group p-4 md:p-8 rounded-2xl md:rounded-[32px] border border-white/5 bg-neutral-900/40 hover:bg-neutral-900/60 transition-all duration-300 flex flex-row md:flex-col items-center md:items-start text-left h-full cursor-pointer"
  >
    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary mr-4 md:mr-0 md:mb-8 group-hover:scale-110 transition-transform duration-500 shrink-0">
      {icon}
    </div>
    <div className="flex-grow">
      <h3 className="text-base md:text-2xl font-bold md:mb-4 text-white tracking-tight">{title}</h3>
      <p className="hidden md:block text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
        {description}
      </p>
      <div 
        className="hidden md:flex items-center text-primary font-bold hover:gap-2 transition-all group/link"
      >
        {linkText} <ArrowRight className="w-4 h-4 ml-1.5 text-primary group-hover/link:translate-x-1 transition-transform" />
      </div>
    </div>
    <div className="md:hidden text-primary">
      <ArrowRight className="w-5 h-5" />
    </div>
  </div>
);

export const AboutSection = () => (
  <section id="about" className="max-w-7xl mx-auto px-6 mb-32 md:mb-52">
    <div className="bg-card border border-white/10 rounded-[48px] md:rounded-[64px] p-8 md:p-20 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
        <Shield className="w-96 h-96" />
      </div>
      
      <div className="w-full lg:w-1/3 shrink-0">
        <div className="aspect-[4/5] bg-neutral-800 rounded-[40px] overflow-hidden relative shadow-2xl group/img">
          <img 
            src="/assets/avatar.jpg" 
            alt="彭艳" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8">
            <h4 className="text-2xl font-bold mb-1">彭艳 (Peng Yan)</h4>
            <p className="text-primary font-bold text-sm tracking-widest uppercase">Senior Financial Planner</p>
          </div>
        </div>
      </div>

      <div className="flex-grow space-y-10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl text-primary font-bold text-xs uppercase tracking-widest mb-6 border border-primary/20">
             个人简介 · 专业沉淀
          </div>
          <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-tight">
            不只是理财师<br /><span className="opacity-40">更是您家庭资产的安全守护人</span>
          </h3>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl">
            深耕保险理财领域逾 10 年，我始终坚持“客观、专业、有温度”的服务逻辑。针对家庭全生命周期的风险缺口进行动态管理，致力于为高净值家庭及普通奋斗家庭提供具有前瞻性的财富守护方案。
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: "从业时长", value: "10+", unit: "年" },
             { label: "服务家庭", value: "1000+", unit: "户" },
             { label: "理赔案件", value: "500+", unit: "件" },
             { label: "管理资产", value: "8亿+", unit: "元" },
           ].map((stat, i) => (
             <div key={i}>
                <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}<span className="text-xs ml-1 text-gray-500">{stat.unit}</span></div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
             </div>
           ))}
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
           {["AFP金融理财师认证", "阳光保险TOP精英组成员", "百万标保俱乐部成员"].map((tag) => (
             <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-primary" /> {tag}
             </div>
           ))}
        </div>
      </div>
    </div>
  </section>
);
