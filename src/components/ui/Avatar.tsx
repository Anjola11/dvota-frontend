import { cn } from '@/lib/utils';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-24 w-24 text-2xl',
};

export const Avatar = ({
    src,
    alt = 'User avatar',
    fallback = 'U',
    size = 'md',
    className
}: AvatarProps) => {
    const initials = fallback.charAt(0).toUpperCase();

    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={cn(
                    'rounded-full object-cover ring-2 ring-white shadow-md',
                    sizeClasses[size],
                    className
                )}
                onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold shadow-md',
                sizeClasses[size],
                className
            )}
        >
            {initials}
        </div>
    );
};
