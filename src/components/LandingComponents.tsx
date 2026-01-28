import React, { ReactNode } from 'react';
import { ArrowRight, Shield, User, CheckCircle2 } from "lucide-react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export const ServiceCard = ({ icon, title, description, linkText = "了解精英方案", onLinkClick }: ServiceCardProps) => (
  <div
    onClick={onLinkClick}
    className="elite-card group p-6 md:p-8 rounded-[32px] md:rounded-[48px] flex flex-col items-start text-left h-full cursor-pointer relative overflow-hidden"
  >
    <div className="flex items-center gap-4 mb-4 md:mb-8 w-full">
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[18px] bg-navy/5 flex items-center justify-center text-navy group-hover:scale-110 group-hover:bg-navy group-hover:text-gold transition-all duration-500 shrink-0">
        {icon}
      </div>
      <h3 className="font-serif text-xl md:text-3xl italic font-black text-navy tracking-tight leading-tight">{title}</h3>
    </div>

    <div className="flex-grow">
      <p className="text-navy/50 leading-relaxed text-sm md:text-base font-medium">
        {description}
      </p>
    </div>

    <div className="mt-6 md:mt-10 flex items-center gap-3 text-gold font-black text-xs uppercase tracking-widest group/link">
      {linkText} <div className="w-8 h-[1px] bg-gold/30 group-hover/link:w-12 transition-all"></div> <ArrowRight className="w-4 h-4" />
    </div>
  </div>
);

export const AboutSection = ({ profile }: { profile?: any }) => (
  <section id="about" className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
    <div className="bg-white border border-navy/5 rounded-[40px] md:rounded-[60px] p-6 sm:p-10 md:p-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-20 relative overflow-hidden text-left shadow-2xl shadow-navy/5">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 p-32 opacity-[0.03] pointer-events-none font-serif text-[20rem] italic select-none">
        Elite
      </div>

      <div className="w-full lg:w-[48%] flex items-end justify-start gap-4 md:gap-5 shrink-0">
        <div className="w-[52%] aspect-[3/4] bg-bg-soft rounded-[24px] md:rounded-[40px] overflow-hidden relative shadow-lg group/img border-[4px] md:border-[8px] border-white">
          <img
            src={profile?.avatar_url || "/assets/avatar.jpg"}
            alt="Advisor"
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60"></div>
          <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6">
            <h4 className="font-serif text-lg md:text-2xl italic text-white font-black mb-0">{profile?.full_name || profile?.name || '彭艳'}</h4>
            <p className="text-gold font-black text-[7px] md:text-[9px] tracking-[0.1em] uppercase opacity-90">{profile?.raw_user_meta_data?.honor || 'Advisor'}</p>
          </div>
        </div>

        <div className="w-[42%] aspect-[3/4] bg-bg-soft rounded-[24px] md:rounded-[40px] p-2 md:p-4 flex flex-col items-center justify-center border-[4px] md:border-[8px] border-white shadow-lg relative group">
          <div className="w-full aspect-square bg-white rounded-xl p-1 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <img
              src={profile?.raw_user_meta_data?.qr_personal || "/assets/qr_personal.png"}
              className="w-full h-full object-contain"
              alt="QR Code"
            />
          </div>
          <div className="text-center mt-2">
            <div className="font-serif text-[8px] md:text-xs italic text-gold font-black uppercase tracking-widest whitespace-nowrap">扫码咨询</div>
          </div>
        </div>
      </div>

      <div className="flex-grow space-y-12 relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 bg-navy/5 px-6 py-2 rounded-full text-navy font-black text-[10px] uppercase tracking-[0.2em] border border-navy/10">
            Professional Heritage
          </div>
          <h3 className="font-serif text-5xl md:text-7xl italic text-navy leading-[1.1] tracking-tighter">
            不仅是资产管理<br />更是<span className="text-gold">世代信赖</span>的托付
          </h3>
          <p className="text-navy/60 text-lg md:text-xl leading-loose max-w-2xl font-medium italic">
            深耕大额寿险与家族信托领域十载。我坚信真正的保险服务应如“量体裁衣”，在客观精密的风险建模之上，注入对家庭未来的温情远见。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:gap-x-12 md:gap-y-10 border-t border-navy/5 pt-8 md:pt-12">
          {[
            { label: "从业资历", value: "10+", unit: "YEARS" },
            { label: "高净值家庭", value: "1000+", unit: "CLIENTS" },
            { label: "资产保全", value: "8亿+", unit: "AUM" },
            { label: "勋章荣誉", value: "50+", unit: "AWARDS" },
          ].map((stat, i) => (
            <div key={i} className="group">
              <div className="text-2xl md:text-5xl font-serif italic font-black text-navy mb-1 md:mb-2 group-hover:text-gold transition-colors">{stat.value}</div>
              <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em]">{stat.label} <span className="text-gold/60">/ {stat.unit}</span></div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 md:gap-4">
          {["AFP认证金融理财师", "MDRT内阁成员", "家族办公室架构师"].map((tag) => (
            <div key={tag} className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 bg-navy/5 border border-navy/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy/60 hover:border-gold/30 hover:text-navy transition-all">
              <Shield className="w-3 h-3 text-gold" /> {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
