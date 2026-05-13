import useData from '@/hooks/useData';
import api from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function QuizScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const {
        onQuizCompleted,
    } = useData();

    const quizId = Number(id);

    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const currentQuestion =
        questions[currentIndex];

    const isLast =
        currentIndex ===
        questions.length - 1;

    /* ───────────────── TIMER ───────────────── */

    useEffect(() => {
        if (loading || !questions.length)
            return;

        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () =>
            clearInterval(timer);
    }, [loading, questions.length]);

    /* ───────────────── FETCH QUIZ ───────────────── */

    const fetchQuiz = async () => {
        try {
            setLoading(true);

            const res = await api.get(`/quiz/${quizId}`);

            const quizData = res.data.quiz;

            setQuiz(quizData);
            setQuestions(quizData.questions || []);
            console.log('Quiz data:', quizData);
        } catch (error: any) {
            console.error(
                'Quiz fetch error:',
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, []);

    /* ───────────────── SUBMIT ANSWER ───────────────── */

    const submitAnswer = async () => {
        if (selected === null || submitting)
            return;

        try {
            setSubmitting(true);

            const res = await api.post(
                '/quiz/answer',
                {
                    question_id: currentQuestion.id,
                    answer_id: selected,
                }
            );

            const isCorrect = res.data.correct;
            const nextScore = isCorrect ? score + 1 : score;

            // save attempt locally
            setAnswers(prev => [
                ...prev,
                {
                    question_id:
                        currentQuestion.id,
                    answer_id:
                        selected,
                },
            ]);

            setScore(nextScore);
            setSelected(null);

            if (!isLast) {
                setCurrentIndex(prev => prev + 1);
                return;
            }

            await finishQuiz(nextScore);
        } catch (e) {
            console.error(
                'Answer submit error:',
                e
            );
        } finally {
            setSubmitting(false);
        }
    };

    /* ───────────────── FINISH QUIZ ───────────────── */

    const finishQuiz = async (finalScore: number) => {
        try {
            const res = await api.post('/quiz/result', {
                quiz_id: quizId,
                score: finalScore,
                elapsed_time: elapsedTime,
                answers: answers,
            })

            const recordId = res.data.record_id

            await onQuizCompleted(quizId, { completed: true })

            router.replace({
                pathname: './quiz-result/[recordId]',
                params: {
                    recordId: String(recordId),
                },
            })

        } catch (e) {
            console.error('Result submit error:', e)
        }
    }

    /* ───────────────── STATES ───────────────── */

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator
                    size="large"
                    color="#4f46e5"
                />
                <Text
                    style={
                        s.loadingText
                    }
                >
                    Preparing your
                    quiz...
                </Text>
            </View>
        );
    }

    if (!currentQuestion) {
        return (
            <View style={s.center}>
                <Text
                    style={s.emptyText}
                >
                    No questions
                    available.
                </Text>
            </View>
        );
    }

    /* ───────────────── UI ───────────────── */

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.container}>
                {/* Header */}

                <View
                    style={
                        s.progressRow
                    }
                >
                    <View>
                        <Text
                            style={
                                s.progressLabel
                            }
                        >
                            Question{' '}
                            {currentIndex +
                                1}{' '}
                            of{' '}
                            {
                                questions.length
                            }
                        </Text>

                        <Text
                            style={
                                s.quizTitle
                            }
                        >
                            {quiz?.title}
                        </Text>
                    </View>

                    <Text
                        style={
                            s.scoreLabel
                        }
                    >
                        {score}/
                        {
                            questions.length
                        }
                    </Text>
                </View>

                {/* Progress */}

                <View
                    style={
                        s.progressTrack
                    }
                >
                    <View
                        style={[
                            s.progressFill,
                            {
                                width: `${((currentIndex +
                                    1) /
                                    questions.length) *
                                    100
                                    }%`,
                            },
                        ]}
                    />
                </View>

                {/* Question */}

                <View
                    style={
                        s.questionBox
                    }
                >
                    <Text
                        style={
                            s.questionText
                        }
                    >
                        {
                            currentQuestion.text
                        }
                    </Text>
                </View>

                {/* Answers */}

                {currentQuestion.options?.map(
                    (
                        opt: any,
                        index: number
                    ) => {
                        const isSelected =
                            selected ===
                            opt.id;

                        return (
                            <TouchableOpacity
                                key={
                                    opt.id
                                }
                                onPress={() =>
                                    setSelected(
                                        opt.id
                                    )
                                }
                                style={[
                                    s.option,
                                    isSelected &&
                                    s.optionSelected,
                                ]}
                                activeOpacity={
                                    0.8
                                }
                            >
                                <View
                                    style={[
                                        s.optionBadge,
                                        isSelected &&
                                        s.optionBadgeSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            s.optionBadgeText,
                                            isSelected &&
                                            s.optionBadgeTextSelected,
                                        ]}
                                    >
                                        {String.fromCharCode(
                                            65 +
                                            index
                                        )}
                                    </Text>
                                </View>

                                <Text
                                    style={[
                                        s.optionText,
                                        isSelected &&
                                        s.optionTextSelected,
                                    ]}
                                >
                                    {
                                        opt.text
                                    }
                                </Text>
                            </TouchableOpacity>
                        );
                    }
                )}

                {/* Button */}

                <TouchableOpacity
                    style={[
                        s.btn,
                        (selected ===
                            null ||
                            submitting) &&
                        s.btnDisabled,
                    ]}
                    disabled={
                        selected ===
                        null ||
                        submitting
                    }
                    onPress={
                        submitAnswer
                    }
                    activeOpacity={
                        0.85
                    }
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text
                            style={
                                s.btnText
                            }
                        >
                            {isLast
                                ? 'Finish Quiz'
                                : 'Next Question'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const PURPLE = '#4f46e5';

const s = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },

    container: {
        flex: 1,
        padding: 20,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        marginTop: 12,
        color: '#64748b',
    },

    emptyText: {
        color: '#64748b',
    },

    progressRow: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    progressLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },

    quizTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginTop: 4,
    },

    scoreLabel: {
        color: PURPLE,
        fontWeight: '700',
    },

    progressTrack: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: 24,
    },

    progressFill: {
        height: '100%',
        backgroundColor: PURPLE,
    },

    questionBox: {
        backgroundColor: '#111827',
        padding: 24,
        borderRadius: 20,
        marginBottom: 20,
    },

    questionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 28,
        textAlign: 'center',
    },

    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },

    optionSelected: {
        borderColor: PURPLE,
        backgroundColor: '#eef2ff',
    },

    optionBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    optionBadgeSelected: {
        backgroundColor: PURPLE,
    },

    optionBadgeText: {
        fontWeight: '700',
    },

    optionBadgeTextSelected: {
        color: '#fff',
    },

    optionText: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },

    optionTextSelected: {
        color: PURPLE,
        fontWeight: '600',
    },

    btn: {
        marginTop: 'auto',
        backgroundColor: PURPLE,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },

    btnDisabled: {
        opacity: 0.5,
    },

    btnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});