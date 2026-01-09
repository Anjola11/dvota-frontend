import { useState } from 'react';
import { Position } from '@/types';
import { CandidateCard } from './CandidateCard';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Eye } from 'lucide-react';

interface PositionCardProps {
    position: Position;
    onVote: (positionId: string, candidateId: string) => void;
    disabled?: boolean;
    previewMode?: boolean;
}

export const PositionCard = ({ position, onVote, disabled, previewMode }: PositionCardProps) => {
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

    const handleCreateVote = () => {
        if (selectedCandidateId) {
            onVote(position.id, selectedCandidateId);
        }
    };

    const isVoted = position.is_voted;
    const isCardDisabled = disabled || isVoted;

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-6 ${previewMode ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{position.position_name}</h3>
                <div className="flex items-center gap-2">
                    {previewMode && (
                        <span className="flex items-center text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                            <Eye className="w-4 h-4 mr-1.5" /> Preview Only
                        </span>
                    )}
                    {isVoted && (
                        <span className="flex items-center text-sm font-medium text-success bg-success/10 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Voted
                        </span>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                {previewMode
                    ? "These are the candidates running for this position"
                    : "Select 1 candidate for this position"
                }
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {position.candidates?.map((candidate) => (
                    <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={!previewMode && selectedCandidateId === candidate.id}
                        onSelect={() => !previewMode && setSelectedCandidateId(candidate.id)}
                        disabled={isCardDisabled}
                        previewMode={previewMode}
                    />
                ))}
            </div>

            {!isVoted && !previewMode && (
                <div className="flex justify-end">
                    <Button
                        onClick={handleCreateVote}
                        disabled={!selectedCandidateId || isCardDisabled}
                        className="w-full sm:w-auto"
                    >
                        Vote for {position.position_name}
                    </Button>
                </div>
            )}

            {previewMode && (
                <div className="flex justify-end">
                    <div className="text-sm text-purple-600 italic">
                        Voting disabled in preview mode
                    </div>
                </div>
            )}
        </div>
    );
};
