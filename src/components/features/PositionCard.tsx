import { useState } from 'react';
import { Position } from '@/types';
import { CandidateCard } from './CandidateCard';
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

interface PositionCardProps {
    position: Position;
    onVote: (positionId: string, candidateId: string) => void;
    disabled?: boolean;
}

export const PositionCard = ({ position, onVote, disabled }: PositionCardProps) => {
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

    // If already voted, maybe show who they voted for? 
    // For now just show disabled state.

    const handleCreateVote = () => {
        if (selectedCandidateId) {
            onVote(position.id, selectedCandidateId);
        }
    };

    const isVoted = position.is_voted;
    const isCardDisabled = disabled || isVoted;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{position.position_name}</h3>
                {isVoted && (
                    <span className="flex items-center text-sm font-medium text-success bg-success/10 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Voted
                    </span>
                )}
            </div>

            <p className="text-sm text-gray-500 mb-6">
                Select 1 candidate for this position
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {position.candidates?.map((candidate) => (
                    <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={selectedCandidateId === candidate.id}
                        onSelect={() => setSelectedCandidateId(candidate.id)}
                        disabled={isCardDisabled}
                    />
                ))}
            </div>

            {!isVoted && (
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
        </div>
    );
};
