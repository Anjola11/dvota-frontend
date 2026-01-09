import { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Camera, Mail, User as UserIcon, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

export const Settings = () => {
    const { user, updateUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/auth/upload-profile-picture/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Update user context with new profile picture URL
                const userData = response.data.data;
                updateUser({
                    profile_picture_url: userData.profile_picture_url
                });
                toast.success('Profile picture updated successfully!');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.detail || 'Failed to upload profile picture');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account information and profile</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Gradient Header */}
                <div className="h-24 bg-gradient-to-r from-primary via-primary-dark to-purple-600" />

                {/* Profile Content */}
                <div className="px-6 pb-6">
                    {/* Avatar Section */}
                    <div className="relative -mt-12 mb-6">
                        <div className="relative inline-block">
                            <Avatar
                                src={user?.profile_picture_url}
                                fallback={user?.fullName || 'U'}
                                size="xl"
                                className="ring-4 ring-white"
                            />
                            <button
                                onClick={handleFileSelect}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 p-2 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium text-gray-900">{user?.fullName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{user?.email}</p>
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Upload Button */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <Button
                            onClick={handleFileSelect}
                            disabled={isUploading}
                            variant="outline"
                            className="w-full"
                        >
                            {isUploading ? (
                                <>
                                    <Spinner className="h-4 w-4 mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Camera className="h-4 w-4 mr-2" />
                                    Change Profile Picture
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Use a clear, front-facing photo for the best results.
                    Your profile picture helps others recognize you in elections.
                </p>
            </div>
        </div>
    );
};
