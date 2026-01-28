import { supabase } from '../supabaseClient';
import { Customer, CustomerInteraction, Contract, CustomerStatus, InteractionType, CustomerRelationship } from '../types/crm';

export const crmService = {
  // Customer CRUD
  async getCustomers(status?: CustomerStatus) {
    let query = supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (status) {
      query = (query as any).eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Customer[];
  },

  async getCustomerById(id: string) {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Customer;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Customer;
  },

  async upsertCustomer(customer: Partial<Customer>) {
    const { data, error } = await supabase.from('customers').upsert(customer).select().single();
    if (error) throw error;
    return data as Customer;
  },

  async getRecentInteractions(type?: InteractionType, limit: number = 50, tenantId?: string) {
    let query = supabase.from('customer_interactions').select('*, customers(full_name, phone)').order('created_at', { ascending: false }).limit(limit);
    if (type) {
      query = query.eq('type', type);
    }
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Interactions (Chronological event log)
  async getInteractions(customerId: string) {
    const { data, error } = await supabase
      .from('customer_interactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as CustomerInteraction[];
  },

  async logInteraction(customerId: string, type: InteractionType, content: Record<string, any>, tenantId?: string) {
    const { data, error } = await supabase
      .from('customer_interactions')
      .insert({ customer_id: customerId, type, content, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    return data as CustomerInteraction;
  },

  // Contracts & Upload (Linked to Storage)
  async getContracts(customerId?: string) {
    let query = supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Contract[];
  },

  async getAllContracts() {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        customers (
          full_name
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as (Contract & { customers: { full_name: string } | null })[];
  },

  async uploadContract(file: File, customerId?: string, contractName?: string, tenantId?: string) {
    const fileExt = file.name.split('.').pop();
    const filePath = `contracts/${customerId || 'library'}/${Date.now()}_${file.name}`;
    
    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('insurance-contracts')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;

    // 2. Create DB record
    const { data, error: dbError } = await supabase
      .from('contracts')
      .insert({
        customer_id: customerId || null,
        contract_name: contractName || file.name,
        file_path: filePath,
        status: 'pending',
        tenant_id: tenantId
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    return data as Contract;
  },

  async linkContractToCustomer(contractId: string, customerId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .update({ customer_id: customerId })
      .eq('id', contractId)
      .select()
      .single();
    if (error) throw error;
    return data as Contract;
  },

  // Relationships
  async getRelationships(customerId: string) {
    const { data, error } = await supabase
      .from('customer_relationships')
      .select('*, related_customer:to_customer_id(full_name, phone)')
      .eq('from_customer_id', customerId);
    if (error) throw error;
    return data as CustomerRelationship[];
  },

  async addRelationship(fromId: string, toId: string, type: string, label: string, tenantId?: string) {
    // We add two-way relationship conceptually or just one-way with specific label
    const { data, error } = await supabase
      .from('customer_relationships')
      .insert({ 
        from_customer_id: fromId, 
        to_customer_id: toId, 
        relationship_type: type, 
        relationship_label: label,
        tenant_id: tenantId 
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRelationship(id: string) {
    const { error } = await supabase
      .from('customer_relationships')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async deleteContract(id: string, filePath: string) {
    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('insurance-contracts')
      .remove([filePath]);
    
    if (storageError) throw storageError;

    // 2. Delete from Database
    const { error: dbError } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);
    
    if (dbError) throw dbError;
  }
};
