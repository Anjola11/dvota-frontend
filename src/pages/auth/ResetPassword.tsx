import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { Vote } from 'lucide-react';

export const ResetPassword = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const resetToken = localStorage.getItem('reset_token');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await api.patch('/auth/reset_password', {
                new_password: data.password,
                reset_token: resetToken
            });

            if (response.data.success) {
                toast.success(response.data.message || 'Password reset successfully');
                localStorage.removeItem('reset_token');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Reset failed');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (!resetToken) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Invalid or missing reset token.</p>
                    <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Vote className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Set new password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please enter your new password below
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Minimum 8 characters' }
                            })}
                            error={errors.password?.message as string}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (val: string) => {
                                    if (watch('password') != val) {
                                        return "Your passwords do mean match";
                                    }
                                }
                            })}
                            error={errors.confirmPassword?.message as string}
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Reset Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
