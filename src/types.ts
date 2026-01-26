
export interface InsurancePlan {
  id: string;
  tenant_id: string;
  title: string;
  company: string;
  type: string;
  highlight: string;
  benefit: string;
  description: string;
  desc?: string; // Supporting both for compatibility
  is_public: boolean;
  is_latest: boolean;
  created_at: string;
}

export interface Case {
  id: string;
  tenant_id: string;
  title: string;
  tag: string;
  image: string;
  description: string;
  is_archived: boolean;
  created_at: string;
}

export interface Inquiry {
  id: string;
  tenant_id: string;
  customer_name: string;
  phone: string;
  subject: string;
  status: 'pending' | 'contacted' | 'closed';
  assessment_data: any;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  tenant_id: string;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  content: string;
  tag: string;
  is_public: boolean;
  created_at: string;
}

export interface KnowledgeItem {
  id: string;
  tenant_id: string;
  title: string;
  category: string;
  desc_content: string;
  icon_name: string;
  is_public: boolean;
  created_at: string;
}
