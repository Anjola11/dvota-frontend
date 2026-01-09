import { Candidate } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface CandidateCardProps {
    candidate: Candidate;
    isSelected?: boolean;
    onSelect?: () => void;
    disabled?: boolean;
    previewMode?: boolean;
}

export const CandidateCard = ({ candidate, isSelected, onSelect, disabled, previewMode }: CandidateCardProps) => {
    const candidateName = candidate.fullName || candidate.fullname || 'Unknown';
    const imageUrl = candidate.candidate_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=7C3AED&color=fff&size=256`;

    return (
        <div
            onClick={() => !disabled && !previewMode && onSelect?.()}
            className={cn(
                "relative flex flex-col border-2 rounded-2xl transition-all duration-200 overflow-hidden bg-white group",
                previewMode
                    ? "cursor-default border-gray-200"
                    : "cursor-pointer hover:shadow-lg",
                isSelected && !previewMode
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-primary/50",
                disabled && !previewMode && "opacity-60 cursor-not-allowed hover:shadow-none hover:border-gray-200"
            )}
        >
            {/* Large Candidate Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                <img
                    src={imageUrl}
                    alt={candidateName}
                    className={cn(
                        "w-full h-full object-cover transition-transform duration-300",
                        !previewMode && "group-hover:scale-105"
                    )}
                    onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=7C3AED&color=fff&size=256`;
                    }}
                />

                {/* Selection Indicator Overlay */}
                {isSelected && !previewMode && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </div>
                )}
            </div>

            {/* Candidate Info */}
            <div className="p-3 text-center">
                <h4 className={cn(
                    "text-sm font-bold truncate",
                    isSelected && !previewMode ? "text-primary" : "text-gray-900"
                )}>
                    {candidateName}
                </h4>
                {candidate.nickname && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                        "{candidate.nickname}"
                    </p>
                )}
            </div>

            {/* Selection Radio Circle - Hidden in Preview Mode */}
            {!previewMode && (
                <div className={cn(
                    "absolute top-2 left-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all bg-white shadow-sm",
                    isSelected ? "border-primary bg-primary" : "border-gray-300"
                )}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
            )}
        </div>
    );
};
