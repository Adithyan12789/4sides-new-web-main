/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Crown,
  Zap,
  Star,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  Download,
  Tv,
  Film,
  Clock
} from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { useAppSelector } from '@/hooks/useRedux';
import { toast } from 'sonner';

interface PlanLimitation {
  id: number;
  limitation_name: string;
  limitation_slug: string;
  limit: string | { value: string } | any; // Can be string, object with value, or other types
  limitation_title?: string;
  limitation_value?: boolean;
  message?: string; // Message from backend
  slug?: string;
}

interface Plan {
  plan_id: number;
  name: string;
  identifier: string;
  price: number;
  discount: number;
  discount_percentage: number;
  total_price: number;
  level: number;
  duration: number;
  duration_value: string;
  description: string;
  plan_type: PlanLimitation[];
  status: number;
}

const PLAN_ICONS: Record<string, any> = {
  basic: Film,
  standard: Tv,
  premium: Crown,
  ultimate: Sparkles,
};

const PLAN_COLORS: Record<string, string> = {
  basic: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  standard: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  premium: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  ultimate: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
};

const PLAN_BUTTON_COLORS: Record<string, string> = {
  basic: 'bg-blue-500 hover:bg-blue-600 text-white',
  standard: 'bg-purple-500 hover:bg-purple-600 text-white',
  premium: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black',
  ultimate: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white',
};

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);


  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([
        fetchPlans(),
        checkSubscriptionStatus(),
        fetchUserSubscription()
      ]);
      setLoading(false);
    };
    initPage();
  }, [isAuthenticated]);

  const fetchUserSubscription = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await subscriptionService.checkUserSubscription();
      if (response.hasActiveSubscription) {
        setActiveSubscription(response.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch user subscription:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await subscriptionService.getPlanList();
      if (response.status && response.data) {
        // Sort plans by total_price (lowest to highest)
        const sortedPlans = response.data.sort((a, b) => a.total_price - b.total_price);
        setPlans(sortedPlans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load subscription plans');
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const response = await subscriptionService.getSubscriptionStatus();
      if (response) {
        setIsSubscriptionEnabled(response.is_subscription_enabled);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan.plan_id);
    navigate(`/checkout?planId=${plan.plan_id}`);
  };


  const getPlanIcon = (identifier: string) => {
    const Icon = PLAN_ICONS[identifier.toLowerCase()] || Star;
    return Icon;
  };

  const getPlanColor = (identifier: string) => {
    return PLAN_COLORS[identifier.toLowerCase()] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  const getPlanButtonColor = (identifier: string) => {
    return PLAN_BUTTON_COLORS[identifier.toLowerCase()] || 'bg-gray-500 hover:bg-gray-600 text-white';
  };

  const getLimitationIcon = (slug: string) => {
    switch (slug) {
      case 'device-limit':
        return Tv;
      case 'download-limit':
      case 'download-status':
        return Download;
      case 'user-limit':
      case 'profile-limit':
        return Users;
      case 'quality':
        return Zap;
      default:
        return Check;
    }
  };

  const getLimitValue = (limit: any): string => {
    // Handle different limit value types
    if (typeof limit === 'string') {
      return limit;
    } else if (typeof limit === 'number') {
      return String(limit);
    } else if (typeof limit === 'object' && limit !== null) {
      // If it's an object with 'value' property
      if ('value' in limit) {
        return String(limit.value);
      }
      
      // If it's an object with device types (tablet, laptop, mobile, tv)
      const deviceKeys = ['tablet', 'laptop', 'mobile', 'tv'];
      const hasDeviceKeys = deviceKeys.some(key => key in limit);
      
      if (hasDeviceKeys) {
        // Count total devices or list enabled devices
        const enabledDevices = deviceKeys.filter(key => limit[key] === '1' || limit[key] === 1 || limit[key] === true);
        
        if (enabledDevices.length === deviceKeys.length) {
          return 'All Devices';
        } else if (enabledDevices.length > 0) {
          // Capitalize first letter of each device
          const deviceNames = enabledDevices.map(d => d.charAt(0).toUpperCase() + d.slice(1));
          return deviceNames.join(', ');
        } else {
          return 'No Devices';
        }
      }
      
      // If it's an array, join it
      if (Array.isArray(limit)) {
        return limit.join(', ');
      }
      
      // For other objects, try to extract meaningful info
      const keys = Object.keys(limit);
      if (keys.length > 0) {
        // If all values are the same, just show the count
        const values = Object.values(limit);
        const allSame = values.every(v => v === values[0]);
        if (allSame && values[0]) {
          return `${keys.length} ${keys.length === 1 ? 'item' : 'items'}`;
        }
      }
      
      // Last resort: stringify
      return JSON.stringify(limit);
    }
    return '';
  };

  const isUnlimitedValue = (limitValue: string): boolean => {
    return limitValue === '-1' || 
           limitValue === 'unlimited' || 
           limitValue.toLowerCase() === 'unlimited';
  };

  if (!isSubscriptionEnabled && plans.length === 0) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Subscriptions Not Available</h2>
          <p className="text-white/60">Subscription feature is currently disabled.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F5C518] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 animate-pulse">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#F5C518]" />
            <span className="text-[#F5C518] text-sm font-bold uppercase tracking-wider">Premium Access</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
            Choose Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F5C518] to-yellow-300">
              Perfect Plan
            </span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Unlock unlimited entertainment with our flexible subscription plans. 
            Watch anywhere, anytime, on any device.
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(plan.identifier);
            const isFirstPlan = index === 0;
            const isSecondPlan = index === 1;
            const isLastPlan = index === plans.length - 1;
            const isCurrentPlan = Number(activeSubscription?.plan_id) === Number(plan.plan_id);
            
            return (
              <div
                key={plan.plan_id}
                className={`relative group animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-4 py-1 rounded-full shadow-lg bg-green-500 border border-green-400">
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        ✓ Current Plan
                      </span>
                    </div>
                  </div>
                )}
                
                {(isFirstPlan || isSecondPlan || isLastPlan) && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className={`px-4 py-1 rounded-full shadow-lg ${
                      isLastPlan 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                        : isSecondPlan
                        ? 'bg-gradient-to-r from-[#F5C518] to-yellow-300'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        isLastPlan || isSecondPlan ? 'text-black' : 'text-white'
                      }`}>
                        {isLastPlan ? '👑 Best Value' : isSecondPlan ? '🔥 Popular' : '⭐ Premium'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Plan Card */}
                <div
                  className={`relative h-full rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 ${
                    isCurrentPlan ? 'ring-4 ring-red-600 ring-offset-4 ring-offset-black' : selectedPlan === plan.plan_id ? 'ring-4 ring-white/30 ring-offset-4 ring-offset-black' : ''
                  }`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${isCurrentPlan ? 'from-red-600/20 to-red-900/40' : getPlanColor(plan.identifier)} opacity-50`} />
                  
                  {/* Animated Border Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#F5C518]/20 via-transparent to-[#F5C518]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content Container */}
                  <div className="relative h-full p-8 backdrop-blur-xl bg-black/40 border-2 border-white/10 rounded-3xl">
                    {/* Header Section */}
                    <div className="mb-8">
                      {/* Icon with Glow Effect */}
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-[#F5C518]/20 blur-2xl rounded-full" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F5C518]/20 to-[#F5C518]/5 backdrop-blur-md flex items-center justify-center border border-[#F5C518]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <Icon className="w-10 h-10 text-[#F5C518]" />
                        </div>
                      </div>

                      {/* Plan Name & Duration */}
                      <div>
                        <h3 className="text-3xl font-black text-white mb-3 capitalize tracking-tight">
                          {plan.name}
                        </h3>
                        <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          <span>{plan.duration} {plan.duration_value}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="mb-8 pb-8 border-b border-white/10">
                      {plan.discount > 0 && (
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-white/40 line-through text-xl font-bold">
                            ₹{plan.price}
                          </span>
                          <div className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-full">
                            <span className="text-red-400 text-sm font-black">
                              SAVE {plan.discount_percentage}%
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                          ₹{plan.total_price}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-white/70 text-sm leading-relaxed mb-8 line-clamp-3">
                        {plan.description}
                      </p>
                    )}

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#F5C518]" />
                        What's Included
                      </h4>
                      {plan.plan_type.map((limitation) => {
                        const LimitIcon = getLimitationIcon(limitation.slug || limitation.limitation_slug);
                        const limitValue = getLimitValue(limitation.limit);
                        const isUnlimited = isUnlimitedValue(limitValue);
                        const displayMessage = limitation.message || limitation.limitation_title || limitation.limitation_name;
                        
                        return (
                          <div key={limitation.id} className="flex items-start gap-3 group/item">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C518]/10 to-[#F5C518]/5 flex items-center justify-center flex-shrink-0 border border-[#F5C518]/20 group-hover/item:scale-110 group-hover/item:border-[#F5C518]/40 transition-all duration-300">
                              <LimitIcon className="w-5 h-5 text-[#F5C518]" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <p className="text-white text-sm font-bold mb-1 leading-relaxed">
                                {displayMessage}
                              </p>
                              {!limitation.message && limitValue && (
                                <p className={`text-xs font-medium ${isUnlimited ? 'text-[#F5C518]' : 'text-white/50'}`}>
                                  {isUnlimited ? '∞ Unlimited' : `Up to ${limitValue}`}
                                </p>
                              )}
                            </div>
                            {(isUnlimited || limitation.limitation_value) && (
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 rounded-full bg-[#F5C518]/20 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-[#F5C518]" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={selectedPlan === plan.plan_id}
                      className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group/btn ${
                        isCurrentPlan 
                        ? 'bg-red-600 text-white border border-red-500/50 shadow-red-500/20' 
                        : getPlanButtonColor(plan.identifier)
                      } ${(selectedPlan === plan.plan_id && !isCurrentPlan) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {/* Button Shine Effect */}
                      {!isCurrentPlan && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      )}
                      
                      <span className="relative z-10">
                        {isCurrentPlan ? 'Renew Plan' : selectedPlan === plan.plan_id ? 'Processing...' : 'Choose Plan'}
                      </span>
                      {!isCurrentPlan && <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
                      {isCurrentPlan && <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4">
            Why Choose 4Sides Play?
          </h2>
          <p className="text-white/60 text-lg">
            Premium features included in all plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: 'Secure Payments',
              description: 'Safe and encrypted transactions',
            },
            {
              icon: Users,
              title: '24/7 Support',
              description: 'Customer service always available',
            },
            {
              icon: Tv,
              title: 'Multi-Device',
              description: 'Watch on all your devices',
            },
            {
              icon: Zap,
              title: 'HD Quality',
              description: 'Crystal clear streaming',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F5C518]/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#F5C518]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
