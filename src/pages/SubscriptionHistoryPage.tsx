import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { subscriptionService } from '@/services/subscriptionService';
import { authService } from '@/services/authService';

interface SubscriptionHistoryItem {
  id: number;
  name: string; // From backend JSON
  plan_name?: string; // Fallback
  plan_id?: number;
  amount: number;
  discount_percentage?: number;
  discount_amount?: number;
  coupon_discount?: number;
  tax_amount?: number;
  total_amount?: number;
  type: string; // From backend JSON (e.g., 'month')
  duration?: number;
  duration_value?: string;
  level?: number;
  identifier?: string;
  plan_type?: string; // JSON string from backend
  start_date: string;
  end_date: string;
  status: string;
  payment_method?: string;
  payment_id?: number;
  transaction_id?: string;
  device_id?: string;
  created_at?: string;
  invoice_url?: string;
}

export default function SubscriptionHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authService.isAuthenticated()) {
        navigate('/auth');
        return;
      }

      const response = await subscriptionService.getSubscriptionHistory() as any;
      
      const isSuccess = response.success || response.status || response.success === true || response.status === true;
      const historyData = response.data || (Array.isArray(response) ? response : []);
      
      if (isSuccess && Array.isArray(historyData)) {
        setHistory(historyData);
      } else if (Array.isArray(response)) {
        setHistory(response);
      } else {
        setHistory([]);
      }
    } catch (err: any) {
      console.error('Error fetching subscription history:', err);
      setError(err.response?.data?.message || 'Failed to load subscription history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (statusLower === 'expired' || statusLower === 'cancelled') return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return <CheckCircle className="w-4 h-4" />;
    if (statusLower === 'expired' || statusLower === 'cancelled') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 animate-pulse">Loading Subscription History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-20">
      {/* Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAB308]/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#EAB308]" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Subscription History
              </h1>
              <p className="text-white/50 text-lg mt-1">
                {history.length} {history.length === 1 ? 'subscription' : 'subscriptions'} found
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="glass rounded-2xl p-8 border border-red-500/20 mb-8">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && history.length === 0 && !error && (
          <div className="glass rounded-3xl p-16 text-center border border-white/5 animate-slide-up">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Subscription History</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              You haven't subscribed to any plans yet. Choose a plan to get started.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="px-8 py-4 bg-[#EAB308] text-black font-bold rounded-xl hover:bg-[#FACC15] transition-all duration-300 hover:scale-105"
            >
              View Plans
            </button>
          </div>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            {history.map((item, index) => (
              <div
                key={item.id}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-[#EAB308]/30 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-black text-white">{item.name || item.plan_name}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{item.status}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-white/50 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#EAB308]" />
                            <span>Duration: {item.duration || 0} {item.type || item.duration_value || 'Days'}</span>
                          </div>
                          {item.device_id && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-white/30">Device:</span>
                              <span className="text-white/60 font-mono text-xs">{item.device_id}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.invoice_url && (
                          <a
                            href={item.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#EAB308]/10 border border-white/10 hover:border-[#EAB308]/30 rounded-xl text-white/70 hover:text-[#EAB308] transition-all duration-300 group"
                          >
                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-bold">Invoice</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                      {/* Dates */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EAB308]/10 flex items-center justify-center border border-[#EAB308]/20">
                            <Calendar className="w-5 h-5 text-[#EAB308]" />
                          </div>
                          <div>
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Purchase Date</p>
                            <p className="text-white text-sm font-bold">{formatDate(item.start_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Calendar className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Expiry Date</p>
                            <p className="text-white text-sm font-bold">{formatDate(item.end_date)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Payment Method</p>
                            <p className="text-white text-sm font-bold capitalize">{item.payment_method || (item.payment_id ? `ID: ${item.payment_id}` : 'N/A')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Transaction ID</p>
                            <p className="text-white text-sm font-mono truncate">{item.transaction_id || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Summary 1 */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between sm:block">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Base Amount</p>
                          <p className="text-white font-bold text-lg">₹{item.amount}</p>
                        </div>
                        <div className="flex items-center justify-between sm:block">
                          <div className="flex items-center gap-2">
                             <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Discount</p>
                             {item.discount_percentage ? (
                               <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-1 rounded">{item.discount_percentage}% OFF</span>
                             ) : null}
                          </div>
                          <p className="text-green-400 font-bold text-lg">- ₹{item.discount_amount || item.coupon_discount || 0}</p>
                        </div>
                      </div>

                      {/* Summary 2 */}
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Tax</p>
                          <p className="text-white font-bold text-sm">₹{item.tax_amount || 0}</p>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-[#EAB308] text-[10px] uppercase font-bold tracking-wider mb-1">Total Paid</p>
                          <p className="text-[#EAB308] font-black text-2xl">₹{item.total_amount || item.amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
