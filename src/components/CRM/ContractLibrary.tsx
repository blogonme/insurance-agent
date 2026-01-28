import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Upload, Search, Filter, Link, Eye, 
  Clock, CheckCircle, AlertCircle, User, ArrowRight, Camera
} from 'lucide-react';
import { crmService } from '../../services/crmService';
import { Contract, Customer } from '../../types/crm';

interface ContractLibraryProps {
  tenantId?: string;
}

const ContractLibrary: React.FC<ContractLibraryProps> = ({ tenantId }) => {
  const [contracts, setContracts] = useState<(Contract & { customers: { full_name: string } | null })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processed' | 'unbound'>('all');
  
  // Binding State
  const [bindingContract, setBindingContract] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, custData] = await Promise.all([
        crmService.getAllContracts(),
        crmService.getCustomers()
      ]);
      setContracts(cData);
      setCustomers(custData);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      await crmService.uploadContract(file, undefined, file.name, tenantId);
      await fetchData();
    } catch (err) {
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleLink = async (customerId: string) => {
    if (!bindingContract) return;
    setLinking(true);
    try {
      await crmService.linkContractToCustomer(bindingContract, customerId);
      setBindingContract(null);
      await fetchData();
    } catch (err) {
      alert('绑定失败，请重试');
    } finally {
      setLinking(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = (c.contract_name || c.file_path || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'unbound' ? !c.customer_id :
      c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 bg-gray-100 rounded-full mb-4"></div>
        <div className="h-4 w-48 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,application/pdf"
        onChange={handleUpload}
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        className="hidden" 
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
      />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-4 sm:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm">
        <div className="flex-grow w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="通过合同名称或 ID 搜索..." 
              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-black/5 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {[
            { id: 'all', label: '全部' },
            { id: 'unbound', label: '待绑定' },
            { id: 'pending', label: '识别中' },
            { id: 'processed', label: '已识别' }
          ].map(f => (
            <button 
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${statusFilter === f.id ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredContracts.map(contract => (
          <div key={contract.id} className="group bg-white p-5 sm:p-6 rounded-[28px] md:rounded-[32px] border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                contract.status === 'processed' ? 'bg-green-50 text-green-600' :
                contract.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
              }`}>
                {contract.status === 'processed' ? 'Success' : contract.status}
              </div>
            </div>

            <div className="mb-6 flex-grow">
              <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{contract.contract_name || '未命名合同'}</h4>
              <p className="text-xs text-gray-400 font-mono">{contract.id.slice(0, 8)}... {new Date(contract.created_at).toLocaleDateString()}</p>
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {contract.customers ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                    <User className="w-3 h-3 text-blue-500" />
                    <span className="text-[11px] font-bold text-blue-600">{contract.customers.full_name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-400">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[11px] font-bold">未绑定客户</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!contract.customer_id && (
                  <button 
                    onClick={() => setBindingContract(contract.id)}
                    className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                    title="绑定客户"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                )}
                <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Action Column */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-4">
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`flex-1 bg-white border-2 border-dashed border-gray-100 rounded-[28px] md:rounded-[32px] p-5 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-3 text-center group transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-200 hover:shadow-lg hover:shadow-black/5'}`}
          >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform shadow-sm">
                  {uploading ? <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Upload className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div>
                  <div className="font-bold text-gray-400 text-[13px] sm:text-sm">本地上传</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-300 mt-0.5 sm:mt-1 uppercase font-black">Support PDF / JPG</div>
              </div>
          </div>

          <div 
            onClick={() => !uploading && cameraInputRef.current?.click()}
            className={`flex-1 bg-black rounded-[28px] md:rounded-[32px] p-5 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-3 text-center group transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 hover:shadow-xl hover:shadow-black/10'}`}
          >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm">
                  {uploading ? <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Camera className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div>
                  <div className="font-bold text-white text-[13px] sm:text-sm">拍照扫描</div>
                  <div className="text-[9px] sm:text-[10px] text-white/40 mt-0.5 sm:mt-1 uppercase font-black">Secure Scan</div>
              </div>
          </div>
        </div>
      </div>

      {/* Binding Dialog */}
      {bindingContract && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBindingContract(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                  <Link className="w-5 h-5 text-gray-400" />
                  绑定存量客户
              </h3>
              <button onClick={() => setBindingContract(null)} className="p-2 hover:bg-gray-50 rounded-full">
                <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {customers.map(customer => (
                <button 
                  key={customer.id}
                  disabled={linking}
                  onClick={() => handleLink(customer.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-black hover:border-black hover:text-white group transition-all"
                >
                  <div className="text-left font-bold">{customer.full_name || '未知客户'}</div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractLibrary;
