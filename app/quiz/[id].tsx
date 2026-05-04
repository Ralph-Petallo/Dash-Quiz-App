import useData from '@/hooks/useData';
import api from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function QuizScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const { onQuizCompleted } = useData();

    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const currentQuestion = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    // ─── Fetch ────────────────────────────────────────────────────────────────

    const fetchQuiz = async () => {
        try {
            const res = await api.get(`/quiz/${Number(id)}`)
            setQuiz(res.data.quiz)
            setQuestions(res.data.quiz.questions || [])
        } catch (e) {
            console.error("Quiz fetch error:", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchQuiz() }, [])

    // ─── Submit answer ────────────────────────────────────────────────────────

    const submitAnswer = async () => {
        if (selected === null) return

        try {
            const res = await api.post("/quiz/answer", {
                question_id: currentQuestion.id,
                answer_id: selected,
            })

            const nextScore = res.data.correct ? score + 1 : score
            setScore(nextScore)
            setSelected(null)

            if (!isLast) {
                setCurrentIndex((prev) => prev + 1)
            } else {
                await finishQuiz(nextScore)
            }
        } catch (e) {
            console.error("Answer submit error:", e)
        }
    }

    // ─── Finish ───────────────────────────────────────────────────────────────

    const finishQuiz = async (finalScore: number) => {
        try {
            await api.post("/quiz/result", {
                quiz_id: Number(id),
                score: finalScore,
            })
            // refresh leaderboard + stats + records + mark quiz complete locally
            await onQuizCompleted(Number(id), { completed: true });
        } catch (e) {
            console.error("Result submit error:", e)
        } finally {
            router.replace({
                pathname: "./quiz-result",
                params: {
                    score: finalScore,
                    total: questions.length,
                    quizId: id ?? '',
                },
            })
        }
    }

    // ─── States ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#4b32a8" />
                <Text style={s.loadingText}>Preparing your questions...</Text>
            </View>
        )
    }

    if (!currentQuestion) {
        return (
            <View style={s.center}>
                <Text style={s.emptyText}>No questions available.</Text>
            </View>
        )
    }

    // ─── UI ───────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.container}>

                {/* Progress */}
                <View style={s.progressRow}>
                    <Text style={s.progressLabel}>
                        Question {currentIndex + 1} of {questions.length}
                    </Text>
                    <Text style={s.scoreLabel}>Score: {score}</Text>
                </View>

                <View style={s.progressTrack}>
                    <View
                        style={[
                            s.progressFill,
                            { width: `${((currentIndex + 1) / questions.length) * 100}%` },
                        ]}
                    />
                </View>

                {/* Question */}
                <View style={s.questionBox}>
                    <Text style={s.questionText}>{currentQuestion.text}</Text>
                </View>

                {/* Options */}
                {currentQuestion.options.map((opt: any, index: number) => {
                    const isSelected = selected === opt.id
                    return (
                        <TouchableOpacity
                            key={opt.id}
                            onPress={() => setSelected(opt.id)}
                            style={[s.option, isSelected && s.optionSelected]}
                            activeOpacity={0.75}
                        >
                            <View style={[s.optionBadge, isSelected && s.optionBadgeSelected]}>
                                <Text style={[s.optionBadgeText, isSelected && s.optionBadgeTextSelected]}>
                                    {String.fromCharCode(65 + index)}
                                </Text>
                            </View>
                            <Text style={[s.optionText, isSelected && s.optionTextSelected]}>
                                {opt.text}
                            </Text>
                        </TouchableOpacity>
                    )
                })}

                {/* Submit button */}
                <TouchableOpacity
                    style={[s.btn, selected === null && s.btnDisabled]}
                    onPress={submitAnswer}
                    disabled={selected === null}
                    activeOpacity={0.85}
                >
                    <Text style={s.btnText}>
                        {isLast ? "Finish Quiz" : "Next"}
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const PURPLE = "#4b32a8"

const s = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f5f5f3",
    },
    container: {
        flex: 1,
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#6b7280",
    },

    // Progress
    progressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8e8eb2",
        letterSpacing: 0.4,
    },
    scoreLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: PURPLE,
    },
    progressTrack: {
        width: "100%",
        height: 5,
        backgroundColor: "#f0edff",
        borderRadius: 100,
        overflow: "hidden",
        marginBottom: 24,
    },
    progressFill: {
        height: "100%",
        backgroundColor: PURPLE,
        borderRadius: 100,
    },

    // Question
    questionBox: {
        backgroundColor: "#1a1a2e",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    questionText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
        lineHeight: 26,
    },

    // Options
    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 10,
    },
    optionSelected: {
        borderColor: PURPLE,
        backgroundColor: "#eeedfe",
    },
    optionBadge: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    optionBadgeSelected: {
        backgroundColor: PURPLE,
    },
    optionBadgeText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6b7280",
    },
    optionBadgeTextSelected: {
        color: "#ffffff",
    },
    optionText: {
        fontSize: 15,
        color: "#1a1a1a",
        flex: 1,
        lineHeight: 22,
    },
    optionTextSelected: {
        color: PURPLE,
        fontWeight: "600",
    },

    // Button
    btn: {
        marginTop: "auto",
        backgroundColor: "#1a1a2e",
        paddingVertical: 15,
        borderRadius: 100,
        alignItems: "center",
    },
    btnDisabled: {
        opacity: 0.4,
    },
    btnText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },
})