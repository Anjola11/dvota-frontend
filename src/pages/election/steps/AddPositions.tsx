import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateElectionData } from '../CreateElection';
import { toast } from 'react-hot-toast';

interface PositionsStepProps {
    data: CreateElectionData;
    updateData: (data: Partial<CreateElectionData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export const PositionsStep = ({ data, updateData, onNext, onPrev }: PositionsStepProps) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            positions: data.positions.length > 0 ? data.positions : [{ id: crypto.randomUUID(), name: '', candidates: [] }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "positions"
    });

    const onSubmit = (formData: any) => {
        if (formData.positions.length === 0) {
            toast.error("Please add at least one position");
            return;
        }
        // Merge existing candidates if position ID matches, else initialized empty
        const updatedPositions = formData.positions.map((pos: any) => {
            const existing = data.positions.find(p => p.id === pos.id);
            return {
                ...pos,
                candidates: existing ? existing.candidates : []
            };
        });

        updateData({ positions: updatedPositions });
        onNext();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Positions</h2>
            <p className="text-gray-500 mb-6">Define the roles or positions for this election (e.g. President, Secretary)</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                            <div className="flex-1">
                                <Input
                                    placeholder={`Position ${index + 1} Name`}
                                    {...register(`positions.${index}.name`, { required: 'Position name is required' })}
                                    error={errors.positions?.[index]?.name?.message as string}
                                />
                            </div>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 mt-0.5"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => append({ id: crypto.randomUUID(), name: '', candidates: [] })}
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Another Position
                </Button>

                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={onPrev}>
                        Back
                    </Button>
                    <Button type="submit">
                        Next: Add Candidates
                    </Button>
                </div>
            </form>
        </div>
    );
};
