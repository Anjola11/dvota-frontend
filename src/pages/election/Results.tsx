import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Download, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import api from '@/lib/axios';
import { ElectionResult } from '@/types';

const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export const Results = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [results, setResults] = useState<ElectionResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        fetchResults();

        // Auto-refresh every 10s
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchResults(true);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchResults = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const response = await api.get(`/elections/get-election-result/${id}`);
            if (response.data.success) {
                setResults(response.data.data);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error(error.response?.data?.message || 'Access Denied: Only the election creator can view results.');
                navigate('/dashboard');
            } else {
                if (!silent) toast.error(error.response?.data?.message || 'Failed to load results');
            }
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const handleExportPDF = () => {
        if (!results) return;
        setIsExporting(true);

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(124, 58, 237); // Primary color
            doc.text(results.election_name, 14, 22);

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Election Results Report`, 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

            let yPos = 45;

            results.leaderboard.forEach((position) => {
                // New page if not enough space
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(16);
                doc.setTextColor(0);
                doc.text(position.position_name, 14, yPos);
                yPos += 10;

                const tableData = position.candidates
                    .sort((a, b) => b.vote_count - a.vote_count)
                    .map((c, i) => [
                        i + 1,
                        c.fullname + (c.nickname ? ` ("${c.nickname}")` : ''),
                        c.vote_count,
                        ((c.vote_count / (results.total_votes || 1)) * 100).toFixed(1) + '%' // simplified % calculation, ideally per position total
                    ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [['Rank', 'Candidate', 'Votes', 'Percentage']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [124, 58, 237] },
                });

                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 20;
            });

            doc.save(`${results.election_name.replace(/\s+/g, '_')}_results.pdf`);
            toast.success('Report downloaded successfully');
        } catch (e) {
            console.error(e);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) return <FullPageSpinner />;

    if (!results) return (
        <EmptyState
            title="No Results Available"
            message="Could not load election results."
            action={<Button onClick={() => navigate('/dashboard')}>Go Back</Button>}
        />
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="-ml-2 mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">{results.election_name} <span className="text-gray-400 font-normal">Results</span></h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => fetchResults()} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button variant="primary" onClick={handleExportPDF} disabled={isExporting} className="gap-2">
                        {isExporting ? <span className="animate-spin">⌛</span> : <Download className="h-4 w-4" />}
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Results by Position */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {results.leaderboard.map((position) => {
                    const sortedCandidates = position.candidates.sort((a, b) => b.vote_count - a.vote_count);
                    const totalPositionVotes = position.candidates.reduce((acc, c) => acc + c.vote_count, 0);
                    const winner = sortedCandidates[0];

                    return (
                        <div key={position.position_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">{position.position_name}</h3>
                                <span className="text-sm text-gray-500">{totalPositionVotes} votes total</span>
                            </div>

                            {/* Chart */}
                            <div className="h-64 w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={position.candidates} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="fullname" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="vote_count" radius={[0, 4, 4, 0]}>
                                            {position.candidates.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.candidate_id === winner?.candidate_id ? COLORS[0] : '#9CA3AF'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Leaderboard Table */}
                            <div className="space-y-3">
                                {sortedCandidates.map((candidate, i) => (
                                    <div key={candidate.candidate_id} className={`flex items-center p-3 rounded-lg ${i === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-gray-50'}`}>
                                        <div className="flex-shrink-0 w-8 text-center font-bold text-gray-500">
                                            {i === 0 ? <Trophy className="h-5 w-5 text-yellow-500 mx-auto" /> : `#${i + 1}`}
                                        </div>
                                        <Avatar
                                            src={(candidate as any).candidate_picture_url}
                                            fallback={candidate.fullname}
                                            size="sm"
                                            className="ml-2"
                                        />
                                        <div className="flex-1 min-w-0 px-3">
                                            <p className={`text-sm font-medium ${i === 0 ? 'text-primary' : 'text-gray-900'} truncate`}>
                                                {candidate.fullname}
                                            </p>
                                            <p className="text-xs text-gray-500">{candidate.vote_count} votes</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-700">
                                            {totalPositionVotes > 0 ? ((candidate.vote_count / totalPositionVotes) * 100).toFixed(1) : 0}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
