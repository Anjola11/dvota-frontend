import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Spinner = ({ className }: { className?: string }) => {
    return <Loader2 className={cn("animate-spin text-primary", className)} />;
};

export const FullPageSpinner = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <Spinner className="h-12 w-12" />
    </div>
);
