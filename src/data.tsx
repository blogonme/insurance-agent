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
  { id: "risk", title: "家庭风险全面评估", description: "深入分析家庭财务状况，识别潜在风险漏洞，构建稳固的家庭防护网。", icon: <Shield className="w-7 h-7" /> },
  { id: "wealth", title: "高净值财富传承", description: "针对高端客户，提供家族信托与终身寿险相结合的跨代分资方案。", icon: <Star className="w-7 h-7" /> },
  { id: "claims", title: "全程理赔管家服务", description: "从报案到结案，专人介入指导，确保客户权益得到最大化保障。", icon: <CheckCircle2 className="w-7 h-7" /> },
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
  "其他需求..."
];

export const CASES = [
  { 
    id: 1, 
    title: "理赔实录：320万医疗费全额赔付", 
    tag: "重疾理赔", 
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600&h=400",
    description: "本案例记录了一位 45 岁企业主突发脑溢血后的理赔全过程。在治疗期间产生了高达 320 万元的医疗及康复费用。得益于早期配置的足额重疾险与百万医疗险组合，我们在报案后 48 小时内即完成了资料初审，并在极短时间内实现了费用的全数覆盖汇报。",
    expert_insight: "该案例的核心价值在于“双重对冲”：重疾险提供的大笔现金流保证了病患及家属的心理与生活平稳，而百万医疗险则夯实了高端医疗资源的无忧接入。提前 5 年的保额动态升级是此次理赔能够完全覆盖损益的关键。"
  },
  { 
    id: 2, 
    title: "养老规划：35岁如何布局千万养老金", 
    tag: "财富增值", 
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=600&h=400",
    description: "理财不只是当下的收支，更是对未来的赋能。本案例展示了一位资深中产通过分红型年金与定期理财结合，在保持当前生活品质的同时，成功通过‘复利之火’在 60 岁退休时构建了预估超过 1200 万的现金价值养老池。",
    expert_insight: "养老规划切忌“临阵磨枪”。35 岁是利用复利杠杆的最佳窗口期。通过底层确定的现金价值分配，配合浮动分红追求超额收益，是高净值人群实现跨周期财富配置的标准范式。"
  },
  { 
    id: 3, 
    title: "家庭信托：资产隔离与定向传承实操", 
    tag: "法商智慧", 
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600&h=400",
    description: "资产的‘多’不代表‘稳’。在本实操案中，我们利用家族信托架构，成功地将一位客户的个人经营风险与家庭生活资产进行了法律层面的物理隔离。并在之后遭遇企业诉讼时，依然保全了为其子女预留的教育金及生活费。",
    expert_insight: "保险信托是资产保全的‘顶层设计’。它的核心逻辑不是追求收益，而是确立‘归属’。通过确定的受益人清单与严密的法律嵌套，我们让财富在特定规则下流向特定的人，规避了由于婚姻风险或负债追索带来的损耗。"
  }
];

export const ASSESSMENT_QUESTIONS: any[] = [
  {
    id: 1,
    question: "您的年龄段位于？",
    type: "single",
    options: ["18-25岁 (初入职场)", "26-35岁 (家庭形成期)", "36-50岁 (事业稳定期)", "51-60岁 (退休准备期)", "60岁以上 (安享晚年)"]
  },
  {
    id: 2,
    question: "目前的家庭结构是？",
    type: "single",
    options: ["单身贵族", "二人世界", "三口之家 (有未成年子女)", "三世同堂 (赡养父母)", "单亲家庭"]
  },
  {
    id: 3,
    question: "家庭大致年收入范围？",
    type: "single",
    options: ["10万以下", "10-30万", "30-50万", "50-100万", "100万以上"]
  },
  {
    id: 4,
    question: "目前已有哪些商业保险配置？",
    type: "multiple",
    options: ["暂无配置", "仅有意外险/医疗险", "已有重疾险", "配置较全 (含寿险/年金)", "不清楚"]
  },
  {
    id: 5,
    question: "您当前最核心的担忧是什么？",
    type: "multiple",
    options: ["大病医疗突发支出", "家庭支柱发生意外", "子女教育未来储备", "养老生活品质下降", "财富安全与传承"]
  }
];
