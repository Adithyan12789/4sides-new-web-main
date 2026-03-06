import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { forgotPassword } from '@/store/slices/authSlice';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector((state) => state.auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        const result = await dispatch(forgotPassword({ email }));

        if (forgotPassword.fulfilled.match(result)) {
            setIsSuccess(true);
            toast.success('Password reset link sent to your email!');
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{ backgroundImage: "url('/assets/auth-bg.png')" }}
            />
            <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-[2px]" />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/80" />

            {/* Card */}
            <div className="relative z-20 w-full max-w-md px-2 animate-in fade-in duration-700">
                <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Login
                    </button>

                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAB308] mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                                    <Mail className="w-8 h-8 text-black" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-400 font-medium">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
                            </div>

                            {/* Form */}
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#EAB308] transition-colors" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl focus:border-[#EAB308]/50 focus:ring-[#EAB308]/20 transition-all placeholder:text-gray-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-[#EAB308] hover:bg-[#FACC15] text-black font-bold text-lg shadow-lg shadow-[#EAB308]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                                    Check Your Email
                                </h1>
                                <p className="text-gray-400 font-medium mb-8">
                                    We've sent password reset instructions to <span className="text-white font-semibold">{email}</span>
                                </p>
                                <Button
                                    onClick={() => navigate('/auth')}
                                    className="w-full h-12 rounded-xl bg-[#EAB308] hover:bg-[#FACC15] text-black font-bold text-lg shadow-lg shadow-[#EAB308]/20 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
