
export interface InsurancePlan {
  id: string;
  tenant_id: string;
  title: string;
  company: string;
  type: string;
  highlight: string;
  benefit: string;
  description: string;
  desc?: string; 
  terms_url?: string;
  raw_content?: string;
  is_public: boolean;
  is_latest: boolean;
  created_at: string;
}

export interface ProductKnowledge {
  id: string;
  plan_id: string;
  content: string;
  embedding?: number[];
  metadata: any;
  created_at: string;
}

export interface Case {
  id: string;
  tenant_id: string;
  title: string;
  tag: string;
  image: string;
  description: string;
  expert_insight?: string;
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
  handling_notes?: string;
  is_transferred?: boolean;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  tenant_id: string | null;
  category?: string;
  question: string;
  input_type: 'text' | 'number' | 'date' | 'single_choice' | 'multiple_choice';
  options: string[];
  placeholder?: string;
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
