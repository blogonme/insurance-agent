import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  FileText, 
  MessageSquare, 
  Eye, 
  Upload, 
  FileCheck,
  Zap,
  ExternalLink,
  ChevronDown,
  Users,
  Search,
  Edit2,
  Save,
  Loader2,
  Trash2
} from 'lucide-react';
import { crmService } from '../../services/crmService';
import { Customer, CustomerInteraction, Contract, InteractionType, CustomerRelationship, CustomerStatus } from '../../types/crm';

interface Props {
  customer: Customer;
  tenantId?: string;
  onClose: () => void;
  onUpdate: () => void;
}

const PRESET_TAGS = ["重点跟进", "高净值", "待签约", "无意向", "第二次回访", "已面谈", "异地客户"];

const CustomerDetailView: React.FC<Props> = ({ customer: initialCustomer, tenantId, onClose, onUpdate }) => {
  const [customer, setFreshCustomer] = useState<Customer>(initialCustomer);
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [relationships, setRelationships] = useState<CustomerRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'contracts' | 'family'>('timeline');
  const [newLogText, setNewLogText] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  // Relationship adding state
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [relationSearchTerm, setRelationSearchTerm] = useState("");
  const [relationSearchResults, setRelationSearchResults] = useState<Customer[]>([]);
  const [selectedRelationCustomer, setSelectedRelationCustomer] = useState<Customer | null>(null);
  const [relationLabel, setRelationLabel] = useState("夫妻");
  const [isSearchingRelation, setIsSearchingRelation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  useEffect(() => {
    setFreshCustomer(initialCustomer);
  }, [initialCustomer]);

  const parseIdCard = (id: string | undefined) => {
    if (!id) return null;
    const len = id.length;
    if (len !== 15 && len !== 18) return null;
    
    let birthday = "";
    let gender = "";
    let age = 0;

    if (len === 18) {
      birthday = `${id.substring(6, 10)}-${id.substring(10, 12)}-${id.substring(12, 14)}`;
      gender = parseInt(id.substring(16, 17)) % 2 === 1 ? "男" : "女";
    } else if (len === 15) {
      birthday = `19${id.substring(6, 8)}-${id.substring(8, 10)}-${id.substring(10, 12)}`;
      gender = parseInt(id.substring(14, 15)) % 2 === 1 ? "男" : "女";
    }

    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return { birthday, gender, age };
  };

  const currentIdInfo = parseIdCard(isEditing ? (editForm.id_card || '') : (customer.id_card || ''));

  const handleSaveCustomer = async () => {
    if (!editForm.id) return;
    
    // Optimistic update for immediate feedback
    setFreshCustomer({ ...customer, ...editForm } as Customer);
    setIsEditing(false);

    try {
      await crmService.upsertCustomer({ ...customer, ...editForm, tenant_id: tenantId });
      await fetchData(); // Fetch fresh data from server
      onUpdate(); // Notify parent
    } catch (e) {
      console.error("Save failed", e);
      alert("保存失败");
      // Revert if needed, but for now we rely on next fetch or user refresh
      fetchData(); 
    }
  };

  useEffect(() => {
    fetchData();
  }, [initialCustomer.id]);

  useEffect(() => {
    if (isEditing) {
        setEditForm({ ...customer });
    }
  }, [isEditing]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [latestCustomer, intData, conData, relData] = await Promise.all([
        crmService.getCustomerById(initialCustomer.id),
        crmService.getInteractions(initialCustomer.id),
        crmService.getContracts(initialCustomer.id),
        crmService.getRelationships(initialCustomer.id)
      ]);
      if (latestCustomer) setFreshCustomer(latestCustomer);
      setInteractions(intData);
      setContracts(conData);
      setRelationships(relData);
    } catch (error) {
      console.error('Error fetching detail data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractDateFromText = (text: string): string | undefined => {
    const now = new Date();
    let targetDate: Date | null = null;

    // Regex for specific formats
    // 1. YYYY-MM-DD (HH:mm)? or YYYY.MM.DD
    const ymdRegex = /(\d{4})[-年/.](\d{1,2})[-月/.](\d{1,2})([日号])?(\s+(\d{1,2})[:点](\d{1,2})?)?/;
    // 2. MM-DD (HH:mm)? or MM.DD
    const mdRegex = /(\d{1,2})[-月/.](\d{1,2})([日号])?(\s+(\d{1,2})[:点](\d{1,2})?)?/;
    
    // Check YYYY-MM-DD
    const ymdMatch = text.match(ymdRegex);
    if (ymdMatch) {
      const h = ymdMatch[6] ? parseInt(ymdMatch[6]) : 9; // Default to 9am
      const m = ymdMatch[7] ? parseInt(ymdMatch[7]) : 0;
      targetDate = new Date(parseInt(ymdMatch[1]), parseInt(ymdMatch[2]) - 1, parseInt(ymdMatch[3]), h, m);
    } 
    // Check MM-DD
    else {
        const mdMatch = text.match(mdRegex);
        if (mdMatch) {
            const h = mdMatch[5] ? parseInt(mdMatch[5]) : 9;
            const m = mdMatch[6] ? parseInt(mdMatch[6]) : 0;
            const year = now.getFullYear();
            // If month is earlier than current month, assume next year? Or just current year. Let's assume current year unless explicitly passed.
            // Actually let's assume current year.
            targetDate = new Date(year, parseInt(mdMatch[1]) - 1, parseInt(mdMatch[2]), h, m);
            // If date is in past (more than a day ago?), maybe next year? But keeping it simple for now. 
            if (targetDate.getTime() < now.getTime() - 86400000) {
               targetDate.setFullYear(year + 1);
            }
        }
    }

    // Try common keywords if no explicit date
    if (!targetDate) {
        if (text.includes("明天")) {
            targetDate = new Date(now);
            targetDate.setDate(now.getDate() + 1);
            targetDate.setHours(9, 0, 0, 0); // Default 9am
        } else if (text.includes("后天")) {
            targetDate = new Date(now);
            targetDate.setDate(now.getDate() + 2);
            targetDate.setHours(9, 0, 0, 0);
        } else if (text.includes("下周")) {
            targetDate = new Date(now);
            targetDate.setDate(now.getDate() + 7);
            targetDate.setHours(9, 0, 0, 0);
        }
    }
    
    // Search for time in keywords
    if (targetDate) {
        // Look for "14点" or "下午3点"
        const timeRegex = /(下午|晚上)?(\d{1,2})[点:](\d{1,2})?/;
        const timeMatch = text.match(timeRegex);
        if (timeMatch) {
            let h = parseInt(timeMatch[2]);
            const m = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
            if (timeMatch[1] && h < 12) h += 12; // Add 12 for PM
            targetDate.setHours(h, m);
        }
        return targetDate.toISOString();
    }

    return undefined;
  };

  const handleAddLog = async (presetText?: string) => {
    const text = presetText || newLogText;
    if (!text.trim()) return;
    
    setIsSubmittingLog(true);
    try {
      const todo_date = extractDateFromText(text);
      await crmService.logInteraction(customer.id, 'communication', { text, todo_date }, tenantId);
      
      // If action is "Signing Contract", update customer status
      if (text.includes("签订合同") || text.includes("成交")) {
        await crmService.upsertCustomer({ id: customer.id, status: 'contract_client', tenant_id: tenantId });
      }

      onUpdate();
      
      setNewLogText("");
      await fetchData();
    } catch (error) {
      console.error('Failed to add log:', error);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleUpdateTags = async (tags: string[]) => {
    try {
      const updatedMetadata = { ...customer.metadata, tags };
      await crmService.updateCustomer(customer.id, { metadata: updatedMetadata });
      onUpdate();
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  const handleStatusChange = async (newStatus: CustomerStatus) => {
    try {
      await crmService.upsertCustomer({ id: customer.id, status: newStatus, tenant_id: tenantId });
      onUpdate();
    } catch (error) {
       console.error('Failed to update status:', error);
    }
  };

  const getInteractionIcon = (type: InteractionType) => {
    switch(type) {
      case 'browsing': return <Eye className="w-4 h-4 text-gray-400" />;
      case 'inquiry': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'communication': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'manual_log':
      case 'communication': return <Zap className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    // Basic validation
    if (file.size > 15 * 1024 * 1024) {
      alert("文件过大（超过15MB），请压缩后上传");
      e.target.value = '';
      return;
    }
    
    setIsUploading(true);
    try {
      await crmService.uploadContract(file, customer.id, file.name, tenantId);
      await fetchData(); // Refresh
      onUpdate();
      alert("上传成功");
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请检查网络或存储配置');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input to allow same file selection
    }
  };

  const handleDeleteContract = async (contractId: string, filePath: string) => {
    if (!confirm('确定要删除这件合同附件吗？')) return;
    
    try {
      await crmService.deleteContract(contractId, filePath);
      await fetchData(); // Refresh list
      onUpdate();
      alert('删除成功');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleSearchRelationCustomer = async (term: string) => {
    setRelationSearchTerm(term);
    if (term.length < 2) {
      setRelationSearchResults([]);
      return;
    }
    setIsSearchingRelation(true);
    try {
      // Simple client-side filtering for now, or use existing getCustomers if searchable
      // Assuming getCustomers is not efficient for search, but let's try to reuse or mock
      // Ideally we need a search API. For now, let's use the fetch logic or assume parent passed data?
      // Actually crmService has no search API yet. Let's add a quick one or just fetch all and filter (not ideal but works for MVP)
      // Wait, AdminDashboard has filtering logic. Let's implement a simple search in crmService later.
      // For now, let's just fetch recent customers.
      const allCustomers = await crmService.getCustomers(); // This might be heavy
      const filtered = allCustomers.filter(c => 
        c.id !== customer.id && // Exclude self
        (c.full_name?.includes(term) || c.phone?.includes(term))
      ).slice(0, 5);
      setRelationSearchResults(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingRelation(false);
    }
  };

  const handleAddRelationship = async () => {
    if (!selectedRelationCustomer) return;
    try {
      await crmService.addRelationship(
        customer.id, 
        selectedRelationCustomer.id, 
        'other', // Simplified type for now
        relationLabel, 
        tenantId
      );
      // Add reverse relationship automatically? Maybe later.
      // For now just refresh
      const relData = await crmService.getRelationships(customer.id);
      setRelationships(relData);
      setIsAddingRelation(false);
      setSelectedRelationCustomer(null);
      setRelationSearchTerm("");
    } catch (e) {
      alert('添加失败');
    }
  };

  return (
    <div className="flex bg-white text-slate-900 h-full relative border-l border-gray-100 animate-in slide-in-from-right-10 duration-300 w-full sm:w-auto">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Detail Header */}
        <div className="p-4 sm:p-8 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                   <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{customer.full_name || '未命名访客'}</h3>
                   {currentIdInfo && (
                     <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{currentIdInfo.gender}</span>
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">{currentIdInfo.age}岁</span>
                        <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] font-mono">{currentIdInfo.birthday}</span>
                     </div>
                   )}
                   <button 
                     onClick={() => {
                        if (isEditing) handleSaveCustomer();
                        else setIsEditing(true);
                     }}
                     className={`ml-2 p-1.5 rounded-lg transition-all ${isEditing ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                   >
                     {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                   </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold truncate">ID: {customer.id.slice(0, 8)}</p>
                  
                  {isEditing ? (
                    <select
                      value={editForm.status || customer.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value as CustomerStatus})}
                      className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold text-gray-600 outline-none"
                    >
                      <option value="visitor">访客</option>
                      <option value="lead">意向</option>
                      <option value="contract_client">已签约</option>
                    </select>
                  ) : (
                     <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        customer.status === 'visitor' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                        customer.status === 'lead' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        customer.status === 'contract_client' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-100 text-gray-600'
                     }`}>
                        {
                            customer.status === 'visitor' ? '网络访客' :
                            customer.status === 'lead' ? '意向客户' :
                            customer.status === 'contract_client' ? '合同客户' : customer.status
                        }
                     </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100 col-span-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">联系电话</span>
              {isEditing ? (
                <input 
                  value={editForm.phone || ''}
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none focus:border-black"
                />
              ) : (
                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">{customer.phone || '尚未绑定'}</span>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100 col-span-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">身份证号</span>
              {isEditing ? (
                <input 
                  value={editForm.id_card || ''}
                  onChange={e => setEditForm({...editForm, id_card: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none focus:border-black"
                />
              ) : (
                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">{customer.id_card || '未录入'}</span>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100 col-span-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">推荐人</span>
              {isEditing ? (
                <input 
                  value={editForm.referrer || ''}
                  onChange={e => setEditForm({...editForm, referrer: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none focus:border-black"
                />
              ) : (
                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">{customer.referrer || '无'}</span>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100 col-span-3">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">住宅地址</span>
              {isEditing ? (
                <textarea 
                  rows={2}
                  value={editForm.address || ''}
                  onChange={e => setEditForm({...editForm, address: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none focus:border-black resize-none"
                />
              ) : (
                <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-pre-wrap block">{customer.address || '未录入'}</span>
              )}
            </div>
          </div>

          <div className="mb-8">
             <div className="flex items-center justify-between mb-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分类标签 / Tags</span>
             </div>
             <div className="flex flex-wrap gap-2">
               {customer.metadata?.tags?.map((tag: string, idx: number) => (
                 <span key={idx} className="group relative px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-2">
                   {tag}
                   <button onClick={() => handleUpdateTags((customer.metadata.tags as string[]).filter(t => t !== tag))} className="opacity-0 group-hover:opacity-100 hover:text-amber-500 transition-all">
                     <X className="w-3 h-3" />
                   </button>
                 </span>
               ))}
               
               <div className="relative group/select">
                 <select 
                   onChange={(e) => {
                     const val = e.target.value;
                     if (val) {
                       const currentTags = (customer.metadata?.tags as string[]) || [];
                       if (!currentTags.includes(val)) {
                         handleUpdateTags([...currentTags, val]);
                       }
                       e.target.value = "";
                     }
                   }}
                   className="appearance-none px-3 py-1 pr-8 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-900 hover:border-slate-900 cursor-pointer outline-none transition-all"
                 >
                   <option value="">+ 选择标签</option>
                   {PRESET_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
                 <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none group-hover/select:text-slate-900" />
               </div>

               <div className="relative">
                 <input 
                   type="text"
                   placeholder="+ 自定义"
                   value={newTag}
                   onChange={e => setNewTag(e.target.value)}
                   onKeyPress={e => {
                     if (e.key === 'Enter' && newTag.trim()) {
                       const currentTags = (customer.metadata?.tags as string[]) || [];
                       if (!currentTags.includes(newTag.trim())) {
                         handleUpdateTags([...currentTags, newTag.trim()]);
                       }
                       setNewTag("");
                     }
                   }}
                   className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 focus:text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all w-20 focus:w-32"
                 />
               </div>
             </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex gap-6 sm:gap-8 border-b border-gray-100 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveSubTab('timeline')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${activeSubTab === 'timeline' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              轨迹时间轴
              {activeSubTab === 'timeline' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveSubTab('contracts')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${activeSubTab === 'contracts' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              保险合同 ({contracts.length})
              {activeSubTab === 'contracts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveSubTab('family')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${activeSubTab === 'family' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              家庭结构 ({relationships.length})
              {activeSubTab === 'family' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
            </button>
          </div>
        </div>

        {/* Detail Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 bg-gray-50/30">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl sm:rounded-2xl w-full"></div>)}
            </div>
          ) : activeSubTab === 'family' ? (
            <div className="space-y-6 animate-in fade-in zoom-in-50 duration-300">
              <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">家庭成员与社会关系</h4>
                    <p className="text-xs text-gray-500 mt-1">建立客户之间的关联以进行家庭保单规划</p>
                  </div>
                  {!isAddingRelation && (
                    <button onClick={() => setIsAddingRelation(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
                      + 添加关系
                    </button>
                  )}
                </div>

                {isAddingRelation && (
                  <div className="mb-6 bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95">
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">搜索关联客户</label>
                        {!selectedRelationCustomer ? (
                          <>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input 
                                type="text"
                                autoFocus
                                placeholder="输入姓名或手机号搜索..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                value={relationSearchTerm}
                                onChange={e => handleSearchRelationCustomer(e.target.value)}
                              />
                            </div>
                            {relationSearchResults.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                                {relationSearchResults.map(c => (
                                  <div 
                                    key={c.id}
                                    onClick={() => {
                                      setSelectedRelationCustomer(c);
                                      setRelationSearchResults([]);
                                    }}
                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                  >
                                    <div className="font-bold text-sm text-gray-900">{c.full_name}</div>
                                    <div className="text-xs text-gray-500">{c.phone}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                             <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                 {selectedRelationCustomer.full_name?.[0]}
                               </div>
                               <div>
                                 <div className="font-bold text-sm text-gray-900">{selectedRelationCustomer.full_name}</div>
                                 <div className="text-xs text-gray-500">{selectedRelationCustomer.phone}</div>
                               </div>
                             </div>
                             <button onClick={() => setSelectedRelationCustomer(null)} className="p-1 hover:bg-white rounded-full transition-all">
                               <X className="w-4 h-4 text-gray-400" />
                             </button>
                          </div>
                        )}
                      </div>

                      {selectedRelationCustomer && (
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">关系定义</label>
                          <div className="flex gap-2 flex-wrap">
                            {['夫妻', '父母', '子女', '兄弟姐妹', '同事', '朋友'].map(label => (
                              <button
                                key={label}
                                onClick={() => setRelationLabel(label)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${relationLabel === label ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={handleAddRelationship}
                          disabled={!selectedRelationCustomer}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none"
                        >
                          确认绑定
                        </button>
                        <button 
                          onClick={() => {
                            setIsAddingRelation(false);
                            setSelectedRelationCustomer(null);
                            setRelationSearchTerm("");
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-200"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {relationships.length > 0 ? relationships.map(rel => (
                    <div key={rel.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs ring-4 ring-indigo-50/50">
                          {rel.relationship_label[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                             {rel.related_customer?.full_name || '未知客户'}
                             <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-normal">{rel.relationship_label}</span>
                          </p>
                          <p className="text-xs text-gray-400 font-medium tracking-wide font-mono mt-0.5">
                            {rel.related_customer?.phone || '无联系方式'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm('确定解除此关系吗？')) {
                            crmService.deleteRelationship(rel.id).then(() => {
                               setRelationships(prev => prev.filter(r => r.id !== rel.id));
                            });
                          }
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-10 border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/20">
                      <Users className="w-8 h-8 text-indigo-200 mx-auto mb-3" />
                      <p className="text-xs font-bold text-indigo-300">暂无家庭关系记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeSubTab === 'timeline' ? (
            <div className="space-y-8">
              {/* Quick Log Action Panel */}
              <div className="bg-white border-2 border-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-900/5 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-widest">快速记事 / Action Log</span>
                </div>
                <textarea 
                  placeholder="记录本次跟进内容..."
                  value={newLogText}
                  onChange={e => setNewLogText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-slate-900 transition-all resize-none min-h-[100px]"
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {["第一次电话", "第二次回访", "见面沟通", "发送方案", "签订合同"].map(preset => (
                    <button 
                      key={preset}
                      onClick={() => handleAddLog(`[${preset}] ${newLogText}`)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                  <button 
                    disabled={isSubmittingLog || !newLogText.trim()}
                    onClick={() => handleAddLog()}
                    className="ml-auto px-8 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all"
                  >
                    {isSubmittingLog ? "保存中..." : "保存记录"}
                  </button>
                </div>
              </div>

              <div className="relative space-y-6 sm:space-y-8 before:absolute before:inset-0 before:left-3.5 sm:before:left-4 before:h-full before:w-0.5 before:bg-gray-100 before:z-0">
                {interactions.map(item => (
                  <div key={item.id} className="relative z-10 flex gap-4 sm:gap-6">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      {getInteractionIcon(item.type)}
                    </div>
                    <div className="flex-1 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-sm hover:border-gray-300 transition-all min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-2">
                        <span className="text-xs font-bold text-gray-900">
                          {item.type === 'browsing' ? '访问页面' : item.type === 'inquiry' ? '发起咨询' : item.type === 'manual_log' ? '人工跟进' : '系统联系'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {item.type === 'browsing' ? (
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            <span>浏览了：<span className="text-blue-500 font-medium">{item.content.page_title || item.content.path}</span></span>
                          </div>
                        ) : (
                          <p>{item.content.text || item.content.message || JSON.stringify(item.content)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Upload Card */}
              <div className="p-6 sm:p-8 border-2 border-dashed border-gray-200 rounded-[28px] sm:rounded-[32px] bg-white flex flex-col items-center justify-center hover:border-black transition-all group relative overflow-hidden text-center">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                />
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-all">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <Upload className="w-6 h-6" />}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{isUploading ? "正在上传..." : "上传保险合同"}</h4>
                <p className="text-xs text-gray-500">支持 PDF 或 照片格式，会自动进行 AI OCR 识别</p>
              </div>

              {/* Contract List */}
              <div className="grid grid-cols-1 gap-4">
                {contracts.map(contract => (
                  <div key={contract.id} className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-gray-300 shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-all">
                        <FileCheck className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{contract.file_path.split('/').pop()}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold uppercase ${contract.status === 'processed' ? 'text-green-500' : 'text-amber-500'}`}>
                            {contract.status === 'processed' ? 'AI 识别完成' : 'AI 识别中...'}
                          </span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400">{new Date(contract.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDeleteContract(contract.id, contract.file_path)}
                        className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="删除附件"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
