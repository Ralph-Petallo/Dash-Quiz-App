import { COLORS } from '@/constants/colors';
import useData from '@/hooks/useData';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ── Difficulty bars (3 bars, green, like the screenshot) ──────────────────────
function DifficultyBars() {
    return (
        <View style={barStyles.wrap}>
            <View style={[barStyles.bar, { height: 5 }]} />
            <View style={[barStyles.bar, { height: 8 }]} />
            <View style={[barStyles.bar, { height: 11 }]} />
        </View>
    );
}

const barStyles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        marginLeft: 6,
    },
    bar: {
        width: 4,
        backgroundColor: '#22c55e',
        borderRadius: 2,
    },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function QuizDashboard() {
    const router = useRouter();
    // Expect useData to optionally expose a `subject` object: { title, subtitle, icon }
    const { quizzes, error, loadingQuizzes } = useData();

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (loadingQuizzes && quizzes.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Subject header ── */}
            <View style={styles.subjectHeader}>
                <View style={styles.subjectIconWrap}>
                    <Text style={styles.subjectIcon}>
                        {'🖥️'}
                    </Text>
                </View>
                <View style={styles.subjectInfo}>
                    <Text style={styles.subjectTitle} numberOfLines={2}>
                        {'Quiz Dashboard'}
                    </Text>
                    <Text style={styles.subjectSubtitle}>
                        {'Select a competency to begin your assessment'}
                    </Text>
                </View>
            </View>

            {/* ── Quiz list ── */}
            {quizzes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No quizzes available</Text>
                </View>
            ) : (
                quizzes.map((quiz: any, index) => (
                    <TouchableOpacity
                        key={quiz.id}
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => router.replace({
                            pathname: "/quiz/[id]",
                            params: { id: quiz.id }
                        })}
                    >
                        <View style={styles.cardContent}>
                            {/* Left icon */}
                            <View style={styles.iconWrapper}>
                                <Text style={styles.icon}>
                                    {quiz.icons || '📘'}
                                </Text>
                            </View>

                            {/* Info */}
                            <View style={styles.info}>
                                <Text style={styles.title} numberOfLines={2}>
                                    {quiz.title}
                                </Text>

                                <View style={styles.metaRow}>
                                    <Text style={styles.metaIcon}>≡</Text>
                                    <Text style={styles.meta}>
                                        {quiz.total_questions ?? 0} Questions
                                    </Text>
                                    <DifficultyBars />
                                </View>

                                {!!quiz.completed && (
                                    <View style={styles.completedBadge}>
                                        <Text style={styles.completedText}>✓ Completed</Text>
                                    </View>
                                )}
                            </View>

                            {/* Arrow */}
                            <Text style={styles.arrow}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )
            }
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 32,
        backgroundColor: COLORS.bg,
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },

    errorText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: '600',
    },

    /* ── Subject header ── */
    subjectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#ede9fe',
    },
    subjectIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    subjectIcon: {
        fontSize: 26,
    },
    subjectInfo: {
        flex: 1,
    },
    subjectTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    subjectSubtitle: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 17,
    },

    /* ── Cards ── */
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ede9fe',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },

    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    icon: {
        fontSize: 22,
    },

    info: {
        flex: 1,
    },

    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 5,
        lineHeight: 20,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    metaIcon: {
        fontSize: 13,
        color: '#94a3b8',
        marginRight: 4,
    },

    meta: {
        fontSize: 12,
        color: '#64748b',
    },

    completedBadge: {
        marginTop: 6,
        backgroundColor: COLORS.successBg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },

    completedText: {
        fontSize: 10,
        color: COLORS.success,
        fontWeight: '600',
    },

    arrow: {
        marginLeft: 10,
        color: '#94a3b8',
        fontSize: 22,
        fontWeight: '300',
    },

    /* ── Empty ── */
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
});