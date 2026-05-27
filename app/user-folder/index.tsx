import useAuth from "@/hooks/useAuth";
import useData from "@/hooks/useData";
import { API_BASE_URL } from "@/services/api";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = "#6366f1";
const GOLD_COLOR = "#f59e0b";
const SILVER_COLOR = "#94a3b8";
const BRONZE_COLOR = "#c97f4a";
const LOCAL_AVATAR_BASE = `${API_BASE_URL}/storage/images/profiles/`;

const getAvatar = (img?: string) => (img ? `${LOCAL_AVATAR_BASE}${img}` : `${LOCAL_AVATAR_BASE}default.png`);

const MEDAL_COLORS = [GOLD_COLOR, SILVER_COLOR, BRONZE_COLOR];
const MEDAL_ICONS = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = [90, 64, 50];
const AVATAR_SIZES = [60, 48, 42];

// ─── You Badge ────────────────────────────────────────────────────────────────

const YouBadge = () => (
    <View style={lb.youBadge}>
        <Text style={lb.youText}>You</Text>
    </View>
);

// ─── Podium Item ──────────────────────────────────────────────────────────────

const PodiumItem = ({ item, index }: { item: any; index: number }) => {
    const size = AVATAR_SIZES[index];
    const color = MEDAL_COLORS[index];
    const height = PODIUM_HEIGHTS[index];

    return (
        <View style={lb.podiumCol}>
            <View style={{ position: "relative", marginBottom: 4 }}>
                <Image
                    source={{ uri: getAvatar(item.profile_photo) }}
                    style={[lb.podiumAvatar, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}
                />
                <Text style={lb.podiumMedal}>{MEDAL_ICONS[index]}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
                <Text style={lb.podiumName} numberOfLines={1}>{item.name}</Text>
                {item.isYou && <YouBadge />}
            </View>

            <Text style={lb.podiumScore}>{item.score}/10</Text>

            {/* the bar hehe */}
            <View style={[lb.podiumBar, { height, backgroundColor: color }]} />
        </View>
    );
};

// ─── Score Ring ───────────────────────────────────────────────────────────────

const ScoreRing = ({ score }: { score: number }) => {
    const color = score >= 7 ? PURPLE : "#f43f5e";
    return (
        <View style={sr.wrap}>
            <View style={sr.track} />
            <View style={[sr.fill, { borderColor: color }]} />
            <Text style={[sr.text, { color }]}>{score}</Text>
        </View>
    );
};

// ─── Rank Badge ───────────────────────────────────────────────────────────────

const RankBadge = ({ rank }: { rank: number | null }) => (
    <View style={lb.rankBadge}>
        <View style={lb.rankDot} />
        <Text style={lb.rankText}>
            {rank ? `Rank #${rank}` : "Unranked"}
        </Text>
    </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
    const { leaders, fetchLeaderboard, loadingLeaderboard } = useData();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [selectedQuiz, setSelectedQuiz] = useState(""); 
    const [modalVisible, setModalVisible] = useState(false); // Controls our filter modal popup
    const fade = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            fetchLeaderboard();
        }, [fetchLeaderboard])
    );

    useEffect(() => {
        if (!loadingLeaderboard && leaders.length > 0) {
            fade.setValue(0); 

            Animated.timing(fade, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [loadingLeaderboard, leaders.length, fade]);

    // Unique quiz list parsing
    const availableQuizzes = useMemo(() => {
        const titles = leaders.map((item: any) => item.quiz_title).filter(Boolean);
        return ["All Quizzes", ...new Set(titles)];
    }, [leaders]);

    // Filter by Dropdown Option & score sorting
    const baseFilteredAndSorted = useMemo(() => {
        let list = [...leaders];
        
        if (selectedQuiz && selectedQuiz !== "All Quizzes") {
            list = list.filter((item) => item.quiz_title === selectedQuiz);
        }
        
        return list.sort((a, b) => b.score - a.score);
    }, [leaders, selectedQuiz]);

    // Search query parsing
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return baseFilteredAndSorted;

        return baseFilteredAndSorted.filter(
            (l) =>
                l.name.toLowerCase().includes(q) ||
                l.quiz_title.toLowerCase().includes(q)
        );
    }, [search, baseFilteredAndSorted]);

    const top3 = filtered.slice(0, 3);
    const listData = filtered.slice(3);

    const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

    const myRank = baseFilteredAndSorted.findIndex((l) => l.isYou);
    const myRankDisplay = myRank >= 0 ? myRank + 1 : null;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

    if (loadingLeaderboard) {
        return (
            <View style={lb.center}>
                <Ionicons name="trophy" size={32} color={PURPLE} />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#f5f7fa', '#c3cfe2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, margin: 10, overflow: 'hidden' }}
        >
            <ScrollView style={lb.container} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fade }}>

                    {/* Welcome */}
                    <View style={lb.welcome}>
                        <Text style={lb.welcomeGreeting}>
                            {greeting()}, {user?.full_name ?? "there"} 👋
                        </Text>
                        <Text style={lb.welcomeSub}>
                            See how you stack up against everyone else.
                        </Text>
                    </View>

                    {/* Header */}
                    <View style={lb.header}>
                        <View style={lb.headerLeft}>
                            <FontAwesome5 name="trophy" size={20} color={PURPLE} />
                            <View>
                                <Text style={lb.headerTitle}>Leaderboard</Text>
                                <Text style={lb.headerSub}>
                                    TOP {baseFilteredAndSorted.length} participants for selection
                                </Text>
                            </View>
                        </View>
                        <RankBadge rank={myRankDisplay} />
                    </View>

                    {/* Search Bar */}
                    <View style={lb.searchWrap}>
                        <Ionicons name="search-outline" size={15} color="#94a3b8" />
                        <TextInput
                            placeholder="Search participant..."
                            placeholderTextColor="#94a3b8"
                            value={search}
                            onChangeText={setSearch}
                            style={lb.searchInput}
                        />
                    </View>

                    {/* Modern Custom Space-Between Filter Bar */}
                    <View style={lb.filterBarRow}>
                        <Text style={lb.filterLabel}>Filter Results</Text>
                        <TouchableOpacity 
                            style={lb.selectTrigger} 
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={lb.selectTriggerText} numberOfLines={1}>
                                {selectedQuiz || "All Quizzes"}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* ─── PODIUM ─── */}
                    {top3.length > 0 && (
                        <View style={lb.podiumWrap}>
                            {podium.map((item, i) => (
                                <PodiumItem
                                    key={`${item.user_id}-${i}`}
                                    item={item}
                                    index={i === 0 ? 1 : i === 1 ? 0 : 2}
                                />
                            ))}
                        </View>
                    )}

                    {/* ─── LIST VIEW ─── */}
                    <View style={lb.list}>
                        {listData.map((item) => {
                            const rank = baseFilteredAndSorted.indexOf(item) + 1;

                            return (
                                <View
                                    key={`${item.user_id}-${item.id}`}
                                    style={[lb.row, item.isYou && lb.rowHighlight]}
                                >
                                    <Text style={lb.rankNum}>{rank}</Text>

                                    <Image
                                        source={{ uri: getAvatar(item.profile_photo) }}
                                        style={lb.avatar}
                                    />

                                    <View style={lb.info}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                            <Text style={lb.name} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            {item.isYou && <YouBadge />}
                                        </View>
                                        <Text style={lb.quizTitle} numberOfLines={1}>
                                            {item.quiz_title}
                                        </Text>
                                    </View>

                                    <ScoreRing score={item.score} />
                                </View>
                            );
                        })}

                        {filtered.length === 0 && (
                            <Text style={lb.empty}>No results found.</Text>
                        )}
                    </View>

                </Animated.View>
            </ScrollView>

            {/* ─── DROP DOWN FILTER MODAL OVERLAY ─── */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={lb.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setModalVisible(false)}
                >
                    <View style={lb.modalContent}>
                        <View style={lb.modalHeader}>
                            <Text style={lb.modalHeaderTitle}>Select Quiz</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={availableQuizzes}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        lb.modalOption,
                                        (selectedQuiz === item || (item === "All Quizzes" && !selectedQuiz)) && lb.modalOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedQuiz(item === "All Quizzes" ? "" : item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        lb.modalOptionText,
                                        (selectedQuiz === item || (item === "All Quizzes" && !selectedQuiz)) && lb.modalOptionTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                    {(selectedQuiz === item || (item === "All Quizzes" && !selectedQuiz)) && (
                                        <Ionicons name="checkmark" size={16} color={PURPLE} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </LinearGradient>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const lb = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    welcome: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
    welcomeGreeting: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
    welcomeSub: { fontSize: 12, color: "#64748b", marginTop: 2 },

    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#1e293b" },
    headerSub: { fontSize: 11, color: "#64748b", marginTop: 1 },

    rankBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#ede9fe", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    rankDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PURPLE },
    rankText: { fontSize: 11, fontWeight: "700", color: PURPLE },

    searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 12, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e2e8f0" },
    searchInput: { flex: 1, paddingVertical: 11, fontSize: 13, color: "#1e293b" },

    // Dynamic Space Between Filter Styles
    filterBarRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    filterLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.5
    },
    selectTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        minWidth: 140,
        maxWidth: 180,
        gap: 6
    },
    selectTriggerText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1e293b",
        flex: 1
    },

    // Modal Dropdown Container Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24
    },
    modalContent: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        maxHeight: "50%",
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9"
    },
    modalHeaderTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0f172a"
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8
    },
    modalOptionSelected: {
        backgroundColor: "#f1f0ff"
    },
    modalOptionText: {
        fontSize: 13,
        color: "#334155",
        fontWeight: "500"
    },
    modalOptionTextSelected: {
        color: PURPLE,
        fontWeight: "700"
    },

    // Podium Layout
    podiumWrap: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, marginBottom: 20, gap: 8 },
    podiumCol: { flex: 1, alignItems: "center" },
    podiumAvatar: { borderWidth: 3 },
    podiumMedal: { position: "absolute", bottom: -4, right: -4, fontSize: 14 },
    podiumName: { fontSize: 11, fontWeight: "700", color: "#1e293b", textAlign: "center" },
    podiumScore: { fontSize: 11, color: PURPLE, fontWeight: "700", marginBottom: 6 },
    podiumBar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8 },

    youBadge: { backgroundColor: PURPLE, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    youText: { fontSize: 9, fontWeight: "700", color: "#fff" },

    list: { paddingHorizontal: 16, gap: 8, paddingBottom: 30 },
    row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 12, gap: 10, borderWidth: 1, borderColor: "#e8eaf0" },
    rowHighlight: { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" },
    rankNum: { width: 24, textAlign: "center", fontSize: 13, fontWeight: "700", color: "#94a3b8" },
    avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#e2e8f0" },
    info: { flex: 1 },
    name: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
    quizTitle: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
    empty: { textAlign: "center", color: "#94a3b8", paddingVertical: 24, fontSize: 13 },
});

const sr = StyleSheet.create({
    wrap: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
    track: { position: "absolute", width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: "#e2e8f0" },
    fill: { position: "absolute", width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderTopColor: "transparent", borderRightColor: "transparent" },
    text: { fontSize: 10, fontWeight: "800" },
});