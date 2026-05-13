import useData from '@/hooks/useData';
import api from '@/services/api';
import { RecordItem } from '@/store/dataStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = '#6366f1';
const RED = '#f43f5e';
const GREEN = '#10b981';
const PASS_THRESHOLD = 7;

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent }: any) => (
    <View style={st.card}>
        <Text style={st.label}>{label}</Text>
        <Text style={[st.value, accent && { color: accent }]}>{value}</Text>
        {sub ? <Text style={st.sub}>{sub}</Text> : null}
    </View>
);

// ─── Donut Chart ─────────────────────────────────────────────────────────────

const DonutChart = ({ passed, failed }: { passed: number; failed: number }) => {
    const total = passed + failed;
    const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
    const SIZE = 110;
    const STROKE = 18;
    const R = (SIZE - STROKE) / 2;
    const CIRC = 2 * Math.PI * R;
    const dash = (pct / 100) * CIRC;

    return (
        <View style={dc.wrap}>
            {/* SVG-style donut via border trick */}
            <View style={[dc.ring, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]}>
                <View style={dc.inner}>
                    <Text style={dc.pct}>{pct}%</Text>
                    <Text style={dc.pctSub}>passed</Text>
                </View>
                {/* Filled arc approximation using rotation layers */}
                <View style={[dc.arc, { borderColor: PURPLE, transform: [{ rotate: `${(pct / 100) * 360}deg` }] }]} />
            </View>

            <View style={dc.legend}>
                <View style={dc.legendRow}>
                    <View style={[dc.dot, { backgroundColor: PURPLE }]} />
                    <Text style={dc.legendText}>Passed</Text>
                </View>
                <View style={dc.legendRow}>
                    <View style={[dc.dot, { backgroundColor: RED }]} />
                    <Text style={dc.legendText}>Needs Review</Text>
                </View>
            </View>
        </View>
    );
};

// ─── Bar Trend Chart ──────────────────────────────────────────────────────────

const TrendChart = ({ data }: { data: { label: string; value: number }[] }) => {
    const MAX_H = 80;
    const maxVal = 10;

    if (data.length < 2) {
        return (
            <View style={tr.empty}>
                <Text style={tr.emptyText}>Not enough data</Text>
            </View>
        );
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tr.wrap}>
                {/* Y-axis labels */}
                <View style={tr.yAxis}>
                    {[10, 8, 6, 4, 2, 0].map((v) => (
                        <Text key={v} style={tr.yLabel}>{v}</Text>
                    ))}
                </View>

                {/* Bars */}
                <View style={tr.bars}>
                    {data.map((item, i) => (
                        <View key={i} style={tr.barCol}>
                            <View style={[tr.barBg, { height: MAX_H }]}>
                                <View
                                    style={[
                                        tr.barFill,
                                        { height: (item.value / maxVal) * MAX_H },
                                    ]}
                                />
                            </View>
                            <Text style={tr.barLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

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
    const [result, setResult] = useState<FullResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!record?.id) return;

        const fetch = async () => {
            try {
                setLoading(true);
                setResult(null);
                const res = await api.get(`/quiz/result/${record.id}`);
                setResult(res.data);
                console.log(res.data);
            } catch (e) {
                console.error('Detail fetch error:', e);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [record?.id]);

    if (!record) return null;

    const pass = record.score >= PASS_THRESHOLD;
    const accuracy = result
        ? Math.round((result.score / result.total_questions) * 100)
        : Math.round((record.score / (record.total_questions || 10)) * 100);

    const correct = result?.questions.filter(q => q.is_correct).length ?? 0;
    const wrong = result?.questions.filter(q => !q.is_correct).length ?? 0;

    return (
        <Modal transparent animationType="slide" onRequestClose={onClose}>
            <View style={md.overlay}>
                <View style={md.sheet}>

                    {/* ── Header ── */}
                    <View style={md.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={md.title} numberOfLines={2}>{record.quiz_title}</Text>
                            {record.quiz_description ? (
                                <Text style={md.desc}>{record.quiz_description}</Text>
                            ) : null}
                        </View>
                        <TouchableOpacity onPress={onClose} style={md.closeBtn}>
                            <Ionicons name="close" size={18} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* ── Summary row ── */}
                    <View style={md.summaryRow}>
                        <View style={md.summaryBox}>
                            <Text style={md.summaryVal}>{record.score}/{record.total_questions ?? 10}</Text>
                            <Text style={md.summaryLbl}>Score</Text>
                        </View>
                        <View style={md.summaryBox}>
                            <Text style={md.summaryVal}>{accuracy}%</Text>
                            <Text style={md.summaryLbl}>Accuracy</Text>
                        </View>
                        <View style={md.summaryBox}>
                            <Text style={md.summaryVal}>{record.elapsed_time ? formatTime(record.elapsed_time) : '—'}</Text>
                            <Text style={md.summaryLbl}>Time</Text>
                        </View>
                        <View style={md.summaryBox}>
                            <View style={[md.badge, { backgroundColor: pass ? '#d1fae5' : '#fee2e2' }]}>
                                <Text style={[md.badgeText, { color: pass ? GREEN : RED }]}>
                                    {pass ? 'Passed' : 'Failed'}
                                </Text>
                            </View>
                            <Text style={md.summaryLbl}>Result</Text>
                        </View>
                    </View>

                    <View style={md.divider} />

                    {/* ── Question list ── */}
                    {loading ? (
                        <View style={md.loadingWrap}>
                            <Text style={md.loadingText}>Loading answers...</Text>
                        </View>
                    ) : result ? (
                        <>
                            {/* Correct / Wrong count */}
                            <View style={md.countRow}>
                                <View style={[md.countBox, { backgroundColor: '#d1fae5' }]}>
                                    <Ionicons name="checkmark-circle" size={14} color={GREEN} />
                                    <Text style={[md.countText, { color: GREEN }]}>{correct} Correct</Text>
                                </View>
                                <View style={[md.countBox, { backgroundColor: '#fee2e2' }]}>
                                    <Ionicons name="close-circle" size={14} color={RED} />
                                    <Text style={[md.countText, { color: RED }]}>{wrong} Wrong</Text>
                                </View>
                            </View>

                            <ScrollView
                                style={md.questionList}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled
                            >
                                {result.questions.map((q, i) => (
                                    <View
                                        key={q.question_id}
                                        style={[
                                            md.questionCard,
                                            { borderLeftColor: q.is_correct ? GREEN : RED },
                                        ]}
                                    >
                                        {/* Question number + icon */}
                                        <View style={md.questionHeader}>
                                            <Text style={md.questionNum}>Q{i + 1}</Text>
                                            <Ionicons
                                                name={q.is_correct ? 'checkmark-circle' : 'close-circle'}
                                                size={16}
                                                color={q.is_correct ? GREEN : RED}
                                            />
                                        </View>

                                        {/* Question text */}
                                        <Text style={md.questionText}>{q.question}</Text>

                                        {/* User answer */}
                                        <View style={[
                                            md.answerRow,
                                            { backgroundColor: q.is_correct ? '#f0fdf4' : '#fff1f2' },
                                        ]}>
                                            <Text style={md.answerLabel}>Your answer</Text>
                                            <Text style={[
                                                md.answerVal,
                                                { color: q.is_correct ? GREEN : RED },
                                            ]}>
                                                {q.user_answer}
                                            </Text>
                                        </View>

                                        {/* Correct answer — only show if wrong */}
                                        {!q.is_correct && (
                                            <View style={[md.answerRow, { backgroundColor: '#f0fdf4' }]}>
                                                <Text style={md.answerLabel}>Correct answer</Text>
                                                <Text style={[md.answerVal, { color: GREEN }]}>
                                                    {q.correct_answer}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    ) : (
                        <Text style={md.loadingText}>Could not load question details.</Text>
                    )}

                    {/* ── Close button ── */}
                    <TouchableOpacity style={md.closeAction} onPress={onClose}>
                        <Text style={md.closeActionText}>Close</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RecordsPage() {
    const { records, loadingRecords: loading } = useData();

    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<RecordItem | null>(null);
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!loading) {
            Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }
    }, [loading]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return records.filter(r => r.quiz_title.toLowerCase().includes(q));
    }, [records, search]);

    const passed = filtered.filter(r => r.score >= PASS_THRESHOLD).length;
    const failed = filtered.filter(r => r.score < PASS_THRESHOLD).length;
    const best = filtered.length ? Math.max(...filtered.map(r => r.score)) : 0;
    const avg = filtered.length
        ? ((filtered.reduce((a, b) => a + b.score, 0) / (filtered.length * 10)) * 100).toFixed(1)
        : '0.0';

    const trendData = [...filtered]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(r => ({ label: fmt(r.created_at), value: r.score }));

    if (loading) {
        return (
            <View style={s.center}>
                <Text style={s.loadingText}>Loading records...</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
                <Animated.View style={[{ opacity: fade }, s.content]}>

                    {/* Header */}
                    <View style={s.pageHeader}>
                        <Ionicons name="flash" size={20} color={PURPLE} />
                        <View>
                            <Text style={s.pageTitle}>Performance Analytics</Text>
                            <Text style={s.pageSubtitle}>Track your quiz progress and accuracy</Text>
                        </View>
                    </View>

                    {/* Search */}
                    <View style={s.searchWrap}>
                        <Ionicons name="search-outline" size={15} color="#94a3b8" style={s.searchIcon} />
                        <TextInput
                            placeholder="Search quiz..."
                            placeholderTextColor="#94a3b8"
                            value={search}
                            onChangeText={setSearch}
                            style={s.searchInput}
                        />
                    </View>

                    {/* Stats row */}
                    <View style={s.statsRow}>
                        <StatCard label="AVG. SCORE" value={`${avg}%`} />
                        <StatCard label="PERSONAL BEST" value={`${best}/10`} />
                        <StatCard label="NEEDS REVIEW" value={String(failed)} accent={RED} />
                        <StatCard label="TOTAL QUIZZES" value={String(filtered.length)} />
                    </View>

                    {/* Charts row */}
                    <View style={s.chartsRow}>
                        <View style={s.chartBox}>
                            <Text style={s.chartTitle}>SUCCESS RATE</Text>
                            <DonutChart passed={passed} failed={failed} />
                        </View>
                        <View style={s.chartBox}>
                            <Text style={s.chartTitle}>SCORE TREND</Text>
                            <TrendChart data={trendData} />
                        </View>
                    </View>

                    {/* Table header */}
                    <View style={s.tableHeader}>
                        <Text style={[s.col, s.colDate]}>DATE</Text>
                        <Text style={[s.col, s.colName]}>QUIZ NAME</Text>
                        <Text style={[s.col, s.colScore]}>SCORE</Text>
                        <Text style={[s.col, s.colAcc]}>ACCURACY</Text>
                        <Text style={[s.col, s.colBtn]} />
                    </View>

                    {/* Table rows */}
                    {filtered.length === 0 ? (
                        <Text style={s.emptyText}>No records found.</Text>
                    ) : (
                        filtered.map((r, i) => {
                            const pass = r.score >= PASS_THRESHOLD;
                            const accuracy = Math.round((r.score / 10) * 100);
                            return (
                                <View key={i} style={[s.tableRow, i % 2 === 0 && s.tableRowAlt]}>
                                    <Text style={[s.col, s.colDate, s.cellText]}>{fmt(r.created_at)}</Text>
                                    <Text style={[s.col, s.colName, s.cellText]} numberOfLines={2}>{r.quiz_title}</Text>
                                    <Text style={[s.col, s.colScore, s.cellText, { color: pass ? PURPLE : RED, fontWeight: '700' }]}>
                                        {r.score} / 10
                                    </Text>
                                    <Text style={[s.col, s.colAcc, s.cellText]}>{accuracy}%</Text>
                                    <View style={[s.colBtn]}>
                                        <TouchableOpacity style={s.detailBtn} onPress={() => setSelected(r)}>
                                            <Text style={s.detailBtnText}>Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}

                </Animated.View>
            </ScrollView>

            <DetailModal record={selected} onClose={() => setSelected(null)} />
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 16, gap: 14 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#94a3b8', fontSize: 14 },

    // Header
    pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pageTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
    pageSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 1 },

    // Search
    searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 10 },
    searchIcon: { marginRight: 6 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#1e293b' },

    // Stats
    statsRow: { flexDirection: 'row', gap: 8 },

    // Charts
    chartsRow: { flexDirection: 'row', gap: 10 },
    chartBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
    chartTitle: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 10 },

    // Table
    tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#e2e8f0' },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f1f5f9' },
    tableRowAlt: { backgroundColor: '#fafafa' },
    col: { fontSize: 11 },
    colDate: { width: 42, color: '#64748b' },
    colName: { flex: 1, paddingRight: 6, color: '#1e293b' },
    colScore: { width: 48, textAlign: 'center' },
    colAcc: { width: 48, textAlign: 'center', color: '#64748b' },
    colBtn: { width: 62, alignItems: 'flex-end' },
    cellText: { fontSize: 12, color: '#1e293b' },
    emptyText: { textAlign: 'center', color: '#94a3b8', paddingVertical: 24, fontSize: 13 },

    detailBtn: { backgroundColor: PURPLE, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
    detailBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

const st = StyleSheet.create({
    card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 10 },
    label: { fontSize: 8, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.6, marginBottom: 4 },
    value: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    sub: { fontSize: 9, color: '#94a3b8', marginTop: 1 },
});

const dc = StyleSheet.create({
    wrap: { alignItems: 'center', gap: 10 },
    ring: { backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    arc: { position: 'absolute', width: '100%', height: '100%', borderRadius: 999, borderWidth: 18, borderColor: PURPLE, borderRightColor: 'transparent', borderBottomColor: 'transparent' },
    inner: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    pct: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    pctSub: { fontSize: 9, color: '#94a3b8' },
    legend: { flexDirection: 'row', gap: 10 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    legendText: { fontSize: 10, color: '#64748b' },
});

const tr = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'flex-end' },
    yAxis: { justifyContent: 'space-between', height: 80, marginRight: 6, alignItems: 'flex-end' },
    yLabel: { fontSize: 8, color: '#cbd5e1' },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
    barCol: { alignItems: 'center', gap: 4 },
    barBg: { width: 14, backgroundColor: '#f1f5f9', borderRadius: 4, justifyContent: 'flex-end' },
    barFill: { width: '100%', backgroundColor: PURPLE, borderRadius: 4 },
    barLabel: { fontSize: 8, color: '#94a3b8' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 80 },
    emptyText: { fontSize: 11, color: '#94a3b8' },
});

const md = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%', gap: 12 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 15, fontWeight: '800', color: '#1e293b', flex: 1, paddingRight: 8 },
    closeBtn: { padding: 4 },
    desc: { fontSize: 12, color: '#94a3b8', lineHeight: 18, marginTop: 2 },
    divider: { height: 1, backgroundColor: '#f1f5f9' },

    // Summary
    summaryRow: { flexDirection: 'row', gap: 8 },
    summaryBox: { flex: 1, alignItems: 'center', gap: 4 },
    summaryVal: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
    summaryLbl: { fontSize: 9, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    badgeText: { fontSize: 10, fontWeight: '700' },

    // Correct/wrong count
    countRow: { flexDirection: 'row', gap: 8 },
    countBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 10 },
    countText: { fontSize: 12, fontWeight: '700' },

    // Questions
    questionList: { maxHeight: 380 },
    questionCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    questionNum: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
    questionText: { fontSize: 13, fontWeight: '600', color: '#1e293b', lineHeight: 19, marginBottom: 8 },
    answerRow: { borderRadius: 8, padding: 8, marginBottom: 6 },
    answerLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
    answerVal: { fontSize: 12, fontWeight: '600', lineHeight: 17 },

    // Loading
    loadingWrap: { paddingVertical: 24, alignItems: 'center' },
    loadingText: { color: '#94a3b8', fontSize: 13 },

    // Close
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    rowValue: { fontSize: 13, color: '#1e293b' },
    closeAction: { backgroundColor: PURPLE, padding: 13, borderRadius: 12, alignItems: 'center' },
    closeActionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});