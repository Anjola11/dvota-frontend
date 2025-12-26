// types.ts or types/index.ts

export interface User {
    id: string;
    user_id?: string; // Backend sends user_id
    email: string;
    fullName: string;
    role?: 'voter' | 'admin';
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

// ✅ Fixed Election interface - backend returns 'id' not 'election_id'
export interface Election {
    id: string; // ✅ Changed from election_id
    election_name: string;
    start_time: string; // ISO datetime string
    stop_time: string;  // ISO datetime string
    created_at: string;
    creator_id: string;
    election_status?: 'upcoming' | 'active' | 'ended'; // Optional - calculated on frontend
    vote_status?: 'voted' | 'not_voted'; // Optional - from get-my-ballot endpoint
    positions?: Position[];
}

// ✅ Fixed Position interface - backend returns 'id' not 'position_id'
export interface Position {
    id: string; // ✅ Primary field from backend
    position_name: string;
    election_id: string;
    created_at: string;
    candidates: Candidate[];
    is_voted?: boolean; // Calculated on frontend after voting
}

// ✅ Fixed Candidate interface - backend returns 'id' not 'candidate_id'
export interface Candidate {
    id: string; // ✅ Primary field from backend
    fullname: string;
    nickname?: string;
    user_id: string;
    position_id: string;
    vote_count?: number; // Only present in results endpoint
    created_at: string;
    image_url?: string; // Optional candidate image
}

export interface VoteResponse {
    success: boolean;
    message: string;
}

// For the results endpoint
export interface CandidateResult {
    id: string;
    candidate_id?: string; // Alias for id in some API responses
    fullname: string;
    nickname?: string;
    vote_count: number;
}

export interface PositionResult {
    id?: string;
    position_id?: string; // Alias for id in some API responses
    position_name: string;
    candidates: CandidateResult[];
}

export interface ElectionResult {
    election_name: string;
    total_votes?: number; // Total votes across all positions
    leaderboard: PositionResult[];
}

// For get-my-ballot endpoint response
export interface BallotElection {
    election_id: string; // ✅ This endpoint DOES return election_id
    election_name: string;
    election_status: 'upcoming' | 'active' | 'ended';
    vote_status: 'voted' | 'not_voted';
    start_time: string;
    stop_time: string;
    creator_id: string; // ✅ Added field
}