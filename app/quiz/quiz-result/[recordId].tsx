import api from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = '#4f46e5';
const GREEN = '#16a34a';
const RED = '#dc2626';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

const getMessage = (pct: number) => {
    if (pct >= 90) return 'Outstanding performance!'
    if (pct >= 75) return 'You are NC II ready!'
    if (pct >= 50) return 'Good progress. Keep improving.'
    return 'Needs more practice.'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const AnalyticsRow = ({ label, value, valueStyle }: {
    label: string
    value: string
    valueStyle?: any
}) => (
    <View style={s.analyticsRow}>
        <Text style={s.analyticsLabel}>{label}</Text>
        <Text style={[s.analyticsValue, valueStyle]}>{value}</Text>
    </View>
)

const BulletList = ({ title, items, color }: {
    title: string
    items: string[]
    color?: string
}) => {
    if (!items.length) return null
    return (
        <View style={s.section}>
            <Text style={[s.sectionTitle, color ? { color } : {}]}>{title}</Text>
            {items.map((item, i) => (
                <Text key={i} style={s.listText}>• {item}</Text>
            ))}
        </View>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function QuizResultScreen() {
    const router = useRouter()

    // ✅ matches what QuizScreen passes: { recordId: String(recordId) }
    const { recordId } = useLocalSearchParams<{ recordId: string }>()

    const justRecordId = Array.isArray(recordId) ? Number(recordId[0]) : Number(recordId)

    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const progressAnim = useRef(new Animated.Value(0)).current

    // ─── Fetch ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!justRecordId) return

        const fetchResult = async () => {
            try {
                setLoading(true)
                const res = await api.get(`/quiz/result/${justRecordId}`)
                const data = res.data

                const percentage = Math.round((data.score / data.total_questions) * 100)

                setResult({
                    ...data,
                    percentage,
                    passed: percentage >= 75,
                })
            } catch (e) {
                console.error('Quiz result fetch error:', e)
            } finally {
                setLoading(false)
            }
        }

        fetchResult()
    }, [justRecordId])

    // ─── Progress bar animation ──────────────────────────────────────────────

    useEffect(() => {
        if (!result) return
        Animated.timing(progressAnim, {
            toValue: result.percentage / 100,
            duration: 900,
            useNativeDriver: false,
        }).start()
    }, [result])

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    })

    // ─── States ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={PURPLE} />
            </View>
        )
    }

    if (!result) {
        return (
            <View style={s.center}>
                <Text style={s.emptyText}>No quiz result found.</Text>
            </View>
        )
    }

    // ─── Destructure ─────────────────────────────────────────────────────────────

    const {
        percentage,
        score,
        total_questions,
        passed,
        elapsed_time: elapsed = 0,
        strengths = [],
        weaknesses = [],
        recommendations = [],
        quiz_id,
    } = result

    // ─── UI ──────────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.card}>

                    {/* Emoji + label */}
                    <Text style={s.emoji}>{passed ? '🎉' : '📚'}</Text>
                    <Text style={s.label}>QUIZ RESULT</Text>

                    {/* Score */}
                    <Text style={s.percentage}>{percentage}%</Text>
                    <Text style={s.scoreText}>
                        Score: <Text style={s.scoreHighlight}>{score}</Text> / {total_questions}
                    </Text>

                    {/* Progress bar */}
                    <View style={s.progressTrack}>
                        <Animated.View style={[s.progressFill, { width: progressWidth }]} />
                    </View>

                    {/* Analytics card */}
                    <View style={s.analyticsCard}>
                        <Text style={s.analyticsTitle}>Performance Analytics</Text>

                        <AnalyticsRow
                            label="Status"
                            value={passed ? 'PASSED' : 'FAILED'}
                            valueStyle={{ color: passed ? GREEN : RED, fontWeight: '700' }}
                        />
                        <AnalyticsRow
                            label="Readiness"
                            value={percentage >= 75 ? 'NC II Ready' : 'Needs Practice'}
                            valueStyle={{ fontWeight: '600' }}
                        />
                        <AnalyticsRow
                            label="Time"
                            value={formatTime(elapsed)}
                        />
                    </View>

                    {/* Strengths / Weaknesses / Recommendations */}
                    <BulletList title="Strengths" items={strengths} color={GREEN} />
                    <BulletList title="Weak Areas" items={weaknesses} color={RED} />
                    <BulletList title="Recommendations" items={recommendations} />

                    {/* Message */}
                    <Text style={s.message}>{getMessage(percentage)}</Text>

                    {/* Buttons */}
                    <TouchableOpacity
                        style={s.btnPrimary}
                        onPress={() => router.replace('/user-folder')}
                        activeOpacity={0.85}
                    >
                        <Text style={s.btnPrimaryText}>Go to Dashboard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.btnSecondary}
                        onPress={() =>
                            router.replace({
                                pathname: '/quiz/[id]',
                                params: { id: String(quiz_id) },
                            })
                        }
                        activeOpacity={0.85}
                    >
                        <Text style={s.btnSecondaryText}>Try Again</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    scroll: { padding: 20, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 14, color: '#64748b' },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: PURPLE,
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },

    // Header
    emoji: { fontSize: 48, textAlign: 'center' },
    label: { textAlign: 'center', marginTop: 12, color: '#64748b', fontWeight: '600', letterSpacing: 0.8, fontSize: 11 },
    percentage: { textAlign: 'center', fontSize: 56, fontWeight: '800', color: '#0f172a', marginVertical: 8 },
    scoreText: { textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 4 },
    scoreHighlight: { fontWeight: '700', color: '#111827' },

    // Progress
    progressTrack: { height: 8, borderRadius: 999, backgroundColor: '#e5e7eb', overflow: 'hidden', marginVertical: 20 },
    progressFill: { height: '100%', backgroundColor: PURPLE },

    // Analytics
    analyticsCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#f0edff' },
    analyticsTitle: { fontWeight: '700', color: '#0f172a', marginBottom: 12, fontSize: 14 },
    analyticsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    analyticsLabel: { fontSize: 13, color: '#64748b' },
    analyticsValue: { fontSize: 13, color: '#0f172a' },

    // Lists
    section: { marginBottom: 18 },
    sectionTitle: { fontWeight: '700', color: '#0f172a', marginBottom: 8, fontSize: 14 },
    listText: { color: '#475569', marginBottom: 4, fontSize: 13, lineHeight: 20 },

    // Message
    message: { textAlign: 'center', color: '#64748b', marginBottom: 24, fontStyle: 'italic', fontSize: 13 },

    // Buttons — same radius/padding as QuizScreen btn
    btnPrimary: { backgroundColor: '#111827', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
    btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    btnSecondary: { borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    btnSecondaryText: { fontWeight: '700', fontSize: 15, color: '#0f172a' },
})