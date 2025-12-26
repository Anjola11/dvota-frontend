import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { Trash2, Users, FileText, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const ManageElection = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [election, setElection] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [voters, setVoters] = useState<string[]>([]); // Assuming we can get/manage voters locally after fetch
    const [newVoterEmail, setNewVoterEmail] = useState('');

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchElectionData();
    }, [id]);

    const fetchElectionData = async () => {
        try {
            const response = await api.get(`/elections/get-election-details/${id}`);
            if (response.data.success) {
                setElection(response.data.data);
                if (response.data.data.allowed_voters) {
                    setVoters(response.data.data.allowed_voters);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load election data');
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteElection = async () => {
        setIsDeleting(true);
        try {
            const response = await api.delete('/elections/delete-election', { data: { election_id: id } });
            if (response.data.success) {
                toast.success('Election deleted successfully');
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete election');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
        }
    };

    const handleAddVoter = async () => {
        if (!newVoterEmail || !/^\S+@\S+$/i.test(newVoterEmail)) {
            toast.error('Invalid email');
            return;
        }
        try {
            const response = await api.post('/elections/add-allowed-voters', {
                election_id: id,
                emails: [newVoterEmail]
            });
            if (response.data.success || response.data.added_count > 0) {
                toast.success('Voter added');
                setVoters(prev => [...prev, newVoterEmail]);
                setNewVoterEmail('');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add voter');
        }
    };

    const handleRemoveVoter = async (email: string, index: number) => {
        try {
            await api.delete('/elections/delete-allowed-voter', {
                data: { election_id: id, email }
            });
            // Even if API doesn't return strictly success, we assume 200 ok
            toast.success('Voter removed');
            const newVoters = [...voters];
            newVoters.splice(index, 1);
            setVoters(newVoters);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove voter');
        }
    }

    if (isLoading) return <FullPageSpinner />;
    if (!election) return <div>Election not found</div>;

    const tabs = [
        { name: 'Overview', icon: FileText },
        { name: 'Positions & Candidates', icon: Users },
        { name: 'Voters', icon: UserPlus },
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{election.election_name}</h1>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded uppercase text-xs font-semibold tracking-wide">
                            {election.election_status}
                        </span>
                        <span>
                            {format(new Date(election.start_time), 'PP')} - {format(new Date(election.stop_time), 'PP')}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/election/${id}`)}>
                        View As Voter
                    </Button>
                    <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Election
                    </Button>
                </div>
            </div>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 max-w-md">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.name}
                            className={({ selected }) =>
                                cn(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                    'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-white text-primary shadow'
                                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary'
                                )
                            }
                        >
                            <div className="flex items-center justify-center gap-2">
                                <tab.icon className="h-4 w-4" />
                                {tab.name}
                            </div>
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {/* Overview Panel */}
                    <Tab.Panel className="rounded-xl bg-white p-3 shadow-sm border border-gray-100 focus:outline-none">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Positions</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{election.positions?.length || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Candidates</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {election.positions?.reduce((acc: number, p: any) => acc + (p.candidates?.length || 0), 0)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <h3 className="text-gray-500 text-sm font-medium uppercase">Allowed Voters</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{voters.length}</p>
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* Positions Panel */}
                    <Tab.Panel className="rounded-xl bg-white p-3 shadow-sm border border-gray-100 focus:outline-none">
                        <div className="p-4 space-y-6">
                            {election.positions?.map((pos: any) => (
                                <div key={pos.position_id} className="border border-gray-100 rounded-lg p-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-3">{pos.position_name}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pos.candidates?.map((cand: any) => (
                                            <div key={cand.candidate_id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-gray-400 font-bold border border-gray-200 mr-3">
                                                    {cand.fullname.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{cand.fullname}</p>
                                                    <p className="text-xs text-gray-500">{cand.nickname || 'No nickname'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>

                    {/* Voters Panel */}
                    <Tab.Panel className="rounded-xl bg-white p-3 shadow-sm border border-gray-100 focus:outline-none">
                        <div className="p-4 space-y-6">
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Add voter email"
                                    value={newVoterEmail}
                                    onChange={(e) => setNewVoterEmail(e.target.value)}
                                    className="max-w-md"
                                />
                                <Button onClick={handleAddVoter}>Add</Button>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {voters.map((email, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleRemoveVoter(email, index)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {voters.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No voters found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteElection}
                title="Delete Election"
                message="Are you sure you want to delete this election? This action cannot be undone."
                isDestructive
                isLoading={isDeleting}
            />
        </div>
    );
};
