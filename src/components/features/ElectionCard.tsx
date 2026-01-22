import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BallotElection } from '@/types'; // ✅ Changed from Election to BallotElection
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ElectionCardProps {
    election: BallotElection; // ✅ Changed type
}

export const ElectionCard = ({ election }: ElectionCardProps) => {
    const { user } = useAuth();
    const statusColor = {
        upcoming: 'bg-blue-100 text-blue-700',
        active: 'bg-green-100 text-green-700',
        ended: 'bg-gray-100 text-gray-700',
    };

    const statusLabel = {
        upcoming: 'Upcoming',
        active: 'Active',
        ended: 'Ended',
    };

    const isVoted = election.vote_status === 'voted';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusColor[election.election_status])}>
                    {statusLabel[election.election_status]}
                </span>
                {isVoted ? (
                    <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Voted
                    </span>
                ) : (
                    <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </span>
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{election.election_name}</h3>

            <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Starts: {format(new Date(election.start_time), 'PPp')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Ends: {format(new Date(election.stop_time), 'PPp')}</span>
                </div>
            </div>

            <div className="mt-auto">
                {user?.id === election.creator_id ? (
                    <Link to={`/election/${election.election_id}/manage`}>
                        <Button className="w-full" variant="outline">
                            Manage Election
                        </Button>
                    </Link>
                ) : (
                    <Link to={`/election/${election.election_id}/details`}>
                        <Button
                            className="w-full"
                            variant={election.election_status === 'active' && !isVoted ? 'primary' : 'outline'}
                            disabled={election.election_status === 'upcoming'}
                        >
                            {election.election_status === 'ended' ? 'View Results' : isVoted ? 'View Details' : 'Vote Now'}
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};