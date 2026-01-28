import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  FileText, 
  MessageSquare, 
  Eye,
  MoreVertical,
  ArrowUpRight,
  ListTodo,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { crmService } from '../../services/crmService';
import { Customer, CustomerStatus } from '../../types/crm';
import CustomerDetailView from './CustomerDetailView';
import AddCustomerModal from './AddCustomerModal';

interface CRMDashboardProps {
  tenantId?: string;
}

const CRMDashboard: React.FC<CRMDashboardProps> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState<CustomerStatus | 'all'>('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [todos, setTodos] = useState<any[]>([]);

  // 基础数据加载
  useEffect(() => {
    fetchCustomers();
  }, [activeTab, tenantId]);

  // 待办事项加载 (独立于选项卡)
  useEffect(() => {
    fetchTodos();
  }, [tenantId]);

  const fetchTodos = async () => {
    try {
      const logs = await crmService.getRecentInteractions(undefined, 100, tenantId);
      const extractedTodos = logs.filter((log: any) => {
        let content = log.content;
        if (typeof content === 'string') {
          try { content = JSON.parse(content); } catch (e) { return false; }
        }
        
        // Prioritize explicit todo_date
        if (content?.todo_date) return true;

        const text = content?.text || content?.notes || content?.subject || "";
        return /待办|需要|提醒|发送|电话|联系|面谈|下周|明天|跟进|访客|签约|回复|准备|\d{1,2}月\d{1,2}日/.test(text.toString());
      }).map((log: any) => {
        let content = log.content;
        if (typeof content === 'string') {
          try { content = JSON.parse(content); } catch (e) {}
        }
        return {
          id: log.id,
          customer: log.customers,
          text: content?.text || content?.notes || content?.subject || "互动记录",
          date: content?.todo_date || log.created_at,
          customerId: log.customer_id
        };
      }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setTodos(extractedTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await crmService.getCustomers(activeTab === 'all' ? undefined : activeTab);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.phone?.includes(searchTerm) ||
     c.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: CustomerStatus) => {
    switch(status) {
      case 'visitor': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'lead': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'contract_client': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: CustomerStatus) => {
    switch(status) {
      case 'visitor': return '网络访客';
      case 'lead': return '意向客户';
      case 'contract_client': return '合同客户';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative">

      {/* Todo Panel */}
      {todos.length > 0 && (
        <div className="px-4 sm:px-8 py-4 bg-amber-50/50 border-b border-amber-100/50 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-900">活跃待办事项 / Action Items</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {todos.map(todo => (
              <div 
                key={todo.id}
                onClick={() => {
                  const cust = customers.find(c => c.id === todo.customerId);
                  if (cust) setSelectedCustomer(cust);
                }}
                className="flex-shrink-0 w-64 p-4 bg-white border border-amber-200 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-md">待跟进</span>
                  <span className="text-[9px] text-gray-400 font-medium">{new Date(todo.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-amber-600 transition-colors">
                  {todo.text}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500">{todo.customer?.full_name || "未知客户"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-50/50 flex flex-row flex-wrap items-center gap-3">
        <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar shrink-0">
          <button 
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            全部
          </button>
          <button 
            onClick={() => setActiveTab('visitor')}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'visitor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            访客
          </button>
          <button 
            onClick={() => setActiveTab('lead')}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'lead' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            意向
          </button>
          <button 
            onClick={() => setActiveTab('contract_client')}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'contract_client' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            已签约
          </button>
        </div>

        <div className="relative flex-1 min-w-[140px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
          <input 
            type="text" 
            placeholder="搜索..." 
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 border border-gray-200 rounded-xl hover:bg-white text-gray-500 hover:text-gray-900 transition-all active:scale-95 bg-white">
            <Filter className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">添加</span>
            <span className="inline sm:hidden">加</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-8 py-4 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full mb-4"></div>
            <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-100 rounded-full"></div>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className={`group relative flex flex-col p-5 sm:p-6 bg-white border rounded-2xl cursor-pointer hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 ${selectedCustomer?.id === customer.id ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {customer.full_name || '未命名访客'}
                    </h3>
                    <div className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(customer.status)}`}>
                      {getStatusLabel(customer.status)}
                    </div>
                    <span className="text-xs text-gray-400 truncate">
                      {customer.phone || customer.email || `ID:${customer.id.slice(0,4)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </span>
                    <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-200" />
            </div>
            <h4 className="text-base font-semibold text-gray-900">暂无符合条件的客户</h4>
            <p className="text-sm text-gray-500 mt-1">系统将自动记录每一位在您网站浏览或咨询的潜在客户。</p>
          </div>
        )}
      </div>

      {/* Side Detail View - Moved to root level for proper isolation */}
      {selectedCustomer && (
        <div className="absolute inset-0 top-0 left-0 right-0 bottom-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedCustomer(null)}></div>
          <div className="relative w-full max-w-xl h-full shadow-2xl">
            <CustomerDetailView 
              customer={selectedCustomer} 
              tenantId={tenantId}
              onClose={() => setSelectedCustomer(null)} 
              onUpdate={() => { fetchCustomers(); fetchTodos(); }}
            />
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        tenantId={tenantId}
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchCustomers} 
      />
    </div>
  );
};

export default CRMDashboard;
