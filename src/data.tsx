import React from 'react';
import { 
  Shield, Star, CheckCircle2, Zap, Lightbulb, BookOpen, 
  Heart, TrendingUp, Scale, GanttChart, Stethoscope, Activity 
} from "lucide-react";

export const INITIAL_PLANS = [
  { 
    id: 1, 
    company: "阳光人寿", 
    title: "臻鑫倍护重疾险 (2026版)", 
    type: "重疾保障", 
    highlight: "特疾加倍 · 癌症多次赔 · 投保灵活", 
    benefit: "最高保障 120万", 
    isLatest: true,
    desc: "针对现代高发重疾深度定制，新增了15种特定高发疾病的额外给付，确诊即赔，无需等待理赔周转。"
  },
  { 
    id: 2, 
    company: "阳光财险", 
    title: "爱家保 · 房屋综合保障计划", 
    type: "财产险", 
    highlight: "极速理赔 · 覆盖全家 · 意外伤害", 
    benefit: "总保障 500万+", 
    isLatest: false,
    desc: "不仅保障房屋资产，更涵盖家庭成员意外支出，是真正意义上的家庭安全盾牌。"
  },
  { 
    id: 3, 
    company: "阳光人寿", 
    title: "长青树定期寿险", 
    type: "人寿险", 
    highlight: "高额身故 · 猝死守护 · 费率透明", 
    benefit: "最高保障 300万", 
    isLatest: false,
    desc: "专为家庭核心成员 design，低保费高保障，在风雨来临时为家人留下一份坚实的财务支撑。"
  },
];

export const SERVICES = [
  { id: "risk", title: "家庭风险全面评估", desc: "深入分析家庭财务状况，识别潜在风险漏洞，构建稳固的家庭防护网。", icon: <Shield className="w-7 h-7" /> },
  { id: "wealth", title: "高净值财富传承", desc: "针对高端客户，提供家族信托与终身寿险相结合的跨代分资方案。", icon: <Star className="w-7 h-7" /> },
  { id: "claims", title: "全程理赔管家服务", desc: "从报案到结案，专人介入指导，确保客户权益得到最大化保障。", icon: <CheckCircle2 className="w-7 h-7" /> },
];

export const KNOWLEDGE_ITEMS = [
  { title: "人生必备的“七张保单”", category: "投保指南", desc: "意外、过大疾病、养老、寿险、教育金、子女意外、财富传承实。不同阶段配置重点各有不同。", icon: <Zap className="w-5 h-5" /> },
  { title: "理赔纠纷如何有效避免？", category: "理赔百科", desc: "如实告知是基石，看清免责条款是关键。理赔时及时报案并保留原始资料是提速的捷径。", icon: <Lightbulb className="w-5 h-5" /> },
  { title: "百万医疗险与重疾险区别", category: "专家解读", desc: "医疗险是实报实销解决医药费，重疾险是给付制补偿收入损失。双剑合璧方能全面对冲大病风险。", icon: <BookOpen className="w-5 h-5" /> }
];

export const QUICK_TOOLS = [
  { title: "家庭保障计划", icon: <Heart className="w-5 h-5" /> },
  { title: "养老储蓄金", icon: <TrendingUp className="w-5 h-5" /> },
  { title: "资产风险隔离", icon: <Scale className="w-5 h-5" /> },
  { title: "遗产税收筹划", icon: <GanttChart className="w-5 h-5" /> },
  { title: "全球医疗直付", icon: <Stethoscope className="w-5 h-5" /> },
  { title: "快速理赔通道", icon: <Activity className="w-5 h-5" /> },
];

export const TESTIMONIALS = [
  { name: "王先生", role: "企业主", content: "彭经理非常专业，她不仅帮我配置了保险，更协助我通过大额保单完成了家族财富的风险隔离，非常感谢。", tag: "财富传承" },
  { name: "李女士", role: "资深HR", content: "第一次理赔时我很手足无措，彭经理全程指导，不仅理赔飞快，还安抚了我的情绪，这种服务太少见了。", tag: "极速理赔" },
  { name: "张医生", role: "外科医生", content: "她是理财师中少有的懂医学保障的人。方案客观公允，没有任何强推，完全根据我的职业风险和收入情况定制。", tag: "方案公允" }
];

export const INQUIRY_SUBJECTS = [
  "家庭保障方案定制",
  "子女教育金规划",
  "养老退休财务安排",
  "高额医疗与重疾保障",
  "保单检视与理赔咨询",
  "其他需求..."
];
