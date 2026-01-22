import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { Vote } from 'lucide-react';

export const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/signup', data);
            if (response.data.success) {
                toast.success(response.data.message || 'OTP sent to your email');
                localStorage.setItem('temp_user_id', response.data.data.user_id);
                localStorage.setItem('temp_email', data.email);
                navigate('/verify-otp');
            } else {
                toast.error(response.data.message || 'Signup failed');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || error.response?.data?.message || 'Something went wrong');
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
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join Dvota to participate in secure elections
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                            error={errors.fullName?.message as string}
                        />

                        <Input
                            label="Email address"
                            type="email"
                            placeholder="john@example.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                            })}
                            error={errors.email?.message as string}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Minimum 8 characters' }
                            })}
                            error={errors.password?.message as string}
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign up
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
