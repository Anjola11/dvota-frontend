import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CreateElectionData } from '../CreateElection';
import { toast } from 'react-hot-toast';
import { X, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

interface VotersStepProps {
    data: CreateElectionData;
    updateData: (data: Partial<CreateElectionData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export const VotersStep = ({ data, updateData, onNext, onPrev }: VotersStepProps) => {
    const [voters, setVoters] = useState<string[]>(data.voters);
    const [bulkText, setBulkText] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [skippedEmails, setSkippedEmails] = useState<string[]>([]);

    const handleAddBulk = async () => {
        if (!bulkText.trim()) return;

        setIsVerifying(true);
        setSkippedEmails([]); // Reset skipped list on new attempt

        const rawEmails = bulkText.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
        const validFormatEmails = rawEmails.filter(email => /^\S+@\S+$/i.test(email));

        // Filter out emails that are strictly invalid format first
        const invalidFormatCount = rawEmails.length - validFormatEmails.length;

        const verifiedEmails: string[] = [];
        const notFoundEmails: string[] = [];

        // Verify each email against the backend
        // We do this concurrently for speed, but could throttle if list is huge
        await Promise.all(validFormatEmails.map(async (email) => {
            // Skip if already in our list to save API call
            if (voters.includes(email)) return;

            try {
                const response = await api.post('/elections/check-user', { email });
                if (response.data.success) {
                    verifiedEmails.push(email);
                }
            } catch (error: any) {
                // If 404, user not found. Other errors might be network issues, but we'll treat as 'skip' for now
                notFoundEmails.push(email);
            }
        }));

        // Update state
        if (verifiedEmails.length > 0) {
            setVoters(prev => Array.from(new Set([...prev, ...verifiedEmails])));
            setBulkText(''); // Clear input only if we added something
        }

        setSkippedEmails(notFoundEmails);

        // Feedback
        const totalAdded = verifiedEmails.length;
        const totalSkipped = notFoundEmails.length + invalidFormatCount;

        if (totalAdded > 0) {
            toast.success(`Successfully verified and added ${totalAdded} voters.`);
        }

        if (totalSkipped > 0) {
            toast.error(`${totalSkipped} emails skipped (not registered or invalid format).`);
        } else if (totalAdded === 0 && rawEmails.length > 0) {
            toast.error("No valid, registered users found in input.");
        }

        setIsVerifying(false);
    };

    const removeVoter = (index: number) => {
        const newVoters = [...voters];
        newVoters.splice(index, 1);
        setVoters(newVoters);
    };

    const handleNext = () => {
        updateData({ voters });
        onNext();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Allowed Voters</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
                <div className="text-blue-500 mt-0.5">ℹ️</div>
                <div className="text-sm text-blue-700">
                    <span className="font-semibold">Note:</span> Voters must be registered users on the platform.
                    When you add emails, we will verify them instantly. Unregistered users will be skipped.
                </div>
            </div>

            <p className="text-gray-500 mb-6">Enter email addresses of users allowed to vote.</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Emails (comma or newline separated)</label>
                    <textarea
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px]"
                        placeholder="alice@example.com, bob@example.com..."
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        disabled={isVerifying}
                    />
                    <div className="flex justify-between items-start mt-2">
                        {skippedEmails.length > 0 && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-w-md">
                                <p className="font-semibold flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Skipped (Not Registered):</p>
                                <p className="mt-1 text-xs">{skippedEmails.join(', ')}</p>
                            </div>
                        )}
                        <div className="flex-1 flex justify-end">
                            <Button type="button" variant="outline" onClick={handleAddBulk} disabled={!bulkText.trim() || isVerifying}>
                                {isVerifying ? 'Verifying...' : 'Verify & Add Emails'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3">Voter List ({voters.length})</h3>
                    {voters.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No voters added yet.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                            {voters.map((email, index) => (
                                <div key={index} className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">
                                    {email}
                                    <button onClick={() => removeVoter(index)} className="ml-2 text-gray-400 hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={onPrev}>
                    Back
                </Button>
                <Button type="button" onClick={handleNext}>
                    Next: Review
                </Button>
            </div>
        </div>
    );
};
