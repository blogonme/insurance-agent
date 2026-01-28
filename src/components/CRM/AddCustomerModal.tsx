import React, { useState } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { CustomerStatus } from '../../types/crm';
import { crmService } from '../../services/crmService';

interface Props {
  isOpen: boolean;
  tenantId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCustomerModal: React.FC<Props> = ({ isOpen, tenantId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    id_card: '',
    address: '',
    referrer: '',
    status: 'lead' as CustomerStatus
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name && !form.phone) {
      setError('请至少填写姓名或电话。');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await crmService.upsertCustomer({ ...form, tenant_id: tenantId });
      onSuccess();
      onClose();
      setForm({ full_name: '', phone: '', status: 'lead', id_card: '', address: '', referrer: '' });
    } catch (err: any) {
      setError(err.message || '添加失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[28px] md:rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-5 sm:p-8">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-gray-400" />
                手动录入客户
              </h3>
              <p className="text-sm text-gray-500 mt-1">手动添加线下或外部渠道获取的客户资料</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">客户姓名</label>
                <input 
                  type="text" 
                  placeholder="请输入姓名..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none"
                  value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">联系电话</label>
                  <input 
                    type="tel" 
                    placeholder="138..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">身份证号</label>
                   <input 
                     type="text" 
                     placeholder="请输入身份证号码..." 
                     className="w-full bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm"
                     value={form.id_card}
                     onChange={e => setForm({...form, id_card: e.target.value})}
                   />
                </div>
              </div>

              {/* 扩展信息 */}
              <div className="space-y-4 pt-2 border-t border-gray-50">
                <div>
                   <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">住宅地址</label>
                   <textarea 
                     rows={2}
                     placeholder="请输入详细地址（支持换行）..." 
                     className="w-full bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm resize-none"
                     value={form.address}
                     onChange={e => setForm({...form, address: e.target.value})}
                   />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">推荐人</label>
                  <input 
                    type="text" 
                    placeholder="选填" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm"
                    value={form.referrer}
                    onChange={e => setForm({...form, referrer: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">初始阶段</label>
                <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setForm({...form, status: 'visitor'})}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${form.status === 'visitor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    网络访客
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForm({...form, status: 'lead'})}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${form.status === 'lead' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    意向客户
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForm({...form, status: 'contract_client'})}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${form.status === 'contract_client' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    正式客户
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-4 sm:py-5 rounded-2xl sm:rounded-[24px] font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save className="w-5 h-5" /> 保存并录入</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
