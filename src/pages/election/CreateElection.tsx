import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

// Steps
import { BasicDetailsStep } from './steps/BasicDetails';
import { PositionsStep } from './steps/AddPositions';
import { CandidatesStep } from './steps/AddCandidates';
import { VotersStep } from './steps/AddVoters';
import { ReviewStep } from './steps/Review';

const STEPS = [
    { id: 1, name: 'Details' },
    { id: 2, name: 'Positions' },
    { id: 3, name: 'Candidates' },
    { id: 4, name: 'Voters' },
    { id: 5, name: 'Review' },
];

export interface CreateElectionData {
    election_name: string;
    start_time: string; // ISO string
    stop_time: string; // ISO string
    positions: {
        id: string; // temp id
        name: string;
        candidates: {
            id: string; // temp id
            fullname: string;
            email: string;
            nickname?: string;
        }[];
    }[];
    voters: string[]; // emails
}

const formatDateForInput = (date: Date) => {
    // Format: YYYY-MM-DDThh:mm
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
};

export const CreateElection = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize dates
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [formData, setFormData] = useState<CreateElectionData>({
        election_name: '',
        start_time: formatDateForInput(now),
        stop_time: formatDateForInput(tomorrow),
        positions: [],
        voters: [],
    });

    const updateFormData = (data: Partial<CreateElectionData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // The datetime-local input gives us local time string like "2025-12-24T19:55"
            // We need to explicitly create a Date object in local timezone

            const startDate = new Date(formData.start_time); // Already in local time
            const stopDate = new Date(formData.stop_time);

            console.log('Local start time:', startDate.toString());
            console.log('UTC start time:', startDate.toISOString());

            const electionRes = await api.post('/elections/create-election', {
                election_name: formData.election_name,
                start_time: startDate.toISOString(),
                stop_time: stopDate.toISOString(),
            });

            console.log('Election response:', electionRes.data);


            const election_id = electionRes.data.data.id;

            // Add Positions and Candidates
            for (const position of formData.positions) {
                const posRes = await api.post('/elections/add-position', {
                    election_id,
                    position_name: position.name,
                });
                const position_id = posRes.data.data.id;

                for (const candidate of position.candidates) {
                    await api.post('/elections/add-candidate', {
                        election_id,
                        position_id,
                        email: candidate.email,
                        fullname: candidate.fullname,
                        nickname: candidate.nickname || undefined,
                    });
                }
            }

            // 3. Add Voters
            if (formData.voters.length > 0) {
                await api.post('/elections/add-allowed-voters', {
                    election_id,
                    emails: formData.voters,
                });
            }

            toast.success('Election created successfully!');
            navigate(`/election/${election_id}/manage`);
        } catch (error: any) {
            console.error('Full error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            const errorMessage = error.response?.data?.message || 'Failed to create election.';

            if (error.response?.status === 422) {
                toast.error(`Validation Error: ${errorMessage}`);
            } else if (error.response?.status === 409) {
                toast.error(`Conflict: ${errorMessage}`);
            } else if (error.response?.status === 500) {
                toast.error('Server Error: Please try again.');
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create New Election</h1>
                <p className="text-gray-500">Follow the steps to set up your election</p>
            </div>

            {/* Progress Steps */}
            <nav aria-label="Progress" className="mb-10">
                <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                    {STEPS.map((step) => (
                        <li key={step.name} className="md:flex-1">
                            <button
                                className={`group flex w-full flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${step.id < currentStep
                                    ? 'border-primary hover:border-primary-dark'
                                    : step.id === currentStep
                                        ? 'border-primary text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => {
                                    // Only allow going back or to current step
                                    if (step.id < currentStep) setCurrentStep(step.id);
                                }}
                            >
                                <span className={`text-sm font-medium ${step.id < currentStep ? 'text-primary' : step.id === currentStep ? 'text-primary' : 'text-gray-500'}`}>
                                    Step {step.id}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{step.name}</span>
                            </button>
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {currentStep === 1 && <BasicDetailsStep data={formData} updateData={updateFormData} onNext={nextStep} />}
                {currentStep === 2 && <PositionsStep data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                {currentStep === 3 && <CandidatesStep data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                {currentStep === 4 && <VotersStep data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                {currentStep === 5 && <ReviewStep data={formData} onSubmit={handleSubmit} onPrev={prevStep} isSubmitting={isSubmitting} />}
            </div>
        </div>
    );
};
