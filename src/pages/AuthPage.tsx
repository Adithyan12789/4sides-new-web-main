/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Phone,
    ArrowRight,
    Chrome,
    ShieldCheck,
    CheckCircle2,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { sendOtp, verifyOtp, socialLogin, clearError } from '@/store/slices/authSlice';
import { toast } from 'sonner';

const AuthPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [timer, setTimer] = useState(0);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        try {
            await dispatch(sendOtp(phoneNumber)).unwrap();
            toast.success('OTP sent successfully');
            setStep('otp');
            setTimer(60);
        } catch (err: any) {
            // Error handled by useEffect
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            toast.error('Please enter the 4-digit OTP');
            return;
        }

        try {
            const result = await dispatch(verifyOtp({ phone: phoneNumber, otp })).unwrap();
            console.log('OTP Verification Result:', result);
            
            // Verify token is in localStorage
            const token = localStorage.getItem('authToken');
            const user = localStorage.getItem('user');
            console.log('Token in localStorage:', token);
            console.log('User in localStorage:', user);
            
            if (token && user) {
                toast.success('Logged in successfully');
                // Small delay to ensure Redux state is updated
                setTimeout(() => {
                    navigate('/', { replace: true });
                    // Force reload to ensure state is fresh
                    window.location.reload();
                }, 100);
            } else {
                toast.error('Authentication failed. Please try again.');
            }
        } catch (err: any) {
            console.error('OTP Verification Error:', err);
            toast.error(err || 'OTP verification failed');
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        try {
            toast.info(`Connecting to ${provider}...`);
            // In a real app, you would use a library like @react-oauth/google 
            // to get a real token and user data. For now, we'll send dummy data 
            // to demonstrate the API connection.
            const resultAction = await dispatch(socialLogin({ 
                provider, 
                access_token: 'dummy-token',
                email: 'test@example.com', // Required by backend
                first_name: 'Test', // Required by backend
                last_name: 'User', // Optional
                name: 'Test User' // Optional
            })).unwrap();
            if (resultAction) {
                toast.success(`Logged in with ${provider} successfully`);
                navigate('/');
            }
        } catch (err: any) {
            toast.error(err || `${provider} login failed`);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
            {/* Background with advanced effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#EAB308]/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D97706]/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-lg px-4 py-8">
                <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
                    {/* Subtle light streak */}
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/5 via-transparent to-transparent rotate-12 pointer-events-none transition-transform duration-1000 group-hover:translate-x-4 group-hover:translate-y-4" />

                    {/* Header */}
                    <div className="text-center mb-10 relative">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#EAB308] to-[#FACC15] mb-8 shadow-xl shadow-[#EAB308]/20 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck className="w-10 h-10 text-black" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                            {step === 'phone' ? '4Sides Play' : 'Verification'}
                        </h1>
                        <p className="text-white/50 font-medium">
                            {step === 'phone'
                                ? 'Experience 4Sides Play with your mobile number'
                                : `We've sent a 4-digit code to ${phoneNumber}`
                            }
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="relative overflow-hidden">
                        {step === 'phone' ? (
                            <form onSubmit={handleSendOtp} className="space-y-6 animate-in slide-in-from-right duration-500">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/70 ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3">
                                            <Phone className="w-5 h-5 text-[#EAB308]" />
                                            <span className="text-white font-medium text-sm">+91</span>
                                        </div>
                                        <Input
                                            type="tel"
                                            placeholder="Enter mobile number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="pl-[5.5rem] bg-white/5 border-white/10 h-14 rounded-2xl focus:border-[#EAB308]/50 focus:ring-[#EAB308]/20 transition-all text-white text-lg placeholder:text-white/20"
                                        />
                                    </div>
                                </div>

                                <Button
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#EAB308] to-[#FACC15] hover:from-[#FACC15] hover:to-[#EAB308] text-black font-bold text-lg shadow-xl shadow-[#EAB308]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Send OTP
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-left duration-500">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-sm font-semibold text-white/70">Enter OTP</label>
                                        <button
                                            type="button"
                                            onClick={() => setStep('phone')}
                                            className="text-xs font-bold text-[#EAB308] flex items-center gap-1 hover:underline"
                                        >
                                            <ChevronLeft className="w-3 h-3" /> Change Number
                                        </button>
                                    </div>
                                    <div className="relative group flex justify-center gap-4">
                                        <Input
                                            type="text"
                                            maxLength={4}
                                            placeholder="0000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-[#EAB308]/50 focus:ring-[#EAB308]/20 transition-all text-white text-3xl font-bold text-center tracking-[1rem] pl-[1.5rem] placeholder:text-white/10"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <Button
                                        disabled={isLoading}
                                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#EAB308] to-[#FACC15] hover:from-[#FACC15] hover:to-[#EAB308] text-black font-bold text-lg shadow-xl shadow-[#EAB308]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                Verify & Login
                                                <CheckCircle2 className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        disabled={timer > 0 || isLoading}
                                        onClick={handleSendOtp}
                                        className="text-sm font-medium text-white/50 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Social Logins */}
                    <div className="mt-10 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                <span className="bg-[#1A1A1A] px-4 text-white/30">Or join with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-white font-bold group/social relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-red-500/10 opacity-0 group-hover/social:opacity-100 transition-opacity" />
                                <Chrome className="w-6 h-6 mr-3 text-white group-hover/social:scale-110 transition-transform" />
                                Continue with Google
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-white/30 text-xs font-medium leading-relaxed">
                            By continuing, you agree to our <br />
                            <span className="text-[#EAB308]/70 hover:text-[#EAB308] cursor-pointer">Terms of Service</span> & <span className="text-[#EAB308]/70 hover:text-[#EAB308] cursor-pointer">Privacy Policy</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
