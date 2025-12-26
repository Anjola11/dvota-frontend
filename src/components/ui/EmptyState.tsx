import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    message: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon, title, message, action }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100 h-64">
            {icon && <div className="mb-4 text-gray-400">{icon}</div>}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
            {action && <div>{action}</div>}
        </div>
    );
};
