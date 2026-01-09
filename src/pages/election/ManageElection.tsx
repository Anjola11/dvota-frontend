import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { Trash2, Users, FileText, UserPlus, Camera, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FullPageSpinner, Spinner } from '@/components/ui/Spinner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { EditModal } from '@/components/ui/EditModal';
import { Avatar } from '@/components/ui/Avatar';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Helper to format datetime for input
const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export const ManageElection = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [election, setElection] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [voters, setVoters] = useState<string[]>([]);
    const [newVoterEmail, setNewVoterEmail] = useState('');
    const [uploadingCandidateId, setUploadingCandidateId] = useState<string | null>(null);

    // Delete Election Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Election Modal
    const [editElectionModalOpen, setEditElectionModalOpen] = useState(false);
    const [editElectionData, setEditElectionData] = useState({
        election_name: '',
        start_time: '',
        stop_time: ''
    });
    const [isEditingElection, setIsEditingElection] = useState(false);

    // Edit Position Modal
    const [editPositionModalOpen, setEditPositionModalOpen] = useState(false);
    const [editPositionData, setEditPositionData] = useState({
        position_id: '',
        position_name: ''
    });
    const [isEditingPosition, setIsEditingPosition] = useState(false);

    // Delete Position Modal
    const [deletePositionModalOpen, setDeletePositionModalOpen] = useState(false);
    const [positionToDelete, setPositionToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeletingPosition, setIsDeletingPosition] = useState(false);

    // Edit Candidate Modal
    const [editCandidateModalOpen, setEditCandidateModalOpen] = useState(false);
    const [editCandidateData, setEditCandidateData] = useState({
        candidate_id: '',
        fullName: '',
        nickname: ''
    });
    const [isEditingCandidate, setIsEditingCandidate] = useState(false);

    // Delete Candidate Modal
    const [deleteCandidateModalOpen, setDeleteCandidateModalOpen] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeletingCandidate, setIsDeletingCandidate] = useState(false);

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

    // ========== ELECTION HANDLERS ==========
    const handleDeleteElection = async () => {
        setIsDeleting(true);
        try {
            const response = await api.delete('/elections/delete-election', { data: { election_id: id } });
            if (response.data.success) {
                toast.success('Election deleted successfully');
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete election');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
        }
    };

    const openEditElectionModal = () => {
        setEditElectionData({
            election_name: election.election_name,
            start_time: formatDateForInput(election.start_time),
            stop_time: formatDateForInput(election.stop_time)
        });
        setEditElectionModalOpen(true);
    };

    const handleEditElection = async (e: FormEvent) => {
        e.preventDefault();
        setIsEditingElection(true);
        try {
            const startDate = new Date(editElectionData.start_time);
            const stopDate = new Date(editElectionData.stop_time);

            const response = await api.patch('/elections/edit-election', {
                election_id: id,
                election_name: editElectionData.election_name,
                start_time: startDate.toISOString(),
                stop_time: stopDate.toISOString()
            });

            if (response.data.success) {
                toast.success('Election updated successfully');
                setEditElectionModalOpen(false);
                await fetchElectionData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update election');
        } finally {
            setIsEditingElection(false);
        }
    };

    // ========== POSITION HANDLERS ==========
    const openEditPositionModal = (position: any) => {
        setEditPositionData({
            position_id: position.id,
            position_name: position.position_name
        });
        setEditPositionModalOpen(true);
    };

    const handleEditPosition = async (e: FormEvent) => {
        e.preventDefault();
        setIsEditingPosition(true);
        try {
            const response = await api.patch('/elections/edit-position', {
                election_id: id,
                position_id: editPositionData.position_id,
                position_name: editPositionData.position_name
            });

            if (response.data.success) {
                toast.success('Position updated successfully');
                setEditPositionModalOpen(false);
                await fetchElectionData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update position');
        } finally {
            setIsEditingPosition(false);
        }
    };

    const openDeletePositionModal = (position: any) => {
        setPositionToDelete({ id: position.id, name: position.position_name });
        setDeletePositionModalOpen(true);
    };

    const handleDeletePosition = async () => {
        if (!positionToDelete) return;
        setIsDeletingPosition(true);
        try {
            const response = await api.delete('/elections/delete-position', {
                data: { election_id: id, position_id: positionToDelete.id }
            });

            if (response.data.success) {
                toast.success('Position deleted successfully');
                setDeletePositionModalOpen(false);
                await fetchElectionData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete position');
        } finally {
            setIsDeletingPosition(false);
            setPositionToDelete(null);
        }
    };

    // ========== CANDIDATE HANDLERS ==========
    const openEditCandidateModal = (candidate: any) => {
        setEditCandidateData({
            candidate_id: candidate.id,
            fullName: candidate.fullName || candidate.fullname || '',
            nickname: candidate.nickname || ''
        });
        setEditCandidateModalOpen(true);
    };

    const handleEditCandidate = async (e: FormEvent) => {
        e.preventDefault();
        setIsEditingCandidate(true);
        try {
            const response = await api.patch('/elections/edit-candidate', {
                election_id: id,
                candidate_id: editCandidateData.candidate_id,
                fullName: editCandidateData.fullName,
                nickname: editCandidateData.nickname || undefined
            });

            if (response.data.success) {
                toast.success('Candidate updated successfully');
                setEditCandidateModalOpen(false);
                await fetchElectionData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update candidate');
        } finally {
            setIsEditingCandidate(false);
        }
    };

    const openDeleteCandidateModal = (candidate: any) => {
        const name = candidate.fullName || candidate.fullname || 'Unknown';
        setCandidateToDelete({ id: candidate.id, name });
        setDeleteCandidateModalOpen(true);
    };

    const handleDeleteCandidate = async () => {
        if (!candidateToDelete) return;
        setIsDeletingCandidate(true);
        try {
            const response = await api.delete('/elections/delete-candidate', {
                data: { election_id: id, candidate_id: candidateToDelete.id }
            });

            if (response.data.success) {
                toast.success('Candidate deleted successfully');
                setDeleteCandidateModalOpen(false);
                await fetchElectionData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete candidate');
        } finally {
            setIsDeletingCandidate(false);
            setCandidateToDelete(null);
        }
    };

    // ========== VOTER HANDLERS ==========
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
            toast.error(error.response?.data?.detail || 'Failed to add voter');
        }
    };

    const handleRemoveVoter = async (email: string, index: number) => {
        try {
            await api.delete('/elections/delete-allowed-voter', {
                data: { election_id: id, email }
            });
            toast.success('Voter removed');
            const newVoters = [...voters];
            newVoters.splice(index, 1);
            setVoters(newVoters);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to remove voter');
        }
    };

    // ========== IMAGE UPLOAD HANDLER ==========
    const handleCandidateImageUpload = async (candidateId: string, file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploadingCandidateId(candidateId);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(
                `/elections/${id}/candidates/${candidateId}/picture`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                toast.success('Candidate image updated');
                await fetchElectionData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to upload image');
        } finally {
            setUploadingCandidateId(null);
        }
    };

    if (isLoading) return <FullPageSpinner />;
    if (!election) return <div>Election not found</div>;

    // Calculate election status from dates
    const now = new Date();
    const startTime = new Date(election.start_time);
    const stopTime = new Date(election.stop_time);

    let electionStatus = 'Upcoming';
    let statusColor = 'bg-blue-100 text-blue-700';
    const hasStarted = startTime <= now;
    const hasEnded = stopTime < now;

    if (hasEnded) {
        electionStatus = 'Ended';
        statusColor = 'bg-gray-100 text-gray-600';
    } else if (hasStarted) {
        electionStatus = 'Active';
        statusColor = 'bg-green-100 text-green-700';
    }

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
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded uppercase text-xs font-semibold tracking-wide ${statusColor}`}>
                            {electionStatus}
                        </span>
                        {hasStarted && !hasEnded && (
                            <span className="text-amber-600 text-xs font-medium">⚠️ Editing locked</span>
                        )}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                        <span className="block sm:inline">
                            {format(new Date(election.start_time), 'PPp')}
                        </span>
                        <span className="hidden sm:inline"> - </span>
                        <span className="block sm:inline sm:ml-0">
                            <span className="sm:hidden">to </span>
                            {format(new Date(election.stop_time), 'PPp')}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => navigate(`/election/${id}`)}>
                        View As Voter
                    </Button>
                    <Button
                        variant="outline"
                        onClick={openEditElectionModal}
                        disabled={hasStarted}
                        title={hasStarted ? 'Cannot edit after election starts' : 'Edit election details'}
                        className={hasStarted ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        <Pencil className="h-4 w-4 mr-2" />Edit Election
                    </Button>
                    <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />Delete
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
                            {election.positions?.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No positions added yet.
                                </div>
                            )}
                            {election.positions?.map((pos: any) => (
                                <div key={pos.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Position Header */}
                                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                                        <h3 className="font-semibold text-lg text-gray-900">{pos.position_name}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditPositionModal(pos)}
                                                disabled={hasStarted}
                                                className={`p-2 rounded-lg transition-colors ${hasStarted ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-primary hover:bg-white'}`}
                                                title={hasStarted ? 'Cannot edit after election starts' : 'Edit position'}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeletePositionModal(pos)}
                                                disabled={hasStarted}
                                                className={`p-2 rounded-lg transition-colors ${hasStarted ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-red-600 hover:bg-white'}`}
                                                title={hasStarted ? 'Cannot delete after election starts' : 'Delete position'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Candidates Grid */}
                                    <div className="p-4">
                                        {pos.candidates?.length === 0 && (
                                            <p className="text-gray-500 text-sm">No candidates for this position.</p>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {pos.candidates?.map((cand: any) => (
                                                <CandidateCard
                                                    key={cand.id}
                                                    candidate={cand}
                                                    isUploading={uploadingCandidateId === cand.id}
                                                    onUpload={(file) => handleCandidateImageUpload(cand.id, file)}
                                                    onEdit={() => openEditCandidateModal(cand)}
                                                    onDelete={() => openDeleteCandidateModal(cand)}
                                                    isLocked={hasStarted}
                                                />
                                            ))}
                                        </div>
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

            {/* ========== MODALS ========== */}

            {/* Delete Election Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteElection}
                title="Delete Election"
                message="Are you sure you want to delete this election? This will permanently remove all positions, candidates, and votes. This action cannot be undone."
                isDestructive
                isLoading={isDeleting}
            />

            {/* Edit Election Modal */}
            <EditModal
                isOpen={editElectionModalOpen}
                onClose={() => setEditElectionModalOpen(false)}
                onSubmit={handleEditElection}
                title="Edit Election"
                isLoading={isEditingElection}
            >
                <Input
                    label="Election Name"
                    value={editElectionData.election_name}
                    onChange={(e) => setEditElectionData(prev => ({ ...prev, election_name: e.target.value }))}
                    required
                />
                <Input
                    label="Start Time"
                    type="datetime-local"
                    value={editElectionData.start_time}
                    onChange={(e) => setEditElectionData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                />
                <Input
                    label="End Time"
                    type="datetime-local"
                    value={editElectionData.stop_time}
                    onChange={(e) => setEditElectionData(prev => ({ ...prev, stop_time: e.target.value }))}
                    required
                />
            </EditModal>

            {/* Edit Position Modal */}
            <EditModal
                isOpen={editPositionModalOpen}
                onClose={() => setEditPositionModalOpen(false)}
                onSubmit={handleEditPosition}
                title="Edit Position"
                isLoading={isEditingPosition}
            >
                <Input
                    label="Position Name"
                    value={editPositionData.position_name}
                    onChange={(e) => setEditPositionData(prev => ({ ...prev, position_name: e.target.value }))}
                    required
                />
            </EditModal>

            {/* Delete Position Modal */}
            <ConfirmationModal
                isOpen={deletePositionModalOpen}
                onClose={() => { setDeletePositionModalOpen(false); setPositionToDelete(null); }}
                onConfirm={handleDeletePosition}
                title="Delete Position"
                message={`Are you sure you want to delete "${positionToDelete?.name}"? All candidates under this position will also be removed.`}
                isDestructive
                isLoading={isDeletingPosition}
            />

            {/* Edit Candidate Modal */}
            <EditModal
                isOpen={editCandidateModalOpen}
                onClose={() => setEditCandidateModalOpen(false)}
                onSubmit={handleEditCandidate}
                title="Edit Candidate"
                isLoading={isEditingCandidate}
            >
                <Input
                    label="Full Name"
                    value={editCandidateData.fullName}
                    onChange={(e) => setEditCandidateData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                />
                <Input
                    label="Nickname (optional)"
                    value={editCandidateData.nickname}
                    onChange={(e) => setEditCandidateData(prev => ({ ...prev, nickname: e.target.value }))}
                />
                <p className="text-sm text-gray-500 mt-2">
                    To change the candidate's photo, use the camera button on the candidate card.
                </p>
            </EditModal>

            {/* Delete Candidate Modal */}
            <ConfirmationModal
                isOpen={deleteCandidateModalOpen}
                onClose={() => { setDeleteCandidateModalOpen(false); setCandidateToDelete(null); }}
                onConfirm={handleDeleteCandidate}
                title="Delete Candidate"
                message={`Are you sure you want to remove "${candidateToDelete?.name}" as a candidate?`}
                isDestructive
                isLoading={isDeletingCandidate}
            />
        </div>
    );
};

// Candidate Card with image upload, edit, and delete
interface CandidateCardProps {
    candidate: any;
    isUploading: boolean;
    onUpload: (file: File) => void;
    onEdit: () => void;
    onDelete: () => void;
    isLocked?: boolean;
}

const CandidateCard = ({ candidate, isUploading, onUpload, onEdit, onDelete, isLocked = false }: CandidateCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const candidateName = candidate.fullName || candidate.fullname || 'Unknown';

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
                <div className="relative">
                    <Avatar
                        src={candidate.candidate_picture_url}
                        fallback={candidateName}
                        size="md"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-primary hover:bg-primary-dark text-white rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Change photo"
                    >
                        {isUploading ? (
                            <Spinner className="h-3 w-3" />
                        ) : (
                            <Camera className="h-3 w-3" />
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{candidateName}</p>
                    <p className="text-xs text-gray-500">{candidate.nickname || 'No nickname'}</p>
                </div>
            </div>
            {/* Action Buttons */}
            <div className={`flex gap-1 transition-opacity ${isLocked ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                    onClick={onEdit}
                    disabled={isLocked}
                    className={`p-2 rounded-lg transition-colors ${isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-primary hover:bg-white'}`}
                    title={isLocked ? 'Cannot edit after election starts' : 'Edit candidate'}
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    disabled={isLocked}
                    className={`p-2 rounded-lg transition-colors ${isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-red-600 hover:bg-white'}`}
                    title={isLocked ? 'Cannot delete after election starts' : 'Delete candidate'}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
