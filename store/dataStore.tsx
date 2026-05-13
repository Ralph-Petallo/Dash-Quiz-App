import api from '@/services/api';
import { AuthContext } from '@/store/authStore';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Quiz = {
    id: number;
    title: string;
    description?: string;
    total_questions?: number;
    questions_count?: number;
    icons?: string;
    difficulty?: string;
    completed?: boolean;
};

export type UserStats = {
    total_quizzes: number;
    completed_quizzes: number;
    average_score: number;
    total_attempts: number;
};

export type RecordItem = {
    id?: number;
    quiz_id: number;
    score: number;
    total_questions: number;
    percentage?: number;
    passed?: boolean;
    quiz_title: string;
    quiz_description?: string;
    created_at: string;
    elapsed_time?: number;
};

export type Leader = {
    id: string;
    name: string;
    score: number;
    profile_photo?: string;
    quiz_title: string;
    user_id: number;
    completed_at?: string;
    isYou: boolean;
};

export type DataContextType = {
    quizzes: Quiz[];
    stats: UserStats | null;
    records: RecordItem[];
    leaders: Leader[];
    loadingQuizzes: boolean;
    loadingStats: boolean;
    loadingLeaderboard: boolean;
    loadingRecords: boolean;
    error: string | null;

    onQuizCompleted: (quizId: number, data: Partial<Quiz>) => Promise<void>;
    fetchQuizzes: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchRecords: () => Promise<void>;
    fetchLeaderboard: () => Promise<void>;
    updateQuizData: (quizId: number, data: Partial<Quiz>) => void;
    refetchAll: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

export const DataContext = createContext<DataContextType>({
    quizzes: [],
    stats: null,
    records: [],
    leaders: [],
    loadingQuizzes: false,
    loadingStats: false,
    loadingLeaderboard: false,
    loadingRecords: false,
    error: null,
    onQuizCompleted: async () => { },
    fetchQuizzes: async () => { },
    fetchStats: async () => { },
    fetchRecords: async () => { },
    fetchLeaderboard: async () => { },
    updateQuizData: () => { },
    refetchAll: async () => { },
});

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICONS = ['💻', '🖥️', '⚙️', '📱', '🔧', '🎯'];

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useContext(AuthContext);

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [leaders, setLeaders] = useState<Leader[]>([]);

    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Quizzes ──────────────────────────────────────────────────────────────

    const fetchQuizzes = useCallback(async () => {
        try {
            setLoadingQuizzes(true);
            const res = await api.get('/quizzes');
            const { data } = res.data || [];

            setQuizzes(
                data.map((quiz: any, i: number) => ({
                    ...quiz,
                    icons: ICONS[i % ICONS.length],
                }))
            );
        } catch (e) {
            console.error('Quiz fetch error:', e);
            setError('Failed to load quizzes');
        } finally {
            setLoadingQuizzes(false);
        }
    }, []);

    // ─── Stats ────────────────────────────────────────────────────────────────

    const fetchStats = useCallback(async () => {
        try {
            setLoadingStats(true);
            const res = await api.get('/stats');
            setStats(res.data.data || null);
        } catch (e) {
            console.error('Stats fetch error:', e);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    // ─── Records ──────────────────────────────────────────────────────────────

    const fetchRecords = useCallback(async () => {
        try {
            setLoadingRecords(true);
            const res = await api.get('/records');
            setRecords(res.data.data || res.data.results || []);
        } catch (e) {
            console.error('Records fetch error:', e);
        } finally {
            setLoadingRecords(false);
        }
    }, []);

    // ─── Leaderboard ──────────────────────────────────────────────────────────

    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoadingLeaderboard(true);
            const res = await api.get('/dashboard/leaderboard');
            const data = res.data.data || [];

            setLeaders(
                data.map((item: any, index: number) => ({
                    ...item,
                    id: `${item.user_id}-${index}`,
                    isYou: item.user_id === user?.id,
                }))
            );
        } catch (e) {
            console.error('Leaderboard fetch error:', e);
        } finally {
            setLoadingLeaderboard(false);
        }
    }, [user]);

    // ─── Update quiz locally ──────────────────────────────────────────────────

    const updateQuizData = useCallback((quizId: number, data: Partial<Quiz>) => {
        setQuizzes(prev =>
            prev.map(q => q.id === quizId ? { ...q, ...data, completed: true } : q)
        );
    }, []);

    // ─── On quiz completed ────────────────────────────────────────────────────

    const onQuizCompleted = useCallback(async (quizId: number, data: Partial<Quiz>) => {
        updateQuizData(quizId, data);
        await Promise.allSettled([
            fetchStats(),
            fetchRecords(),
            fetchLeaderboard(),
        ]);
    }, [updateQuizData, fetchStats, fetchRecords, fetchLeaderboard]);

    // ─── Refetch all ──────────────────────────────────────────────────────────

    const refetchAll = useCallback(async () => {
        await Promise.all([
            fetchQuizzes(),
            fetchStats(),
            fetchRecords(),
            fetchLeaderboard(),
        ]);
    }, [fetchQuizzes, fetchStats, fetchRecords, fetchLeaderboard]);

    // ─── Auto load ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (user) refetchAll();
    }, [user]);

    // ─── Clear on logout ──────────────────────────────────────────────────────

    useEffect(() => {
        if (!user) {
            setQuizzes([]);
            setStats(null);
            setRecords([]);
            setLeaders([]);
        }
    }, [user]);

    return (
        <DataContext.Provider value={{
            quizzes, stats, records, leaders,
            loadingQuizzes, loadingStats, loadingLeaderboard, loadingRecords,
            error,
            fetchQuizzes, fetchStats, fetchRecords, fetchLeaderboard,
            updateQuizData, onQuizCompleted, refetchAll,
        }}>
            {children}
        </DataContext.Provider>
    );
}