import useData from '@/hooks/useData';
import api from '@/services/api';
import { RecordItem } from '@/store/dataStore';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

// ─────────────────────────────────────────────────────────────────────────────
// NOIR PALETTE
// ─────────────────────────────────────────────────────────────────────────────

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const LIGHT_GRAY = '#D3D3D3';
const GRAY = '#A9A9A9';
const DARK_GRAY = '#696969';

const GLASS = 'rgba(0,0,0,0.035)';
const GLASS_LIGHT = 'rgba(0,0,0,0.06)';
const GLASS_BORDER = 'rgba(0,0,0,0.10)';
const GLASS_BORDER_SOFT = 'rgba(0,0,0,0.07)';

const PASS_THRESHOLD_PCT = 75;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(
        2,
        '0'
    )}`;
};

const getAccuracy = (score: number, total: number) =>
    Math.round((score / (total || 1)) * 100);

const isPassed = (score: number, total: number) =>
    getAccuracy(score, total) >= PASS_THRESHOLD_PCT;

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: string;
}) => (
    <View style={st.card}>
        <View style={st.cardTop}>
            <Text style={st.label}>{label}</Text>

            <View style={st.statIcon}>
                <FontAwesome5
                    name={icon}
                    size={10}
                    color={BLACK}
                />
            </View>
        </View>

        <Text style={st.value}>{value}</Text>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────

const DonutChart = ({
    passed,
    failed,
}: {
    passed: number;
    failed: number;
}) => {
    const total = passed + failed;

    const passRatio =
        total > 0 ? passed / total : 0;

    const failRatio =
        total > 0 ? failed / total : 0;

    const SIZE = 112;
    const STROKE = 13;

    const radius = (SIZE - STROKE) / 2;
    const circumference = 2 * Math.PI * radius;

    const passStroke = circumference * passRatio;
    const failStroke = circumference * failRatio;

    const percent =
        total > 0
            ? Math.round(passRatio * 100)
            : 0;

    return (
        <View style={dc.wrap}>
            <View style={dc.chartWrap}>
                <Svg width={SIZE} height={SIZE}>
                    {/* Background */}
                    <Circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={radius}
                        stroke={LIGHT_GRAY}
                        strokeWidth={STROKE}
                        fill="none"
                    />

                    {/* Passed */}
                    <Circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={radius}
                        stroke={BLACK}
                        strokeWidth={STROKE}
                        fill="none"
                        strokeDasharray={`${passStroke} ${circumference}`}
                        strokeLinecap="round"
                        rotation={-90}
                        origin={`${SIZE / 2}, ${SIZE / 2}`}
                    />

                    {/* Failed */}
                    <Circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={radius}
                        stroke={GRAY}
                        strokeWidth={STROKE}
                        fill="none"
                        strokeDasharray={`${failStroke} ${circumference}`}
                        strokeDashoffset={-passStroke}
                        strokeLinecap="round"
                        rotation={-90}
                        origin={`${SIZE / 2}, ${SIZE / 2}`}
                    />
                </Svg>

                <View style={dc.center}>
                    <Text style={dc.pct}>
                        {percent}%
                    </Text>

                    <Text style={dc.pctSub}>
                        passed
                    </Text>
                </View>
            </View>

            <View style={dc.legend}>
                <View style={dc.legendRow}>
                    <View
                        style={[
                            dc.dot,
                            { backgroundColor: BLACK },
                        ]}
                    />

                    <Text style={dc.legendText}>
                        Passed ({passed})
                    </Text>
                </View>

                <View style={dc.legendRow}>
                    <View
                        style={[
                            dc.dot,
                            { backgroundColor: GRAY },
                        ]}
                    />

                    <Text style={dc.legendText}>
                        Failed ({failed})
                    </Text>
                </View>
            </View>
        </View>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCORE TREND
// Web-inspired minimal line chart
// ─────────────────────────────────────────────────────────────────────────────

const TrendChart = ({
    data,
}: {
    data: {
        label: string;
        value: number;
    }[];
}) => {
    if (data.length < 2) {
        return (
            <View style={tr.empty}>
                <View style={tr.emptyIcon}>
                    <FontAwesome5
                        name="chart-line"
                        size={16}
                        color={DARK_GRAY}
                    />
                </View>

                <Text style={tr.emptyText}>
                    Not enough data
                </Text>

                <Text style={tr.emptySubtext}>
                    Complete more assessments to see your trend.
                </Text>
            </View>
        );
    }

    const WIDTH = Math.max(
        250,
        data.length * 58
    );

    const HEIGHT = 145;

    const LEFT = 28;
    const RIGHT = 12;
    const TOP = 10;
    const BOTTOM = 30;

    const CHART_WIDTH =
        WIDTH - LEFT - RIGHT;

    const CHART_HEIGHT =
        HEIGHT - TOP - BOTTOM;

    const maxVal =
        Math.max(
            10,
            ...data.map(item => item.value)
        );

    const points = data
        .map((item, index) => {
            const x =
                data.length === 1
                    ? LEFT
                    : LEFT +
                      (index /
                          (data.length - 1)) *
                          CHART_WIDTH;

            const y =
                TOP +
                CHART_HEIGHT -
                (item.value / maxVal) *
                    CHART_HEIGHT;

            return {
                x,
                y,
                item,
            };
        });

    const polylinePoints = points
        .map(point => `${point.x},${point.y}`)
        .join(' ');

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            <View style={tr.chart}>
                <Svg
                    width={WIDTH}
                    height={HEIGHT}
                >
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(
                        (ratio, index) => {
                            const y =
                                TOP +
                                CHART_HEIGHT -
                                ratio *
                                    CHART_HEIGHT;

                            return (
                                <Line
                                    key={index}
                                    x1={LEFT}
                                    x2={
                                        WIDTH -
                                        RIGHT
                                    }
                                    y1={y}
                                    y2={y}
                                    stroke={
                                        GLASS_BORDER
                                    }
                                    strokeWidth={1}
                                />
                            );
                        }
                    )}

                    {/* Trend line */}
                    <Polyline
                        points={polylinePoints}
                        fill="none"
                        stroke={BLACK}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points */}
                    {points.map(
                        (point, index) => (
                            <Circle
                                key={index}
                                cx={point.x}
                                cy={point.y}
                                r={4}
                                fill={WHITE}
                                stroke={BLACK}
                                strokeWidth={2}
                            />
                        )
                    )}
                </Svg>

                {/* Y-axis labels */}
                <View style={tr.yLabels}>
                    {[10, 8, 6, 4, 2, 0].map(
                        value => (
                            <Text
                                key={value}
                                style={tr.yLabel}
                            >
                                {value}
                            </Text>
                        )
                    )}
                </View>

                {/* X-axis labels */}
                <View
                    style={[
                        tr.xLabels,
                        {
                            width:
                                WIDTH -
                                LEFT -
                                RIGHT,
                            marginLeft: LEFT,
                        },
                    ]}
                >
                    {points.map(
                        (point, index) => (
                            <Text
                                key={index}
                                style={tr.xLabel}
                            >
                                {point.item.label}
                            </Text>
                        )
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────

type QuestionResult = {
    question_id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
};

type FullResult = {
    record_id: number;
    quiz_id: number;
    score: number;
    elapsed_time: number;
    total_questions: number;
    questions: QuestionResult[];
};

const DetailModal = ({
    record,
    onClose,
}: {
    record: RecordItem | null;
    onClose: () => void;
}) => {
    const [result, setResult] =
        useState<FullResult | null>(null);

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        if (!record?.id) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                setResult(null);

                const res = await api.get(
                    `/quiz/result/${record.id}`
                );

                setResult(res.data);
            } catch (e) {
                console.error(
                    'Detail fetch error:',
                    e
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [record?.id]);

    if (!record) return null;

    const total =
        result?.total_questions ??
        record.total_questions ??
        10;

    const score =
        result?.score ??
        record.score;

    const accuracy =
        getAccuracy(score, total);

    const pass =
        isPassed(score, total);

    const correct =
        result?.questions.filter(
            q => q.is_correct
        ).length ?? 0;

    const wrong =
        result?.questions.filter(
            q => !q.is_correct
        ).length ?? 0;

    return (
        <Modal
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={md.overlay}>
                <View style={md.sheet}>

                    {/* ─────────────────────────────
                        HEADER
                    ───────────────────────────── */}

                    <View style={md.header}>
                        <View style={md.headerText}>
                            <View style={md.attemptLabel}>
                                <View
                                    style={
                                        md.attemptDot
                                    }
                                />

                                <Text
                                    style={
                                        md.attemptLabelText
                                    }
                                >
                                    ASSESSMENT ATTEMPT
                                </Text>
                            </View>

                            <Text
                                style={md.title}
                                numberOfLines={2}
                            >
                                {record.quiz_title}
                            </Text>

                            {record.quiz_description ? (
                                <Text
                                    style={md.desc}
                                    numberOfLines={2}
                                >
                                    {
                                        record.quiz_description
                                    }
                                </Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            style={md.closeBtn}
                        >
                            <Ionicons
                                name="close"
                                size={19}
                                color={BLACK}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ─────────────────────────────
                        RESULT HERO
                    ───────────────────────────── */}

                    <View style={md.resultHero}>
                        <View style={md.scoreCircle}>
                            <Text
                                style={
                                    md.scoreNumber
                                }
                            >
                                {score}
                            </Text>

                            <View
                                style={
                                    md.scoreDivider
                                }
                            />

                            <Text
                                style={
                                    md.scoreTotal
                                }
                            >
                                {total}
                            </Text>
                        </View>

                        <View
                            style={
                                md.resultHeroInfo
                            }
                        >
                            <Text
                                style={
                                    md.resultLabel
                                }
                            >
                                FINAL RESULT
                            </Text>

                            <View
                                style={[
                                    md.statusBadge,
                                    pass
                                        ? md.statusPassed
                                        : md.statusFailed,
                                ]}
                            >
                                <View
                                    style={[
                                        md.statusDot,
                                        {
                                            backgroundColor:
                                                pass
                                                    ? BLACK
                                                    : GRAY,
                                        },
                                    ]}
                                />

                                <Text
                                    style={
                                        md.statusText
                                    }
                                >
                                    {pass
                                        ? 'PASSED'
                                        : 'FAILED'}
                                </Text>
                            </View>

                            <Text
                                style={
                                    md.resultDescription
                                }
                            >
                                {accuracy}% accuracy
                            </Text>
                        </View>
                    </View>

                    {/* ─────────────────────────────
                        SUMMARY
                    ───────────────────────────── */}

                    <View style={md.summaryRow}>
                        <View style={md.summaryBox}>
                            <Text
                                style={
                                    md.summaryVal
                                }
                            >
                                {score}/{total}
                            </Text>

                            <Text
                                style={
                                    md.summaryLbl
                                }
                            >
                                Score
                            </Text>
                        </View>

                        <View style={md.summaryBox}>
                            <Text
                                style={
                                    md.summaryVal
                                }
                            >
                                {accuracy}%
                            </Text>

                            <Text
                                style={
                                    md.summaryLbl
                                }
                            >
                                Accuracy
                            </Text>
                        </View>

                        <View style={md.summaryBox}>
                            <Text
                                style={
                                    md.summaryVal
                                }
                            >
                                {record.elapsed_time
                                    ? formatTime(
                                          record.elapsed_time
                                      )
                                    : '—'}
                            </Text>

                            <Text
                                style={
                                    md.summaryLbl
                                }
                            >
                                Time
                            </Text>
                        </View>
                    </View>

                    <View style={md.divider} />

                    {/* ─────────────────────────────
                        QUESTION SUMMARY
                    ───────────────────────────── */}

                    {loading ? (
                        <View
                            style={
                                md.loadingWrap
                            }
                        >
                            <Text
                                style={
                                    md.loadingText
                                }
                            >
                                Loading answers...
                            </Text>
                        </View>
                    ) : result ? (
                        <>
                            <View
                                style={
                                    md.countRow
                                }
                            >
                                <View
                                    style={
                                        md.countBox
                                    }
                                >
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={15}
                                        color={BLACK}
                                    />

                                    <Text
                                        style={
                                            md.countText
                                        }
                                    >
                                        {correct} Correct
                                    </Text>
                                </View>

                                <View
                                    style={
                                        md.countBox
                                    }
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={15}
                                        color={DARK_GRAY}
                                    />

                                    <Text
                                        style={
                                            md.countTextMuted
                                        }
                                    >
                                        {wrong} Wrong
                                    </Text>
                                </View>
                            </View>

                            {/* ─────────────────────
                                QUESTIONS
                            ───────────────────── */}

                            <ScrollView
                                style={
                                    md.questionList
                                }
                                showsVerticalScrollIndicator={
                                    false
                                }
                                nestedScrollEnabled
                            >
                                {result.questions.map(
                                    (q, i) => (
                                        <View
                                            key={
                                                q.question_id
                                            }
                                            style={[
                                                md.questionCard,
                                                q.is_correct
                                                    ? md.questionCorrect
                                                    : md.questionWrong,
                                            ]}
                                        >
                                            <View
                                                style={
                                                    md.questionHeader
                                                }
                                            >
                                                <View
                                                    style={
                                                        md.questionNumber
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            md.questionNumberText
                                                        }
                                                    >
                                                        Q{i +
                                                            1}
                                                    </Text>
                                                </View>

                                                <View
                                                    style={
                                                        md.questionStatus
                                                    }
                                                >
                                                    <Ionicons
                                                        name={
                                                            q.is_correct
                                                                ? 'checkmark-circle'
                                                                : 'close-circle'
                                                        }
                                                        size={
                                                            16
                                                        }
                                                        color={
                                                            q.is_correct
                                                                ? BLACK
                                                                : DARK_GRAY
                                                        }
                                                    />

                                                    <Text
                                                        style={
                                                            md.questionStatusText
                                                        }
                                                    >
                                                        {q.is_correct
                                                            ? 'Correct'
                                                            : 'Incorrect'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text
                                                style={
                                                    md.questionText
                                                }
                                            >
                                                {
                                                    q.question
                                                }
                                            </Text>

                                            <View
                                                style={
                                                    md.answerRow
                                                }
                                            >
                                                <Text
                                                    style={
                                                        md.answerLabel
                                                    }
                                                >
                                                    YOUR ANSWER
                                                </Text>

                                                <Text
                                                    style={[
                                                        md.answerVal,
                                                        {
                                                            color:
                                                                q.is_correct
                                                                    ? BLACK
                                                                    : DARK_GRAY,
                                                        },
                                                    ]}
                                                >
                                                    {
                                                        q.user_answer
                                                    }
                                                </Text>
                                            </View>

                                            {!q.is_correct && (
                                                <View
                                                    style={
                                                        md.correctAnswerRow
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            md.answerLabel
                                                        }
                                                    >
                                                        CORRECT ANSWER
                                                    </Text>

                                                    <Text
                                                        style={
                                                            md.correctAnswerVal
                                                        }
                                                    >
                                                        {
                                                            q.correct_answer
                                                        }
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    )
                                )}
                            </ScrollView>
                        </>
                    ) : (
                        <View
                            style={
                                md.loadingWrap
                            }
                        >
                            <Text
                                style={
                                    md.loadingText
                                }
                            >
                                Could not load question
                                details.
                            </Text>
                        </View>
                    )}

                    {/* ─────────────────────────────
                        CLOSE
                    ───────────────────────────── */}

                    <TouchableOpacity
                        style={md.closeAction}
                        onPress={onClose}
                    >
                        <Text
                            style={
                                md.closeActionText
                            }
                        >
                            Close
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function RecordsPage() {
    const {
        records,
        loadingRecords: loading,
    } = useData();

    const [search, setSearch] =
        useState('');

    const [selected, setSelected] =
        useState<RecordItem | null>(null);

    const fade =
        useRef(
            new Animated.Value(0)
        ).current;

    useEffect(() => {
        if (!loading) {
            Animated.timing(fade, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [loading,fade]);

    const filtered = useMemo(() => {
        const query =
            search.toLowerCase();

        return records.filter(r =>
            r.quiz_title
                .toLowerCase()
                .includes(query)
        );
    }, [records, search]);

    const passed = filtered.filter(
        r =>
            isPassed(
                r.score,
                r.total_questions
            )
    ).length;

    const failed =
        filtered.length - passed;

    const best = filtered.length
        ? Math.max(
              ...filtered.map(
                  r => r.score
              )
          )
        : 0;

    const avg = filtered.length
        ? (
              filtered.reduce(
                  (sum, r) =>
                      sum +
                      getAccuracy(
                          r.score,
                          r.total_questions
                      ),
                  0
              ) / filtered.length
          ).toFixed(1)
        : '0.0';

    const trendData = [
        ...filtered,
    ]
        .sort(
            (a, b) =>
                new Date(
                    a.created_at
                ).getTime() -
                new Date(
                    b.created_at
                ).getTime()
        )
        .map(r => ({
            label: fmt(
                r.created_at
            ),
            value: r.score,
        }));

    if (loading) {
        return (
            <View style={s.center}>
                <View style={s.loadingIcon}>
                    <FontAwesome5
                        name="chart-line"
                        size={16}
                        color={BLACK}
                    />
                </View>

                <Text
                    style={s.loadingText}
                >
                    Loading records...
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={s.container}
                showsVerticalScrollIndicator={
                    false
                }
            >
                <Animated.View
                    style={[
                        {
                            opacity: fade,
                        },
                        s.content,
                    ]}
                >
                    {/* ─────────────────────
                        HEADER
                    ───────────────────── */}

                    <View
                        style={
                            s.pageHeader
                        }
                    >
                        <View
                            style={
                                s.headerIcon
                            }
                        >
                            <FontAwesome5
                                name="chart-line"
                                size={17}
                                color={
                                    WHITE
                                }
                            />
                        </View>

                        <View
                            style={
                                s.headerText
                            }
                        >
                            <Text
                                style={
                                    s.pageTitle
                                }
                            >
                                Performance
                                Analytics
                            </Text>

                            <Text
                                style={
                                    s.pageSubtitle
                                }
                            >
                                Track your
                                assessment
                                progress and
                                accuracy
                            </Text>
                        </View>
                    </View>

                    {/* ─────────────────────
                        SEARCH
                    ───────────────────── */}

                    <View
                        style={
                            s.searchWrap
                        }
                    >
                        <Ionicons
                            name="search-outline"
                            size={16}
                            color={
                                DARK_GRAY
                            }
                        />

                        <TextInput
                            placeholder="Search assessment..."
                            placeholderTextColor={
                                GRAY
                            }
                            value={search}
                            onChangeText={
                                setSearch
                            }
                            style={
                                s.searchInput
                            }
                        />
                    </View>

                    {/* ─────────────────────
                        STATS
                    ───────────────────── */}

                    <View
                        style={
                            s.statsRow
                        }
                    >
                        <StatCard
                            label="AVG. SCORE"
                            value={`${avg}%`}
                            icon="chart-line"
                        />

                        <StatCard
                            label="PERSONAL BEST"
                            value={`${best}/${filtered.length ? Math.max(...filtered.map(r => r.total_questions || 10)) : 10}`}
                            icon="trophy"
                        />

                        <StatCard
                            label="NEEDS REVIEW"
                            value={String(
                                failed
                            )}
                            icon="clipboard-list"
                        />

                        <StatCard
                            label="TOTAL"
                            value={String(
                                filtered.length
                            )}
                            icon="layer-group"
                        />
                    </View>

                    {/* ─────────────────────
                        CHARTS
                    ───────────────────── */}

                    <View
                        style={
                            s.chartsRow
                        }
                    >
                        <View
                            style={
                                s.chartBox
                            }
                        >
                            <Text
                                style={
                                    s.chartTitle
                                }
                            >
                                SUCCESS RATE
                            </Text>

                            <DonutChart
                                passed={
                                    passed
                                }
                                failed={
                                    failed
                                }
                            />
                        </View>

                        <View
                            style={
                                [
                                    s.chartBox,
                                    s.trendBox,
                                ]
                            }
                        >
                            <View
                                style={
                                    s.trendHeader
                                }
                            >
                                <View>
                                    <Text
                                        style={
                                            s.chartTitle
                                        }
                                    >
                                        SCORE TREND
                                    </Text>

                                    <Text
                                        style={
                                            s.trendSubtitle
                                        }
                                    >
                                        Assessment
                                        performance
                                    </Text>
                                </View>

                                <View
                                    style={
                                        s.trendBadge
                                    }
                                >
                                    <FontAwesome5
                                        name="chart-line"
                                        size={9}
                                        color={
                                            BLACK
                                        }
                                    />
                                </View>
                            </View>

                            <TrendChart
                                data={
                                    trendData
                                }
                            />
                        </View>
                    </View>

                    {/* ─────────────────────
                        ATTEMPTS
                    ───────────────────── */}

                    <View
                        style={
                            s.attemptHeader
                        }
                    >
                        <View>
                            <Text
                                style={
                                    s.attemptTitle
                                }
                            >
                                Assessment Attempts
                            </Text>

                            <Text
                                style={
                                    s.attemptSubtitle
                                }
                            >
                                Review your previous
                                assessment results
                            </Text>
                        </View>

                        <View
                            style={
                                s.attemptCount
                            }
                        >
                            <Text
                                style={
                                    s.attemptCountText
                                }
                            >
                                {
                                    filtered.length
                                }
                            </Text>
                        </View>
                    </View>

                    {/* ─────────────────────
                        TABLE HEADER
                    ───────────────────── */}

                    <View
                        style={
                            s.tableHeader
                        }
                    >
                        <Text
                            style={[
                                s.col,
                                s.colDate,
                            ]}
                        >
                            DATE
                        </Text>

                        <Text
                            style={[
                                s.col,
                                s.colName,
                            ]}
                        >
                            ASSESSMENT
                        </Text>

                        <Text
                            style={[
                                s.col,
                                s.colScore,
                            ]}
                        >
                            SCORE
                        </Text>

                        <Text
                            style={[
                                s.col,
                                s.colAcc,
                            ]}
                        >
                            ACCURACY
                        </Text>

                        <Text
                            style={[
                                s.col,
                                s.colBtn,
                            ]}
                        >
                            VIEW
                        </Text>
                    </View>

                    {/* ─────────────────────
                        TABLE
                    ───────────────────── */}

                    {filtered.length === 0 ? (
                        <View
                            style={
                                s.emptyContainer
                            }
                        >
                            <View
                                style={
                                    s.emptyIcon
                                }
                            >
                                <Ionicons
                                    name="document-text-outline"
                                    size={22}
                                    color={
                                        DARK_GRAY
                                    }
                                />
                            </View>

                            <Text
                                style={
                                    s.emptyTitle
                                }
                            >
                                No records found
                            </Text>

                            <Text
                                style={
                                    s.emptyText
                                }
                            >
                                Try searching for
                                another assessment.
                            </Text>
                        </View>
                    ) : (
                        filtered.map(
                            (r, i) => {
                                const total =
                                    r.total_questions ||
                                    10;

                                const accuracy =
                                    getAccuracy(
                                        r.score,
                                        total
                                    );

                                const pass =
                                    isPassed(
                                        r.score,
                                        total
                                    );

                                return (
                                    <View
                                        key={i}
                                        style={[
                                            s.tableRow,
                                            i %
                                                2 ===
                                                0 &&
                                                s.tableRowAlt,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                s.col,
                                                s.colDate,
                                                s.cellMuted,
                                            ]}
                                        >
                                            {fmt(
                                                r.created_at
                                            )}
                                        </Text>

                                        <Text
                                            style={[
                                                s.col,
                                                s.colName,
                                                s.cellText,
                                            ]}
                                            numberOfLines={
                                                2
                                            }
                                        >
                                            {
                                                r.quiz_title
                                            }
                                        </Text>

                                        <View
                                            style={
                                                s.colScore
                                            }
                                        >
                                            <Text
                                                style={
                                                    [
                                                        s.scoreText,
                                                        pass
                                                            ? s.scorePassed
                                                            : s.scoreFailed,
                                                    ]
                                                }
                                            >
                                                {
                                                    r.score
                                                }
                                                /
                                                {
                                                    total
                                                }
                                            </Text>
                                        </View>

                                        <Text
                                            style={[
                                                s.col,
                                                s.colAcc,
                                                s.cellText,
                                            ]}
                                        >
                                            {
                                                accuracy
                                            }%
                                        </Text>

                                        <View
                                            style={
                                                s.colBtn
                                            }
                                        >
                                            <TouchableOpacity
                                                style={
                                                    s.detailBtn
                                                }
                                                onPress={() =>
                                                    setSelected(
                                                        r
                                                    )
                                                }
                                            >
                                                <Ionicons
                                                    name="eye-outline"
                                                    size={
                                                        13
                                                    }
                                                    color={
                                                        WHITE
                                                    }
                                                />

                                                <Text
                                                    style={
                                                        s.detailBtnText
                                                    }
                                                >
                                                    View
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }
                        )
                    )}
                </Animated.View>
            </ScrollView>

            {/* Previous Assessment Attempt */}
            <DetailModal
                record={selected}
                onClose={() =>
                    setSelected(null)
                }
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: WHITE,
    },

    content: {
        padding: 16,
        paddingBottom: 40,
        gap: 14,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: WHITE,
    },

    loadingIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: BLACK,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },

    loadingText: {
        color: DARK_GRAY,
        fontSize: 13,
    },

    // Header
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
    },

    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: BLACK,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerText: {
        flex: 1,
    },

    pageTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: BLACK,
        letterSpacing: -0.3,
    },

    pageSubtitle: {
        fontSize: 11,
        color: DARK_GRAY,
        marginTop: 2,
    },

    // Search
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        paddingHorizontal: 12,
        minHeight: 42,
    },

    searchInput: {
        flex: 1,
        paddingVertical: 9,
        paddingHorizontal: 8,
        fontSize: 13,
        color: BLACK,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 7,
    },

    // Charts
    chartsRow: {
        flexDirection: 'row',
        gap: 10,
    },

    chartBox: {
        flex: 1,
        minHeight: 190,
        backgroundColor: WHITE,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        padding: 12,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },

    trendBox: {
        flex: 1.55,
        overflow: 'hidden',
    },

    chartTitle: {
        fontSize: 9,
        fontWeight: '800',
        color: DARK_GRAY,
        letterSpacing: 1,
    },

    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    trendSubtitle: {
        fontSize: 9,
        color: GRAY,
        marginTop: 3,
    },

    trendBadge: {
        width: 25,
        height: 25,
        borderRadius: 8,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Attempts
    attemptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },

    attemptTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: BLACK,
    },

    attemptSubtitle: {
        fontSize: 10,
        color: DARK_GRAY,
        marginTop: 2,
    },

    attemptCount: {
        minWidth: 30,
        height: 30,
        paddingHorizontal: 8,
        borderRadius: 9,
        backgroundColor: BLACK,
        alignItems: 'center',
        justifyContent: 'center',
    },

    attemptCountText: {
        color: WHITE,
        fontSize: 11,
        fontWeight: '800',
    },

    // Table
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: 5,
        backgroundColor: GLASS,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: LIGHT_GRAY,
    },

    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 13,
        backgroundColor: WHITE,
        borderBottomWidth: 1,
        borderColor: GLASS_BORDER_SOFT,
    },

    tableRowAlt: {
        backgroundColor: GLASS,
    },

    col: {
        fontSize: 8,
        fontWeight: '800',
        color: DARK_GRAY,
        letterSpacing: 0.4,
        textAlign: 'center',
    },

    colDate: {
        width: 48,
    },

    colName: {
        flex: 1,
        paddingHorizontal: 5,
        textAlign: 'left',
    },

    colScore: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },

    colAcc: {
        width: 52,
    },

    colBtn: {
        width: 55,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cellText: {
        fontSize: 11,
        color: BLACK,
        fontWeight: '600',
    },

    cellMuted: {
        fontSize: 10,
        color: DARK_GRAY,
    },

    scoreText: {
        fontSize: 11,
        fontWeight: '800',
    },

    scorePassed: {
        color: BLACK,
    },

    scoreFailed: {
        color: DARK_GRAY,
    },

    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,

        backgroundColor: BLACK,

        paddingVertical: 6,
        paddingHorizontal: 7,

        borderRadius: 7,
    },

    detailBtnText: {
        color: WHITE,
        fontSize: 9,
        fontWeight: '800',
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 45,
    },

    emptyIcon: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    emptyTitle: {
        color: BLACK,
        fontSize: 14,
        fontWeight: '800',
    },

    emptyText: {
        color: DARK_GRAY,
        fontSize: 11,
        marginTop: 4,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD STYLES
// ─────────────────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
    card: {
        flex: 1,
        minHeight: 72,
        backgroundColor: WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        padding: 9,
    },

    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    label: {
        flex: 1,
        fontSize: 7,
        fontWeight: '800',
        color: DARK_GRAY,
        letterSpacing: 0.5,
    },

    statIcon: {
        width: 19,
        height: 19,
        borderRadius: 6,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },

    value: {
        fontSize: 15,
        fontWeight: '800',
        color: BLACK,
        marginTop: 6,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// DONUT STYLES
// ─────────────────────────────────────────────────────────────────────────────

const dc = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        gap: 10,
        marginTop: 5,
    },

    chartWrap: {
        width: 112,
        height: 112,
        alignItems: 'center',
        justifyContent: 'center',
    },

    center: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },

    pct: {
        fontSize: 17,
        fontWeight: '800',
        color: BLACK,
    },

    pctSub: {
        fontSize: 8,
        color: DARK_GRAY,
        marginTop: 1,
    },

    legend: {
        flexDirection: 'row',
        gap: 8,
    },

    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    legendText: {
        fontSize: 8,
        color: DARK_GRAY,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// TREND STYLES
// ─────────────────────────────────────────────────────────────────────────────

const tr = StyleSheet.create({
    chart: {
        marginTop: 8,
        position: 'relative',
        minHeight: 145,
    },

    yLabels: {
        position: 'absolute',
        left: 0,
        top: 10,
        height: 105,
        justifyContent: 'space-between',
    },

    yLabel: {
        fontSize: 7,
        color: GRAY,
    },

    xLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 2,
    },

    xLabel: {
        fontSize: 7,
        color: DARK_GRAY,
        width: 45,
        textAlign: 'center',
    },

    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 130,
    },

    emptyIcon: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 7,
    },

    emptyText: {
        fontSize: 10,
        fontWeight: '700',
        color: BLACK,
    },

    emptySubtext: {
        fontSize: 8,
        color: DARK_GRAY,
        textAlign: 'center',
        marginTop: 3,
        maxWidth: 130,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL MODAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const md = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    sheet: {
        backgroundColor: WHITE,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '92%',
        gap: 12,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    headerText: {
        flex: 1,
        paddingRight: 10,
    },

    attemptLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 5,
    },

    attemptDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: BLACK,
    },

    attemptLabelText: {
        fontSize: 8,
        fontWeight: '800',
        color: DARK_GRAY,
        letterSpacing: 1,
    },

    title: {
        fontSize: 17,
        fontWeight: '800',
        color: BLACK,
        lineHeight: 22,
    },

    desc: {
        fontSize: 10,
        color: DARK_GRAY,
        lineHeight: 16,
        marginTop: 3,
    },

    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Result hero
    resultHero: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BLACK,
        borderRadius: 16,
        padding: 14,
    },

    scoreCircle: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    scoreNumber: {
        fontSize: 23,
        fontWeight: '900',
        color: BLACK,
    },

    scoreDivider: {
        width: 1,
        height: 20,
        backgroundColor: LIGHT_GRAY,
        marginHorizontal: 3,
    },

    scoreTotal: {
        fontSize: 12,
        fontWeight: '700',
        color: DARK_GRAY,
    },

    resultHeroInfo: {
        marginLeft: 13,
    },

    resultLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: GRAY,
        letterSpacing: 1,
        marginBottom: 5,
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: WHITE,
    },

    statusPassed: {
        backgroundColor: WHITE,
    },

    statusFailed: {
        backgroundColor: LIGHT_GRAY,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    statusText: {
        fontSize: 9,
        fontWeight: '900',
        color: BLACK,
    },

    resultDescription: {
        fontSize: 10,
        color: LIGHT_GRAY,
        marginTop: 5,
    },

    // Summary
    summaryRow: {
        flexDirection: 'row',
        gap: 8,
    },

    summaryBox: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
        paddingVertical: 7,
    },

    summaryVal: {
        fontSize: 13,
        fontWeight: '800',
        color: BLACK,
    },

    summaryLbl: {
        fontSize: 8,
        color: DARK_GRAY,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    divider: {
        height: 1,
        backgroundColor: LIGHT_GRAY,
    },

    // Correct / Wrong
    countRow: {
        flexDirection: 'row',
        gap: 8,
    },

    countBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingVertical: 8,
        borderRadius: 9,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
    },

    countText: {
        fontSize: 11,
        fontWeight: '800',
        color: BLACK,
    },

    countTextMuted: {
        fontSize: 11,
        fontWeight: '800',
        color: DARK_GRAY,
    },

    // Questions
    questionList: {
        maxHeight: 350,
    },

    questionCard: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        borderLeftWidth: 3,
        backgroundColor: WHITE,
    },

    questionCorrect: {
        borderLeftColor: BLACK,
    },

    questionWrong: {
        borderLeftColor: DARK_GRAY,
    },

    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    questionNumber: {
        minWidth: 28,
        height: 24,
        paddingHorizontal: 7,
        borderRadius: 7,
        backgroundColor: BLACK,
        alignItems: 'center',
        justifyContent: 'center',
    },

    questionNumberText: {
        color: WHITE,
        fontSize: 9,
        fontWeight: '800',
    },

    questionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    questionStatusText: {
        fontSize: 9,
        color: DARK_GRAY,
        fontWeight: '700',
    },

    questionText: {
        fontSize: 12,
        fontWeight: '600',
        color: BLACK,
        lineHeight: 18,
        marginBottom: 9,
    },

    answerRow: {
        borderRadius: 8,
        padding: 9,
        marginBottom: 6,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: GLASS_BORDER_SOFT,
    },

    correctAnswerRow: {
        borderRadius: 8,
        padding: 9,
        marginBottom: 6,
        backgroundColor: BLACK,
    },

    answerLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: DARK_GRAY,
        letterSpacing: 0.6,
        marginBottom: 3,
    },

    answerVal: {
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 16,
    },

    correctAnswerVal: {
        fontSize: 11,
        fontWeight: '700',
        color: WHITE,
        lineHeight: 16,
    },

    // Loading
    loadingWrap: {
        paddingVertical: 30,
        alignItems: 'center',
    },

    loadingText: {
        color: DARK_GRAY,
        fontSize: 12,
    },

    // Close
    closeAction: {
        backgroundColor: BLACK,
        padding: 13,
        borderRadius: 11,
        alignItems: 'center',
    },

    closeActionText: {
        color: WHITE,
        fontWeight: '800',
        fontSize: 13,
    },
});