import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { CreateElectionData } from '../CreateElection';

interface ReviewStepProps {
    data: CreateElectionData;
    onSubmit: () => void;
    onPrev: () => void;
    isSubmitting: boolean;
}

export const ReviewStep = ({ data, onSubmit, onPrev, isSubmitting }: ReviewStepProps) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Create</h2>
            <p className="text-gray-500 mb-6">Please review all details before creating the election.</p>

            <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">Basic Details</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="text-gray-500">Election Name</dt>
                            <dd className="font-medium text-gray-900">{data.election_name}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Dates</dt>
                            <dd className="font-medium text-gray-900 mt-1">
                                <div>Start: {data.start_time ? format(new Date(data.start_time), 'PPp') : '-'}</div>
                                <div>End: {data.stop_time ? format(new Date(data.stop_time), 'PPp') : '-'}</div>
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">Positions & Candidates</h3>
                    <div className="space-y-4">
                        {data.positions.map((pos) => (
                            <div key={pos.id}>
                                <div className="text-sm font-medium text-gray-900">{pos.name}</div>
                                <ul className="mt-1 list-disc list-inside text-sm text-gray-500 ml-2">
                                    {pos.candidates.map(c => (
                                        <li key={c.id}>{c.fullname}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">Voters</h3>
                    <p className="text-sm text-gray-500">
                        {data.voters.length} allowed voters added.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <Button type="button" variant="outline" onClick={onPrev} disabled={isSubmitting}>
                    Back
                </Button>
                <Button type="button" onClick={onSubmit} isLoading={isSubmitting}>
                    Create Election
                </Button>
            </div>
        </div>
    );
};
