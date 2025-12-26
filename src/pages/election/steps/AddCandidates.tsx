import { useState } from 'react';
import api from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateElectionData } from '../CreateElection';
import { toast } from 'react-hot-toast';

interface CandidatesStepProps {
    data: CreateElectionData;
    updateData: (data: Partial<CreateElectionData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export const CandidatesStep = ({ data, updateData, onNext, onPrev }: CandidatesStepProps) => {
    const [positionsData, setPositionsData] = useState(data.positions);

    const handleAddCandidate = (positionIndex: number, candidateData: any, resetForm: () => void) => {
        const updatedPositions = [...positionsData];
        updatedPositions[positionIndex].candidates.push({
            id: crypto.randomUUID(),
            ...candidateData
        });
        setPositionsData(updatedPositions);
        resetForm();
    };

    const removeCandidate = (positionIndex: number, candidateIndex: number) => {
        const updatedPositions = [...positionsData];
        updatedPositions[positionIndex].candidates.splice(candidateIndex, 1);
        setPositionsData(updatedPositions);
    };

    const handleNext = () => {
        // Validate min 2 candidates per position
        for (const pos of positionsData) {
            if (pos.candidates.length < 2) {
                toast.error(`Please add at least 2 candidates for ${pos.name}`);
                return;
            }
        }
        updateData({ positions: positionsData });
        onNext();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Candidates</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
                <div className="text-blue-500 mt-0.5">ℹ️</div>
                <div className="text-sm text-blue-700">
                    <span className="font-semibold">Note:</span> Candidates must be registered users on the platform.
                    Unregistered emails will not be accepted.
                </div>
            </div>
            <p className="text-gray-500 mb-6">Add at least 2 candidates for each position.</p>

            <div className="space-y-8">
                {positionsData.map((position, posIndex) => (
                    <div key={position.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm mb-0.5">{posIndex + 1}</span>
                            {position.name}
                        </h3>

                        {/* Candidate List */}
                        <div className="space-y-2 mb-4">
                            {position.candidates.length === 0 && <p className="text-sm text-gray-400 italic">No candidates added yet.</p>}
                            {position.candidates.map((candidate, candIndex) => (
                                <div key={candidate.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                    <div>
                                        <p className="text-sm font-medium">{candidate.fullname}</p>
                                        <p className="text-xs text-gray-500">{candidate.email}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeCandidate(posIndex, candIndex)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Add Form */}
                        <CandidateForm onAdd={(data, reset) => handleAddCandidate(posIndex, data, reset)} />
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={onPrev}>
                    Back
                </Button>
                <Button type="button" onClick={handleNext}>
                    Next: Add Voters
                </Button>
            </div>
        </div>
    );
};

const CandidateForm = ({ onAdd }: { onAdd: (data: any, reset: () => void) => void }) => {
    const { register, handleSubmit, reset } = useForm();
    const [isChecking, setIsChecking] = useState(false);

    const onSubmit = async (data: any) => {
        setIsChecking(true);
        try {
            const response = await api.post('/elections/check-user', { email: data.email });
            if (response.data.success) {
                // Optional: Use the fullname from the backend if you want to ensure accuracy
                // const verifiedName = response.data.data.username || data.fullname; 
                onAdd(data, reset);
                toast.success('Candidate verified and added');
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                toast.error('User not found. Please ensure the email is registered.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to verify user');
            }
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-3 rounded border border-gray-200 space-y-3">
            <div className="text-sm font-medium text-gray-700">New Candidate</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Full Name" {...register('fullname', { required: true })} size={1} className="h-9 text-sm" />
                <Input placeholder="Email" {...register('email', { required: true, pattern: /^\S+@\S+$/i })} size={1} className="h-9 text-sm" />
                <Input placeholder="Nickname (Optional)" {...register('nickname')} size={1} className="h-9 text-sm" />
                <Button type="submit" size="sm" variant="outline" className="w-full" isLoading={isChecking}>
                    <Plus className="h-3 w-3 mr-1" /> {isChecking ? 'Verifying...' : 'Add'}
                </Button>
            </div>
        </form>
    );
}
