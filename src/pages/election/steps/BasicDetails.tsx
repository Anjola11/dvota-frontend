import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateElectionData } from '../CreateElection';

interface BasicDetailsStepProps {
    data: CreateElectionData;
    updateData: (data: Partial<CreateElectionData>) => void;
    onNext: () => void;
}

export const BasicDetailsStep = ({ data, updateData, onNext }: BasicDetailsStepProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            election_name: data.election_name,
            start_time: data.start_time,
            stop_time: data.stop_time,
        }
    });

    const onSubmit = (formData: any) => {
        updateData(formData);
        onNext();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                    label="Election Name"
                    placeholder="e.g. Student Council Election 2024"
                    {...register('election_name', { required: 'Election name is required' })}
                    error={errors.election_name?.message as string}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Start Date & Time"
                        type="datetime-local"
                        className="[color-scheme:light] cursor-pointer"
                        {...register('start_time', { required: 'Start time is required' })}
                        error={errors.start_time?.message as string}
                    />

                    <Input
                        label="End Date & Time"
                        type="datetime-local"
                        className="[color-scheme:light] cursor-pointer"
                        {...register('stop_time', {
                            required: 'End time is required',
                            validate: (val, formValues) => {
                                if (new Date(val) <= new Date(formValues.start_time)) {
                                    return "End time must be after start time";
                                }
                            }
                        })}
                        error={errors.stop_time?.message as string}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit">
                        Next: Add Positions
                    </Button>
                </div>
            </form>
        </div>
    );
};
