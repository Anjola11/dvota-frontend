import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import api from '@/lib/axios';
import { Vote, RefreshCw } from 'lucide-react';

export const VerifyOtp = () => {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    const [userId, setUserId] = useState<string | null>(localStorage.getItem('temp_user_id'));
    const email = localStorage.getItem('temp_email');
    const otpType = location.state?.otpType || 'signup';

    // Auto-resend OTP if user came from login without user_id
    useEffect(() => {
        if (!userId && email) {
            handleResendOtp(true);
        }
    }, []);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResendOtp = async (silent = false) => {
        if (!email) {
            toast.error("Email not found. Please start over.");
            navigate('/signup');
            return;
        }

        if (cooldown > 0) return;

        setIsResending(true);
        try {
            const response = await api.post('/auth/resend-otp', {
                email: email,
                otp_type: otpType
            });

            if (response.data.success) {
                // Store the user_id from response
                if (response.data.user_id) {
                    localStorage.setItem('temp_user_id', response.data.user_id);
                    setUserId(response.data.user_id);
                }
                if (!silent) {
                    toast.success(response.data.message || 'OTP sent successfully');
                }
                setCooldown(60); // 60 second cooldown
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.message;

            // Handle "already requested" case - set cooldown but don't show error
            if (error.response?.status === 403 && errorMessage?.includes('already requested')) {
                setCooldown(60);
                if (!silent) {
                    toast.error(errorMessage);
                }
            } else {
                toast.error(errorMessage || 'Failed to resend OTP');
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        if (!userId) {
            toast.error("Session expired. Please request a new OTP.");
            handleResendOtp();
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/verify_otp', {
                user_id: userId,
                otp: otpValue,
                otp_type: otpType
            });

            if (response.data.success) {
                toast.success(response.data.message || 'Verification successful');
                if (otpType === 'forgotPassword') {
                    localStorage.setItem('reset_token', response.data.data?.reset_token);
                    navigate('/reset-password');
                } else {
                    navigate('/login');
                }
                localStorage.removeItem('temp_user_id');
                localStorage.removeItem('temp_email');
            } else {
                toast.error(response.data.message || 'Verification failed');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Invalid OTP';
            toast.error(errorMessage);

            // If OTP expired, suggest resending
            if (errorMessage.toLowerCase().includes('expired')) {
                setOtp(new Array(6).fill(""));
                inputRefs.current[0]?.focus();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Vote className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Verify your email</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We sent a code to <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div className="flex justify-between gap-2">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        type="text"
                                        name="otp"
                                        maxLength={1}
                                        key={index}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        disabled={isLoading || isResending}
                                    />
                                );
                            })}
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading} disabled={otp.join("").length !== 6 || isResending}>
                            Verify Email
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            <button
                                className={`font-medium transition-colors inline-flex items-center gap-1 ${cooldown > 0 || isResending
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-primary hover:text-primary-dark'
                                    }`}
                                type="button"
                                onClick={() => handleResendOtp()}
                                disabled={cooldown > 0 || isResending}
                            >
                                {isResending ? (
                                    <>
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                        Sending...
                                    </>
                                ) : cooldown > 0 ? (
                                    `Resend in ${cooldown}s`
                                ) : (
                                    'Resend'
                                )}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
