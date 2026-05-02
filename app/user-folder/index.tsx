import useAuth from "@/hooks/useAuth";
import useData from "@/hooks/useData";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = "#6366f1";
const GOLD = "#fbbf24";
const SILVER = "#cbd5e1";
const BRONZE = "#d4956a";
const AVATAR_BASE = "https://www.google.com/imgres?q=men&imgurl=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fthumbnails%2F005%2F346%2F410%2Fsmall%2Fclose-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg&imgrefurl=https%3A%2F%2Fwww.vecteezy.com%2Ffree-photos%2Fmen&docid=6cuNWOe8_OZ-yM&tbnid=ZmWcse0p0zXFyM&vet=12ahUKEwjerZPrv5qUAxUszzgGHYp9OG4QnPAOegQIHhAB..i&w=525&h=350&hcb=2&ved=2ahUKEwjerZPrv5qUAxUszzgGHYp9OG4QnPAOegQIHhAB";
const FALLBACK = "https://i.pravatar.cc/100";

const getAvatar = (p?: string) => (p ? `${AVATAR_BASE}${p}` : FALLBACK);

const MEDAL_COLORS = [GOLD, SILVER, BRONZE];
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
    const { leaders, fetchLeaderboard, loading } = useData();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    useEffect(() => {
        if (!loading) {
            Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }
    }, [loading]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return leaders.filter(
            (l) =>
                l.name.toLowerCase().includes(q) ||
                l.quiz_title.toLowerCase().includes(q)
        );
    }, [search, leaders]);

    // Podium: 2nd, 1st, 3rd
    const top3 = leaders.slice(0, 3);
    const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

    // Current user rank
    const myRank = leaders.findIndex((l) => l.isYou);
    const myRankDisplay = myRank >= 0 ? myRank + 1 : null;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

    if (loading) {
        return (
            <View style={lb.center}>
                <Ionicons name="trophy-outline" size={32} color={PURPLE} />
            </View>
        );
    }

    return (
        <ScrollView style={lb.container} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: fade }}>

                {/* Welcome */}
                <View style={lb.welcome}>
                    <Text style={lb.welcomeGreeting}>{greeting()}, {user?.full_name ?? "there"} 👋</Text>
                    <Text style={lb.welcomeSub}>See how you stack up against everyone else.</Text>
                </View>

                {/* Header */}
                <View style={lb.header}>
                    <View style={lb.headerLeft}>
                        <Ionicons name="bar-chart-outline" size={20} color={PURPLE} />
                        <View>
                            <Text style={lb.headerTitle}>Leaderboard</Text>
                            <Text style={lb.headerSub}>{leaders.length} participants this week</Text>
                        </View>
                    </View>
                    <RankBadge rank={myRankDisplay} />
                </View>

                {/* Search */}
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

                {/* Podium */}
                {top3.length >= 2 && (
                    <View style={lb.podiumWrap}>
                        {podium.map((item, i) => (
                            <PodiumItem key={item?.user_id ?? i} item={item} index={i === 0 ? 1 : i === 1 ? 0 : 2} />
                        ))}
                    </View>
                )}

                {/* List */}
                <View style={lb.list}>
                    {filtered.map((item, i) => (
                        <View
                            key={item.user_id}
                            style={[lb.row, item.isYou && lb.rowHighlight]}
                        >
                            {/* Rank */}
                            {i < 3 ? (
                                <Text style={lb.rankNum}>{MEDAL_ICONS[i]}</Text>
                            ) : (
                                <Text style={lb.rankNum}>{i + 1}</Text>
                            )}

                            {/* Avatar */}
                            <Image
                                source={{ uri: getAvatar(item.profile_photo) }}
                                style={lb.avatar}
                            />

                            {/* Info */}
                            <View style={lb.info}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <Text style={lb.name} numberOfLines={1}>{item.name}</Text>
                                    {item.isYou && <YouBadge />}
                                </View>
                                <Text style={lb.quizTitle} numberOfLines={1}>{item.quiz_title}</Text>
                            </View>

                            {/* Score ring */}
                            <ScoreRing score={item.score} />
                        </View>
                    ))}

                    {filtered.length === 0 && (
                        <Text style={lb.empty}>No results found.</Text>
                    )}
                </View>

            </Animated.View>
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const lb = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f1f2f8" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    // Welcome
    welcome: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
    welcomeGreeting: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
    welcomeSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },

    // Header
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#1e293b" },
    headerSub: { fontSize: 11, color: "#94a3b8", marginTop: 1 },

    // Rank badge
    rankBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#ede9fe", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    rankDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PURPLE },
    rankText: { fontSize: 11, fontWeight: "700", color: PURPLE },

    // Search
    searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 16, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e2e8f0" },
    searchInput: { flex: 1, paddingVertical: 11, fontSize: 13, color: "#1e293b" },

    // Podium
    podiumWrap: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, marginBottom: 20, gap: 8 },
    podiumCol: { flex: 1, alignItems: "center" },
    podiumAvatar: { borderWidth: 3 },
    podiumMedal: { position: "absolute", bottom: -4, right: -4, fontSize: 14 },
    podiumName: { fontSize: 11, fontWeight: "700", color: "#1e293b", textAlign: "center" },
    podiumScore: { fontSize: 11, color: PURPLE, fontWeight: "700", marginBottom: 6 },
    podiumBar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8 },

    // You badge
    youBadge: { backgroundColor: PURPLE, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    youText: { fontSize: 9, fontWeight: "700", color: "#fff" },

    // List
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