import { Candidate } from '@/types';
import { cn } from '@/lib/utils';
import { User2 } from 'lucide-react';

interface CandidateCardProps {
    candidate: Candidate;
    isSelected?: boolean;
    onSelect?: () => void;
    disabled?: boolean;
}

export const CandidateCard = ({ candidate, isSelected, onSelect, disabled }: CandidateCardProps) => {
    return (
        <div
            onClick={() => !disabled && onSelect?.()}
            className={cn(
                "relative flex items-center p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md",
                isSelected
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                    : "border-gray-200 bg-white hover:border-primary/50",
                disabled && "opacity-60 cursor-not-allowed hover:bg-white hover:border-gray-200 hover:shadow-none"
            )}
        >
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 overflow-hidden border border-gray-100">
                {candidate.image_url ? (
                    <img src={candidate.image_url} alt={candidate.fullname} className="h-full w-full object-cover" />
                ) : (
                    <User2 className="h-6 w-6 text-gray-400" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 truncate">{candidate.fullname}</h4>
                {candidate.nickname && (
                    <p className="text-sm text-gray-500 truncate">"{candidate.nickname}"</p>
                )}
            </div>

            <div className={cn(
                "h-5 w-5 rounded-full border flex items-center justify-center transition-colors ml-2",
                isSelected ? "border-primary bg-primary" : "border-gray-300 bg-white"
            )}>
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
        </div>
    );
};
