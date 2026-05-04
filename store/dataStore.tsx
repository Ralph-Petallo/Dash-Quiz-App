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
    total_questions: number;
    quiz_title: string;
    quiz_description: string;
    created_at: string;
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

    error: string | null;

    onQuizCompleted: (quizId: number, data: Partial<Quiz>) => Promise<void>;
    fetchQuizzes: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchRecords: () => Promise<void>;
    fetchLeaderboard: () => Promise<void>;

    updateQuizData: (quizId: number, data: Partial<Quiz>) => void;
    refetchAll: () => Promise<void>;
};

/* ───────────────────────── CONTEXT ───────────────────────── */

export const DataContext = createContext<DataContextType>({
    quizzes: [],
    stats: null,
    records: [],
    leaders: [],

    loadingQuizzes: false,
    loadingStats: false,
    loadingLeaderboard: false,

    error: null,

    onQuizCompleted: async () => { },
    fetchQuizzes: async () => { },
    fetchStats: async () => { },
    fetchRecords: async () => { },
    fetchLeaderboard: async () => { },

    updateQuizData: () => { },
    refetchAll: async () => { },
});

/* ───────────────────────── PROVIDER ───────────────────────── */

const icons = ['💻', '🖥️', '⚙️', '📱', '🔧', '🎯'];

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [leaders, setLeaders] = useState<Leader[]>([]);

    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const { user } = useContext(AuthContext);

    /* ───────── QUIZZES ───────── */
    const fetchQuizzes = useCallback(async () => {
        try {
            setLoadingQuizzes(true);

            const res = await api.get('/quizzes');
            const data = res.data.data || [];

            const enriched = data.map((quiz: Quiz, i: number) => ({
                ...quiz,
                total_questions: quiz.questions ? quiz.questions.length : 10,
                icons: icons[i % icons.length],
            }));
            console.log(enriched)

            setQuizzes(enriched);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingQuizzes(false);
        }
    }, []);

    /* ───────── STATS ───────── */
    const fetchStats = useCallback(async () => {
        try {
            setLoadingStats(true);

            const res = await api.get('/stats');
            setStats(res.data.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingStats(false);
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

    /* ───────── LEADERBOARD ───────── */
    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoadingLeaderboard(true);

            const res = await api.get('/dashboard/leaderboard');
            const data = res.data.data || [];

            const mapped = data.map((item: any, index: number) => ({
                ...item,
                id: `${item.user_id}-${index}`,
                isYou: item.user_id === user?.id,
            }));

            setLeaders(mapped);
        } catch (e) {
            console.log('Leaderboard error:', e);
        } finally {
            setLoadingLeaderboard(false);
        }
    }, [user]);

    /* ───────── UPDATE QUIZ ───────── */
    const updateQuizData = useCallback((quizId: number, data: Partial<Quiz>) => {
        setQuizzes(prev =>
            prev.map(q =>
                q.id === quizId
                    ? { ...q, ...data, completed: true }
                    : q
            )
        );
    }, []);

    /* ───────── QUIZ COMPLETED ───────── */
    const onQuizCompleted = useCallback(async (quizId: number, data: Partial<Quiz>) => {
        updateQuizData(quizId, data);

        await Promise.allSettled([
            fetchStats(),
            fetchRecords(),
            fetchLeaderboard(),
        ]);
    }, [updateQuizData, fetchStats, fetchRecords, fetchLeaderboard]);

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

                loadingQuizzes,
                loadingStats,
                loadingLeaderboard,

                error,

                fetchQuizzes,
                fetchStats,
                fetchRecords,
                fetchLeaderboard,

                updateQuizData,
                onQuizCompleted,
                refetchAll,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}