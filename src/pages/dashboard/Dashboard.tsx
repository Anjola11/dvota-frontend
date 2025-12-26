import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ElectionCard } from '@/components/features/ElectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/lib/axios';
import { BallotElection } from '@/types'; // ✅ CHANGE THIS LINE
import { toast } from 'react-hot-toast';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [elections, setElections] = useState<BallotElection[]>([]); // ✅ CHANGE THIS LINE
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

    useEffect(() => {
        fetchElections();

        // Auto-refresh active elections every 30s
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchElections(true);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchElections = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const response = await api.get('/elections/get-my-ballot');
            if (response.data.success) {
                setElections(response.data.data);
            }
        } catch (error: any) {
            if (!silent) toast.error(error.response?.data?.message || 'Failed to load elections');
            console.error(error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const filteredElections = elections.filter(election => {
        const matchesSearch = election.election_name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || election.election_status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Top Row: Title & Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Ballot</h1>
                    <p className="text-gray-500">Manage your votes and view election results</p>
                </div>
                <Button onClick={() => navigate('/create-election')}>
                    + Create Election
                </Button>
            </div>

            {/* Second Row: Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search elections..."
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="py-2 pl-3 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                    value={filter}
                    onChange={(e: any) => setFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ended">Ended</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner className="h-8 w-8" />
                </div>
            ) : filteredElections.length === 0 ? (
                <EmptyState
                    icon={<Filter className="h-10 w-10" />}
                    title="No elections found"
                    message={search || filter !== 'all' ? "Try adjusting your search or filters" : "You haven't been enrolled in any elections yet."}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredElections.map(election => (
                        <ElectionCard key={election.election_id} election={election} />
                    ))}
                </div>
            )}
        </div>
    );
};