import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Confetti from 'react-confetti';
import { format } from 'date-fns';
import { ArrowLeft, Clock, AlertTriangle, Eye, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { PositionCard } from '@/components/features/PositionCard';
import { CountdownTimer } from '@/components/features/CountdownTimer';
import api from '@/lib/axios';
import { Election } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const ElectionDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [election, setElection] = useState<Election | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVoting, setIsVoting] = useState(false);
    const [isCreatorNotVoter, setIsCreatorNotVoter] = useState(false);

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingVote, setPendingVote] = useState<{ positionId: string, candidateId: string } | null>(null);

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchElectionDetails();
    }, [id]);

    const fetchElectionDetails = async () => {
        try {
            const response = await api.get(`/elections/get-election-details/${id}`);
            if (response.data.success) {
                const electionData = response.data.data;
                setElection(electionData);

                // Check if user is creator but NOT in allowed_voters
                const isCreator = user?.id === electionData.creator_id;
                const allowedVoters = electionData.allowed_voters || [];
                const isAllowedVoter = allowedVoters.includes(user?.email);

                if (isCreator && !isAllowedVoter) {
                    setIsCreatorNotVoter(true);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load election details');
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitiateVote = (positionId: string, candidateId: string) => {
        if (isCreatorNotVoter) {
            toast.error('As the election creator, you cannot vote in this election.');
            return;
        }
        setPendingVote({ positionId, candidateId });
        setConfirmOpen(true);
    };

    const handleConfirmVote = async () => {
        if (!pendingVote || !election) return;

        setIsVoting(true);
        try {
            const response = await api.post('/elections/vote', {
                election_id: election.id,
                position_id: pendingVote.positionId,
                candidate_id: pendingVote.candidateId
            });

            if (response.data.success) {
                toast.success('Vote submitted successfully!');
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);

                // Update local state to show position as voted
                setElection(prev => {
                    if (!prev || !prev.positions) return prev;
                    return {
                        ...prev,
                        positions: prev.positions.map(p =>
                            p.id === pendingVote.positionId
                                ? { ...p, is_voted: true }
                                : p
                        )
                    };
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit vote');
        } finally {
            setIsVoting(false);
            setConfirmOpen(false);
            setPendingVote(null);
        }
    };

    if (isLoading) return <FullPageSpinner />;
    if (!election) return <div>Election not found</div>;

    // Calculate election status on the frontend
    const now = new Date();
    const startTime = new Date(election.start_time);
    const stopTime = new Date(election.stop_time);

    const electionStatus = now < startTime
        ? 'upcoming'
        : now > stopTime
            ? 'ended'
            : 'active';

    const isActive = electionStatus === 'active';
    const isCreator = user?.id === election.creator_id;
    const isComponentsDisabled = !isActive || isCreatorNotVoter;

    return (
        <div className="space-y-8 pb-20">
            {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

            {/* Creator Preview Mode Banner */}
            {isCreatorNotVoter && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Eye className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Preview Mode
                                </h2>
                                <p className="text-purple-100 mt-1">
                                    You're viewing this election as the creator. As the organizer, you cannot participate in voting to ensure election integrity.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/election/${election.id}/manage`)}
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20 flex-shrink-0"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Election
                        </Button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="-ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                        </Button>
                        {isCreator && !isCreatorNotVoter && (
                            <Button variant="outline" size="sm" onClick={() => navigate(`/election/${election.id}/manage`)}>
                                ⚙️ Manage Election
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{election.election_name}</h1>
                            {isCreatorNotVoter && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                    PREVIEW
                                </span>
                            )}
                        </div>
                        {isActive && !isCreatorNotVoter && (
                            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">Time Remaining:</span>
                                <CountdownTimer targetDate={election.stop_time} onComplete={fetchElectionDetails} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 gap-6">
                    <span>Starts: {format(startTime, 'PPp')}</span>
                    <span>Ends: {format(stopTime, 'PPp')}</span>
                </div>

                {!isActive && !isCreatorNotVoter && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 mt-0.5" />
                        <div>
                            <h4 className="font-medium">Election is {electionStatus}</h4>
                            <p className="text-sm mt-1">
                                {electionStatus === 'upcoming'
                                    ? "Voting has not started yet. Please come back later."
                                    : "This election has ended. You can view the results."}
                            </p>
                            {electionStatus === 'ended' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => navigate(`/election/${id}/results`)}
                                >
                                    View Results
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Positions List */}
            <div className="space-y-6">
                {election.positions?.map((position) => (
                    <PositionCard
                        key={position.id}
                        position={position}
                        onVote={handleInitiateVote}
                        disabled={isComponentsDisabled}
                        previewMode={isCreatorNotVoter}
                    />
                ))}
            </div>

            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmVote}
                title="Confirm Vote"
                message="Are you sure you want to vote for this candidate? This action cannot be undone."
                isLoading={isVoting}
            />
        </div>
    );
};