export type CustomerStatus = 'visitor' | 'lead' | 'prospect' | 'contract_client';

export interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  tenant_id?: string;
  id_card?: string;
  address?: string;
  referrer?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type InteractionType = 'browsing' | 'inquiry' | 'communication' | 'manual_log';

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  tenant_id?: string;
  type: InteractionType;
  content: Record<string, any>;
  created_at: string;
}

export interface CustomerRelationship {
  id: string;
  from_customer_id: string;
  to_customer_id: string;
  relationship_type: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  relationship_label: string;
  created_at: string;
  // Join data
  related_customer?: {
    full_name: string;
    phone: string;
  };
}

export type ContractStatus = 'pending' | 'processed' | 'failed';

export interface Contract {
  id: string;
  customer_id?: string | null;
  tenant_id?: string;
  file_path: string;
  contract_name?: string | null;
  ocr_result: Record<string, any> | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}
