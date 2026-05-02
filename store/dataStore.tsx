import api from '@/services/api';
import { AuthContext } from '@/store/authStore';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';

/* ───────────────────────── TYPES ───────────────────────── */

export type Quiz = {
    id: number;
    title: string;
    description?: string;
    questions?: any[];
    total_questions?: number;
    icons?: string;
    difficulty?: string;
    attempts?: number;
    completed?: boolean;
};

export type UserStats = {
    total_quizzes: number;
    completed_quizzes: number;
    average_score: number;
    total_attempts: number;
};

export type RecordItem = {
    quiz_id: number;
    score: number;
    quiz_title: string;
    quiz_description: string;
    created_at: string;
};

export type Leader = {
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
    leaders: Leader[]; // ✅ NEW

    loading: boolean;
    error: string | null;

    fetchQuizzes: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchRecords: () => Promise<void>;
    fetchLeaderboard: () => Promise<void>; // ✅ NEW

    updateQuizData: (quizId: number, data: Partial<Quiz>) => void;
    refetchAll: () => Promise<void>;
};

/* ───────────────────────── CONTEXT ───────────────────────── */

export const DataContext = createContext<DataContextType>({
    quizzes: [],
    stats: null,
    records: [],
    leaders: [],

    loading: false,
    error: null,

    fetchQuizzes: async () => {},
    fetchStats: async () => {},
    fetchRecords: async () => {},
    fetchLeaderboard: async () => {},

    updateQuizData: () => {},
    refetchAll: async () => {},
});

/* ───────────────────────── PROVIDER ───────────────────────── */

const icons = ['💻', '🖥️', '⚙️', '📱', '🔧', '🎯'];

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [leaders, setLeaders] = useState<Leader[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useContext(AuthContext);

    /* ───────── QUIZZES ───────── */
    const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/quizzes');
            const data = res.data.data || [];

            const enriched = data.map((quiz: Quiz, i: number) => ({
                ...quiz,
                total_questions: quiz.questions ? quiz.questions.length : 10,
                icons: icons[i % icons.length],
            }));

            setQuizzes(enriched);
        } finally {
            setLoading(false);
        }
    }, []);

    /* ───────── STATS ───────── */
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/stats');
            setStats(res.data.data);
        } catch (e) {
            console.log(e);
        }
    }, []);

    /* ───────── RECORDS ───────── */
    const fetchRecords = useCallback(async () => {
        try {
            const res = await api.get('/records');
            setRecords(res.data.results || []);
        } catch (e) {
            console.log(e);
        }
    }, []);

    /* ───────── LEADERBOARD (FIXED) ───────── */
    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoading(true);

            const res = await api.get('/dashboard/leaderboard');
            const data = res.data.data || [];

            const seen = new Set<number>();

            const unique = data
                .filter((item: any) => {
                    if (seen.has(item.user_id)) return false;
                    seen.add(item.user_id);
                    return true;
                })
                .map((item: any) => ({
                    ...item,
                    isYou: item.name === user?.full_name,
                }));

            setLeaders(unique);
        } catch (e) {
            console.log('Leaderboard error:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    /* ───────── UPDATE QUIZ ───────── */
    const updateQuizData = useCallback((quizId: number, data: Partial<Quiz>) => {
        setQuizzes(prev =>
            prev.map(q =>
                q.id === quizId ? { ...q, ...data, completed: true } : q
            )
        );
    }, []);

    /* ───────── REFRESH ALL ───────── */
    const refetchAll = useCallback(async () => {
        await Promise.all([
            fetchQuizzes(),
            fetchStats(),
            fetchRecords(),
            fetchLeaderboard(),
        ]);
    }, [fetchQuizzes, fetchStats, fetchRecords, fetchLeaderboard]);

    /* ───────── AUTO LOAD ───────── */
    useEffect(() => {
        if (user) {
            fetchQuizzes();
            fetchStats();
            fetchRecords();
            fetchLeaderboard();
        }
    }, [user]);

    /* ───────── CLEAR ON LOGOUT ───────── */
    useEffect(() => {
        if (!user) {
            setQuizzes([]);
            setStats(null);
            setRecords([]);
            setLeaders([]);
        }
    }, [user]);

    return (
        <DataContext.Provider
            value={{
                quizzes,
                stats,
                records,
                leaders,

                loading,
                error,

                fetchQuizzes,
                fetchStats,
                fetchRecords,
                fetchLeaderboard,

                updateQuizData,
                refetchAll,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}