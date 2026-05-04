// screens/quiz-result.tsx
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { useLocalSearchParams, useRouter } from 'expo-router';

export default function QuizResultScreen() {
    const router = useRouter()
    const { score, total, quizId } = useLocalSearchParams()
    const justId = Array.isArray(quizId) ? quizId[0] : quizId;

    const parsedScore = Number(score)
    const parsedTotal = Number(total)
    const percentage = Math.round((parsedScore / parsedTotal) * 100)

    const progressAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: percentage / 100,
            duration: 800,
            useNativeDriver: false,
        }).start()
    }, [])

    const getMessage = () => {
        if (percentage >= 80) return 'Excellent work! You really nailed it!'
        if (percentage >= 50) return 'Good effort! Keep pushing forward.'
        return 'Keep practicing. Consistency is the key to mastery!'
    }

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    })

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f3" />

            <View style={s.screen}>
                <View style={s.card}>

                    <Text style={s.emoji}>🎉</Text>

                    <Text style={s.label}>ASSESSMENT COMPLETE</Text>

                    <Text style={s.percentage}>{percentage}%</Text>

                    <Text style={s.scoreText}>
                        You scored{' '}
                        <Text style={s.scoreHighlight}>{parsedScore}</Text>
                        {' '}out of{' '}
                        <Text style={s.scoreHighlight}>{parsedTotal}</Text>
                    </Text>

                    <View style={s.progressTrack}>
                        <Animated.View style={[s.progressFill, { width: progressWidth }]} />
                    </View>

                    <Text style={s.message}>{getMessage()}</Text>

                    <TouchableOpacity
                        style={s.btnPrimary}
                        onPress={() => router.replace('../user-folder')}
                        activeOpacity={0.85}
                    >
                        <Text style={s.btnPrimaryText}>Go to Dashboard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.btnSecondary}
                        onPress={() => router.replace({
                            pathname: "/quiz/[id]",
                            params: { id: justId }
                        })}
                        activeOpacity={0.85}
                    >
                        <Text style={s.btnSecondaryText}>Try Again</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </SafeAreaView>
    )
}

const PURPLE = '#4b32a8'

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f5f5f3' },
    screen: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    card: { width: '100%', backgroundColor: '#ffffff', borderRadius: 24, paddingVertical: 36, paddingHorizontal: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 },
    emoji: { fontSize: 48, marginBottom: 16 },
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: '#8e8eb2', marginBottom: 8 },
    percentage: { fontSize: 64, fontWeight: '700', color: '#1a1a1a', lineHeight: 72, marginBottom: 8 },
    scoreText: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
    scoreHighlight: { fontWeight: '700', color: '#1a1a1a' },
    progressTrack: { width: '100%', height: 6, backgroundColor: '#f0edff', borderRadius: 100, overflow: 'hidden', marginBottom: 16 },
    progressFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 100 },
    message: { fontSize: 13, color: '#6b7280', fontStyle: 'italic', textAlign: 'center', lineHeight: 20, marginBottom: 28, paddingHorizontal: 8 },
    btnPrimary: { width: '100%', paddingVertical: 15, backgroundColor: '#1a1a2e', borderRadius: 100, alignItems: 'center', marginBottom: 10 },
    btnPrimaryText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
    btnSecondary: { width: '100%', paddingVertical: 15, backgroundColor: 'transparent', borderRadius: 100, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
    btnSecondaryText: { color: '#1a1a1a', fontSize: 15, fontWeight: '700' },
})