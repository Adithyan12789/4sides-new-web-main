import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { subscriptionService } from '@/services/subscriptionService';
import { useAppSelector } from '@/hooks/useRedux';
import { toast } from 'sonner';
import { BASE_URLS } from '@/config/api.config';

interface Plan {
  plan_id: number;
  name: string;
  identifier: string;
  price: number;
  discount: number;
  discount_percentage: number;
  total_price: number;
  duration: number;
  duration_value: string;
  description: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract planId from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planId = params.get('planId');
    if (planId) {
      setSelectedPlanId(parseInt(planId));
    }
  }, [location.search]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchPlansData = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getPlanList();
        if (response.status && response.data) {
          const sortedPlans = [...response.data].sort((a, b) => a.total_price - b.total_price);
          setPlans(sortedPlans);
          // If no planId in URL, select the first one (cheapest after sort)
          if (!selectedPlanId && sortedPlans.length > 0) {
            setSelectedPlanId(sortedPlans[0].plan_id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlansData();
  }, [selectedPlanId]);

  const selectedPlan = plans.find(p => p.plan_id === selectedPlanId);

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/auth');
      return;
    }

    if (!selectedPlan) return;

    try {
      setIsProcessing(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      toast.loading('Creating order...', { id: 'payment-loading' });
      
      const orderResponse = await subscriptionService.createRazorpayOrder({
        amount: selectedPlan.total_price,
        currency: 'INR',
        mobile: user.mobile || user.phone || '',
        email: user.email || '',
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
      });

      toast.dismiss('payment-loading');

      if (!orderResponse || !orderResponse.id) {
        toast.error('Failed to create payment order');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: BASE_URLS.RAZORPAY_KEY,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: '4Sides Play',
        description: `${selectedPlan.name} - ${selectedPlan.duration} ${selectedPlan.duration_value}`,
        order_id: orderResponse.id,
        prefill: {
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email || '',
          contact: user.mobile || user.phone || ''
        },
        theme: {
          color: '#EAB308'
        },
        handler: async function (response: any) {
          try {
            toast.loading('Activating subscription...', { id: 'subscription-loading' });
            
            await subscriptionService.saveSubscription({
              plan_id: selectedPlan.plan_id,
              payment_method: 'razorpay',
              payment_type: 'razorpay',
              payment_status: 'paid',
              transaction_id: response.razorpay_payment_id,
              device_id: 1
            });

            toast.dismiss('subscription-loading');
            toast.success('Subscription activated successfully! 🎉');
            
            setTimeout(() => {
              navigate('/subscription-history');
            }, 2000);
          } catch (error) {
            toast.dismiss('subscription-loading');
            toast.error('Failed to activate subscription');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      if (!window.Razorpay || !razorpayLoaded) {
        toast.error('Payment system is loading...');
        setIsProcessing(false);
        return;
      }

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
        {/* Header */}
        <button 
          onClick={() => navigate('/subscription')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-wider text-sm">Back to subscription plan</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Plan Selection */}
          <div className="flex-1 space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.plan_id}
                onClick={() => setSelectedPlanId(plan.plan_id)}
                className={`relative group cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden ${
                  selectedPlanId === plan.plan_id 
                    ? 'ring-2 ring-[#EAB308] bg-[#EAB308]/5' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlanId === plan.plan_id ? 'border-[#EAB308] bg-[#EAB308]' : 'border-white/20'
                    }`}>
                      {selectedPlanId === plan.plan_id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-lg shadow-white/50" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{plan.name}</h3>
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <span className="text-2xl font-black text-white">₹{plan.total_price.toFixed(2)}</span>
                        <span>/ {plan.duration} {plan.duration_value}</span>
                      </div>
                    </div>
                  </div>
                  
                  {plan.discount > 0 && (
                    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                      <span className="text-green-400 text-xs font-black">SAVE {plan.discount_percentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Payment Details */}
          <div className="w-full lg:w-[450px]">
            <div className="glass rounded-3xl p-8 border border-white/10 sticky top-28">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#EAB308]" />
                Checkout Summary
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-4">Selected Plan</p>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <p className="text-white font-black uppercase text-sm mb-0.5">{selectedPlan?.name}</p>
                      <p className="text-white/40 text-xs">{selectedPlan?.duration} {selectedPlan?.duration_value}</p>
                    </div>
                    <p className="text-white font-black">₹{selectedPlan?.total_price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Payment Details</p>
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-white/50">Amount</span>
                    <span className="text-white font-bold">₹{selectedPlan?.price.toFixed(2)}</span>
                  </div>
                  {selectedPlan?.discount && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-green-400/70">Total Discount</span>
                      <span className="text-green-400 font-bold">- ₹{selectedPlan.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-white/50">Tax (0%)</span>
                    <span className="text-white font-bold">₹0.00</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-white font-black uppercase text-lg">Total Amount</span>
                    <span className="text-3xl font-black text-[#EAB308] tracking-tight">₹{selectedPlan?.total_price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-white/40 text-xs">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Payments are secured and encrypted
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedPlanId}
                  className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-[#EAB308]/20 group ${
                    isProcessing ? 'bg-white/10 cursor-not-allowed' : 'bg-[#EAB308] hover:bg-[#FACC15] hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Proceed Payment</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
