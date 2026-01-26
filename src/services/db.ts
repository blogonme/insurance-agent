
import { supabase } from '../supabaseClient';
import { InsurancePlan, Case, Inquiry, AssessmentQuestion, Testimonial, KnowledgeItem } from '../types';

export const db = {
  // --- Tenant Resolution ---
  async getTenantBySlug(slug: string) {
    return supabase.from('tenants').select('id, name, slug').eq('slug', slug).single();
  },
  async getTenantProfile(tenantId: string) {
    return supabase.from('profiles').select('*').eq('tenant_id', tenantId).eq('role', 'admin').single();
  },
  async getTenantByUserId(userId: string) {
    // 首先获取 Profile
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single();
    if (profile?.tenant_id) {
       return supabase.from('tenants').select('id, name, slug').eq('id', profile.tenant_id).single();
    }
    return { data: null, error: new Error('Profile not found') };
  },

  // --- Insurance Plans ---
  async getPlans(tenantId?: string) {
    let query = supabase.from('insurance_plans').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    return query.order('created_at', { ascending: false });
  },
  async upsertPlan(plan: Partial<InsurancePlan>) {
    return supabase.from('insurance_plans').upsert(plan).select().single();
  },
  async deletePlan(id: string) {
    return supabase.from('insurance_plans').delete().eq('id', id);
  },

  // --- Cases ---
  async getCases(tenantId?: string) {
    let query = supabase.from('cases').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    return query.order('created_at', { ascending: false });
  },
  async upsertCase(caseData: Partial<Case>) {
    return supabase.from('cases').upsert(caseData).select().single();
  },
  async deleteCase(id: string) {
    return supabase.from('cases').delete().eq('id', id);
  },

  // --- Inquiries ---
  async getInquiries(tenantId?: string) {
    let query = supabase.from('inquiries').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    return query.order('created_at', { ascending: false });
  },
  async createInquiry(inquiry: Partial<Inquiry>) {
    return supabase.from('inquiries').insert(inquiry).select().single();
  },
  async updateInquiryStatus(id: string, status: Inquiry['status']) {
    return supabase.from('inquiries').update({ status }).eq('id', id);
  },
  async deleteInquiry(id: string) {
    return supabase.from('inquiries').delete().eq('id', id);
  },

  // --- Assessment Questions ---
  async getAssessmentQuestions(tenantId?: string) {
    let query = supabase.from('assessment_questions').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    return query.order('order', { ascending: true });
  },
  async upsertAssessmentQuestion(question: Partial<AssessmentQuestion>) {
    return supabase.from('assessment_questions').upsert(question).select().single();
  },
  async deleteAssessmentQuestion(id: string) {
    return supabase.from('assessment_questions').delete().eq('id', id);
  },

  // --- Testimonials ---
  async getTestimonials(tenantId?: string) {
    let query = supabase.from('testimonials').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    return query.order('created_at', { ascending: false });
  },

  // --- Knowledge Items ---
  async getKnowledgeItems(tenantId?: string) {
    let query = supabase.from('knowledge_items').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    return query.order('created_at', { ascending: false });
  }
};
