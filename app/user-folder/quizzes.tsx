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

export default function QuizDashboard() {
    const router = useRouter();
    const { quizzes, loading, error } = useData();

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (loading && quizzes.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {quizzes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No quizzes available</Text>
                </View>
            ) : (
                quizzes.map((quiz) => (
                    <TouchableOpacity
                        key={quiz.id}
                        style={styles.card}
                        onPress={() =>
                            router.push({
                                pathname: '/quiz/[id]',
                                params: { id: quiz.id },
                            })
                        }
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.iconWrapper}>
                                <Text style={styles.icon}>
                                    {quiz.icons || '📘'}
                                </Text>
                            </View>

                            <View style={styles.info}>
                                <Text style={styles.title}>
                                    {quiz.title}
                                </Text>

                                <Text style={styles.meta}>
                                    {quiz.total_questions ?? 0} Questions
                                </Text>

                                {!!quiz.completed && (
                                    <View style={styles.completedBadge}>
                                        <Text style={styles.completedText}>
                                            ✓ Completed
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.arrow}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: COLORS.bg,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },

    errorContainer: {
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

    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },

    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },

    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    icon: {
        fontSize: 20,
    },

    info: {
        flex: 1,
    },

    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },

    meta: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },

    completedBadge: {
        marginTop: 6,
        backgroundColor: COLORS.successBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },

    completedText: {
        fontSize: 10,
        color: COLORS.success,
        fontWeight: '600',
    },

    arrow: {
        marginLeft: 8,
        color: COLORS.disabled,
        fontSize: 18,
    },
});