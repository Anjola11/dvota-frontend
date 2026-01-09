import { useState, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, ImagePlus, Upload, X } from 'lucide-react';
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Candidates</h2>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
                <div className="text-blue-500 mt-0.5">ℹ️</div>
                <div className="text-sm text-blue-700">
                    <span className="font-semibold">Tip:</span> Candidates can be people, options, or anything you want to vote on.
                    You can optionally add a photo for each candidate.
                </div>
            </div>

            <p className="text-gray-500 mb-6">Add at least 2 candidates for each position.</p>

            <div className="space-y-8">
                {positionsData.map((position, posIndex) => (
                    <div key={position.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-sm">{posIndex + 1}</span>
                            {position.name}
                        </h3>

                        {/* Candidate List - Card Style */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                            {position.candidates.map((candidate, candIndex) => (
                                <div
                                    key={candidate.id}
                                    className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                                >
                                    {/* Avatar/Image Preview */}
                                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={candidate.imagePreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.fullname)}&background=7C3AED&color=fff&size=128`}
                                            alt={candidate.fullname}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="p-2 text-center">
                                        <p className="text-sm font-medium text-gray-900 truncate">{candidate.fullname}</p>
                                        <p className="text-xs text-gray-500 truncate">{candidate.nickname || 'No nickname'}</p>
                                        {candidate.imageFile && (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                                                <ImagePlus className="h-3 w-3" /> Photo added
                                            </span>
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => removeCandidate(posIndex, candIndex)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            {position.candidates.length === 0 && (
                                <div className="col-span-full text-center py-8 text-gray-400 italic">
                                    No candidates added yet
                                </div>
                            )}
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
    const [isAdding, setIsAdding] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
            }
            setSelectedImage(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data: any) => {
        if (!data.fullname?.trim()) {
            toast.error('Please enter a name');
            return;
        }
        setIsAdding(true);
        try {
            onAdd({
                ...data,
                imageFile: selectedImage,
                imagePreview: imagePreview
            }, () => {
                reset();
                clearImage();
            });
            toast.success('Candidate added');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
            <div className="text-sm font-semibold text-gray-700">➕ Add New Candidate</div>

            <div className="flex gap-4">
                {/* Image Upload */}
                <div className="flex-shrink-0">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100"
                    >
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">Photo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input placeholder="Full Name *" {...register('fullname', { required: true })} className="h-10" />
                    <Input placeholder="Nickname (Optional)" {...register('nickname')} className="h-10" />
                </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isAdding}>
                <Plus className="h-4 w-4 mr-1" /> Add Candidate
            </Button>
        </form>
    );
}
