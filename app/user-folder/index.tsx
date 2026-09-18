import useAuth from "@/hooks/useAuth";
import useData from "@/hooks/useData";
import { API_BASE_URL } from "@/services/api";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    View,
} from "react-native";

// ─── Frosted Noir Palette ─────────────────────────────────────────────────────

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const LIGHT_GRAY = "#D3D3D3";
const GRAY = "#A9A9A9";
const DARK_GRAY = "#696969";

// Frosted surfaces
const GLASS = "rgba(0,0,0,0.035)";
const GLASS_LIGHT = "rgba(0,0,0,0.06)";
const GLASS_BORDER = "rgba(0,0,0,0.10)";
const GLASS_BORDER_LIGHT = "rgba(0,0,0,0.0  7)";

const LOCAL_AVATAR_BASE =`${API_BASE_URL}/storage/images/profiles/`;

const getAvatar = (img?: string) =>
    img
        ? `${LOCAL_AVATAR_BASE}${img}`
        : `${LOCAL_AVATAR_BASE}default.png`;

const MEDAL_COLORS = [
    BLACK,
    DARK_GRAY,
    GRAY,
];

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

const PodiumItem = ({
    item,
    index,
}: {
    item: any;
    index: number;
}) => {
    const size = AVATAR_SIZES[index];
    const color = MEDAL_COLORS[index];
    const height = PODIUM_HEIGHTS[index];

    return (
        <View style={lb.podiumCol}>
            <View style={styles.podiumAvatarWrap}>
                <Image
                    source={{
                        uri: getAvatar(item.profile_photo),
                    }}
                    style={[
                        lb.podiumAvatar,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            borderColor: color,
                        },
                    ]}
                />

                <Text style={lb.podiumMedal}>
                    {MEDAL_ICONS[index]}
                </Text>
            </View>

            <View style={styles.podiumNameRow}>
                <Text
                    style={lb.podiumName}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>

                {item.isYou && <YouBadge />}
            </View>

            <Text style={lb.podiumScore}>
                {item.score}/10
            </Text>

            <View
                style={[
                    lb.podiumBar,
                    {
                        height,
                        backgroundColor: color,
                    },
                ]}
            />
        </View>
    );
};

// ─── Score Ring ───────────────────────────────────────────────────────────────

const ScoreRing = ({
    score,
}: {
    score: number;
}) => {
    const color =
        score >= 7
            ? BLACK
            : GRAY;

    return (
        <View style={sr.wrap}>
            <View style={sr.track} />

            <View
                style={[
                    sr.fill,
                    {
                        borderColor: color,
                    },
                ]}
            />

            <Text
                style={[
                    sr.text,
                    {
                        color,
                    },
                ]}
            >
                {score}
            </Text>
        </View>
    );
};

// ─── Rank Badge ───────────────────────────────────────────────────────────────

const RankBadge = ({
    rank,
}: {
    rank: number | null;
}) => (
    <View style={lb.rankBadge}>
        <View style={lb.rankDot} />

        <Text style={lb.rankText}>
            {rank
                ? `Rank #${rank}`
                : "Unranked"}
        </Text>
    </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
    const {
        leaders,
        fetchLeaderboard,
        loadingLeaderboard,
    } = useData();

    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [selectedQuiz, setSelectedQuiz] = useState("");
    const [modalVisible, setModalVisible] =
        useState(false);

    const fade = useRef(
        new Animated.Value(0)
    ).current;

    useFocusEffect(
        useCallback(() => {
            fetchLeaderboard();
        }, [fetchLeaderboard])
    );

    useEffect(() => {
        if (
            !loadingLeaderboard &&
            leaders.length > 0
        ) {
            fade.setValue(0);

            Animated.timing(fade, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [
        loadingLeaderboard,
        leaders.length,
        fade,
    ]);

    // ─── Unique quiz list ─────────────────────────────────────────────────────

    const availableQuizzes = useMemo(() => {
        const titles = leaders
            .map(
                (item: any) =>
                    item.quiz_title
            )
            .filter(Boolean);

        return [
            "All Quizzes",
            ...new Set(titles),
        ];
    }, [leaders]);

    // ─── Filter and sort ──────────────────────────────────────────────────────

    const baseFilteredAndSorted = useMemo(() => {
        let list = [...leaders];

        if (
            selectedQuiz &&
            selectedQuiz !== "All Quizzes"
        ) {
            list = list.filter(
                (item) =>
                    item.quiz_title ===
                    selectedQuiz
            );
        }

        return list.sort(
            (a, b) => b.score - a.score
        );
    }, [leaders, selectedQuiz]);

    // ─── Search ───────────────────────────────────────────────────────────────

    const filtered = useMemo(() => {
        const q = search
            .toLowerCase()
            .trim();

        if (!q) {
            return baseFilteredAndSorted;
        }

        return baseFilteredAndSorted.filter(
            (l) =>
                l.name
                    .toLowerCase()
                    .includes(q) ||
                l.quiz_title
                    .toLowerCase()
                    .includes(q)
        );
    }, [
        search,
        baseFilteredAndSorted,
    ]);

    const top3 = filtered.slice(0, 3);
    const listData = filtered.slice(3);

    const podium = [
        top3[1],
        top3[0],
        top3[2],
    ].filter(Boolean);

    const myRank =
        baseFilteredAndSorted.findIndex(
            (l) => l.isYou
        );

    const myRankDisplay =
        myRank >= 0
            ? myRank + 1
            : null;

    // ─── Greeting ─────────────────────────────────────────────────────────────

    const greeting = () => {
        const h = new Date().getHours();

        if (h < 12) {
            return "Good morning";
        }

        if (h < 18) {
            return "Good afternoon";
        }

        return "Good evening";
    };

    // ─── Loading ──────────────────────────────────────────────────────────────

    if (loadingLeaderboard) {
        return (
            <View style={lb.center}>
                <View style={styles.loadingIcon}>
                    <Ionicons
                        name="trophy"
                        size={30}
                        color={BLACK}
                    />
                </View>
            </View>
        );
    }

    // ─── Main UI ──────────────────────────────────────────────────────────────

    return (
        <View style={styles.screen}>
            <ScrollView
                style={lb.container}
                contentContainerStyle={
                    styles.scrollContent
                }
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={{
                        opacity: fade,
                    }}
                >
                    {/* ─────────────────────────────────────────────────────
                        WELCOME
                    ───────────────────────────────────────────────────── */}

                    <View style={lb.welcome}>
                        <Text
                            style={
                                lb.welcomeGreeting
                            }
                        >
                            {greeting()},{" "}
                            {user?.full_name ??
                                "there"}{" "}
                            👋
                        </Text>

                        <Text
                            style={
                                lb.welcomeSub
                            }
                        >
                            See how you stack up
                            against everyone
                            else.
                        </Text>
                    </View>

                    {/* ─────────────────────────────────────────────────────
                        HEADER
                    ───────────────────────────────────────────────────── */}

                    <View style={lb.header}>
                        <View
                            style={
                                lb.headerLeft
                            }
                        >
                            <View
                                style={
                                    styles.titleIcon
                                }
                            >
                                <FontAwesome5
                                    name="trophy"
                                    size={15}
                                    color={BLACK}
                                />
                            </View>

                            <View>
                                <Text
                                    style={
                                        lb.headerTitle
                                    }
                                >
                                    Leaderboard
                                </Text>

                                <Text
                                    style={
                                        lb.headerSub
                                    }
                                >
                                    TOP{" "}
                                    {
                                        baseFilteredAndSorted.length
                                    }{" "}
                                    PARTICIPANTS
                                </Text>
                            </View>
                        </View>

                        <RankBadge
                            rank={myRankDisplay}
                        />
                    </View>

                    {/* ─────────────────────────────────────────────────────
                        SEARCH
                    ───────────────────────────────────────────────────── */}

                    <View
                        style={
                            lb.searchWrap
                        }
                    >
                        <Ionicons
                            name="search-outline"
                            size={16}
                            color={GRAY}
                        />

                        <TextInput
                            placeholder="Search participant..."
                            placeholderTextColor={
                                GRAY
                            }
                            value={search}
                            onChangeText={
                                setSearch
                            }
                            style={
                                lb.searchInput
                            }
                        />

                        {search.length > 0 && (
                            <TouchableOpacity
                                onPress={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={17}
                                    color={
                                        GRAY
                                    }
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ─────────────────────────────────────────────────────
                        FILTER
                    ───────────────────────────────────────────────────── */}

                    <View
                        style={
                            lb.filterBarRow
                        }
                    >
                        <View
                            style={
                                styles.filterLeft
                            }
                        >
                            <Ionicons
                                name="options-outline"
                                size={15}
                                color={
                                    DARK_GRAY
                                }
                            />

                            <Text
                                style={
                                    lb.filterLabel
                                }
                            >
                                Filter Results
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={
                                lb.selectTrigger
                            }
                            onPress={() =>
                                setModalVisible(
                                    true
                                )
                            }
                            activeOpacity={0.75}
                        >
                            <Text
                                style={
                                    lb.selectTriggerText
                                }
                                numberOfLines={1}
                            >
                                {selectedQuiz ||
                                    "All Quizzes"}
                            </Text>

                            <Ionicons
                                name="chevron-down"
                                size={14}
                                color={
                                    DARK_GRAY
                                }
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ─────────────────────────────────────────────────────
                        PODIUM
                    ───────────────────────────────────────────────────── */}

                    {top3.length > 0 && (
                        <View
                            style={
                                lb.podiumPanel
                            }
                        >
                            <View
                                style={
                                    styles.sectionHeader
                                }
                            >
                                <Text
                                    style={
                                        styles.sectionEyebrow
                                    }
                                >
                                    TOP PERFORMERS
                                </Text>

                                <View
                                    style={
                                        styles.sectionLine
                                    }
                                />
                            </View>

                            <View
                                style={
                                    lb.podiumWrap
                                }
                            >
                                {podium.map(
                                    (
                                        item,
                                        i
                                    ) => (
                                        <PodiumItem
                                            key={`${item.user_id}-${i}`}
                                            item={
                                                item
                                            }
                                            index={
                                                i ===
                                                    0
                                                    ? 1
                                                    : i ===
                                                        1
                                                        ? 0
                                                        : 2
                                            }
                                        />
                                    )
                                )}
                            </View>
                        </View>
                    )}

                    {/* ─────────────────────────────────────────────────────
                        LEADERBOARD LIST
                    ───────────────────────────────────────────────────── */}

                    <View style={lb.list}>
                        {listData.map(
                            (item) => {
                                const rank =
                                    baseFilteredAndSorted.indexOf(
                                        item
                                    ) + 1;

                                return (
                                    <View
                                        key={`${item.user_id}-${item.id}`}
                                        style={[
                                            lb.row,
                                            item.isYou &&
                                            lb.rowHighlight,
                                        ]}
                                    >
                                        <View
                                            style={
                                                styles.rankColumn
                                            }
                                        >
                                            <Text
                                                style={
                                                    lb.rankNum
                                                }
                                            >
                                                {rank}
                                            </Text>
                                        </View>

                                        <Image
                                            source={{
                                                uri: getAvatar(
                                                    item.profile_photo
                                                ),
                                            }}
                                            style={
                                                lb.avatar
                                            }
                                        />

                                        <View
                                            style={
                                                lb.info
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.nameRow
                                                }
                                            >
                                                <Text
                                                    style={
                                                        lb.name
                                                    }
                                                    numberOfLines={
                                                        1
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </Text>

                                                {item.isYou && (
                                                    <YouBadge />
                                                )}
                                            </View>

                                            <Text
                                                style={
                                                    lb.quizTitle
                                                }
                                                numberOfLines={
                                                    1
                                                }
                                            >
                                                {
                                                    item.quiz_title
                                                }
                                            </Text>
                                        </View>

                                        <ScoreRing
                                            score={
                                                item.score
                                            }
                                        />
                                    </View>
                                );
                            }
                        )}

                        {filtered.length === 0 && (
                            <View
                                style={
                                    styles.emptyPanel
                                }
                            >
                                <Ionicons
                                    name="search-outline"
                                    size={26}
                                    color={
                                        LIGHT_GRAY
                                    }
                                />

                                <Text
                                    style={
                                        lb.empty
                                    }
                                >
                                    No results found.
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ─────────────────────────────────────────────────────────────
                FILTER MODAL
            ───────────────────────────────────────────────────────────── */}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() =>
                    setModalVisible(false)
                }
            >
                <TouchableOpacity
                    style={
                        lb.modalOverlay
                    }
                    activeOpacity={1}
                    onPress={() =>
                        setModalVisible(
                            false
                        )
                    }
                >
                    <View
                        style={
                            lb.modalContent
                        }
                    >
                        <View
                            style={
                                lb.modalHeader
                            }
                        >
                            <View>
                                <Text
                                    style={
                                        lb.modalHeaderTitle
                                    }
                                >
                                    Select Quiz
                                </Text>

                                <Text
                                    style={
                                        styles.modalSub
                                    }
                                >
                                    Choose a leaderboard
                                    category
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() =>
                                    setModalVisible(
                                        false
                                    )
                                }
                                style={
                                    styles.closeButton
                                }
                            >
                                <Ionicons
                                    name="close"
                                    size={18}
                                    color={
                                        DARK_GRAY
                                    }
                                />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={
                                availableQuizzes
                            }
                            keyExtractor={(
                                item
                            ) => item}
                            showsVerticalScrollIndicator={
                                false
                            }
                            renderItem={({
                                item,
                            }) => {
                                const selected =
                                    selectedQuiz ===
                                    item ||
                                    (item ===
                                        "All Quizzes" &&
                                        !selectedQuiz);

                                return (
                                    <TouchableOpacity
                                        style={[
                                            lb.modalOption,
                                            selected &&
                                            lb.modalOptionSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedQuiz(
                                                item ===
                                                    "All Quizzes"
                                                    ? ""
                                                    : item
                                            );

                                            setModalVisible(
                                                false
                                            );
                                        }}
                                        activeOpacity={
                                            0.75
                                        }
                                    >
                                        <Text
                                            style={[
                                                lb.modalOptionText,
                                                selected &&
                                                lb.modalOptionTextSelected,
                                            ]}
                                        >
                                            {item}
                                        </Text>

                                        {selected && (
                                            <View
                                                style={
                                                    styles.checkCircle
                                                }
                                            >
                                                <Ionicons
                                                    name="checkmark"
                                                    size={
                                                        13
                                                    }
                                                    color={
                                                        WHITE
                                                    }
                                                />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ─── Leaderboard Styles ───────────────────────────────────────────────────────

const lb = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: WHITE,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: WHITE,
    },

    welcome: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
    },

    welcomeGreeting: {
        fontSize: 18,
        fontWeight: "800",
        color: BLACK,
        letterSpacing: -0.3,
    },

    welcomeSub: {
        fontSize: 12,
        color: DARK_GRAY,
        marginTop: 4,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 12,
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: BLACK,
        letterSpacing: -0.4,
    },

    headerSub: {
        fontSize: 9,
        color: DARK_GRAY,
        marginTop: 2,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    rankBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: GLASS_LIGHT,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },

    rankDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: BLACK,
    },

    rankText: {
        fontSize: 10,
        fontWeight: "700",
        color: DARK_GRAY,
    },

    searchWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        backgroundColor: GLASS,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 13,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },

    searchInput: {
        flex: 1,
        paddingVertical: 11,
        fontSize: 13,
        color: BLACK,
    },

    filterBarRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: GLASS,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },

    filterLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: DARK_GRAY,
        textTransform: "uppercase",
        letterSpacing: 0.7,
    },

    selectTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: GLASS_LIGHT,
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        minWidth: 140,
        maxWidth: 180,
        gap: 6,
    },

    selectTriggerText: {
        fontSize: 11,
        fontWeight: "600",
        color: DARK_GRAY,
        flex: 1,
    },

    podiumPanel: {
        marginHorizontal: 16,
        marginBottom: 18,
        borderRadius: 18,
        backgroundColor: GLASS,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        overflow: "hidden",
        paddingTop: 13,
    },

    podiumWrap: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 10,
        paddingTop: 8,
        gap: 6,
    },

    podiumCol: {
        flex: 1,
        alignItems: "center",
    },

    podiumAvatar: {
        borderWidth: 2,
    },

    podiumMedal: {
        position: "absolute",
        bottom: -5,
        right: -5,
        fontSize: 14,
    },

    podiumName: {
        fontSize: 10,
        fontWeight: "700",
        color: BLACK,
        textAlign: "center",
        maxWidth: 95,
    },

    podiumScore: {
        fontSize: 10,
        color: DARK_GRAY,
        fontWeight: "700",
        marginTop: 2,
        marginBottom: 6,
    },

    podiumBar: {
        width: "100%",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        opacity: 0.8,
    },

    youBadge: {
        backgroundColor: BLACK,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },

    youText: {
        fontSize: 8,
        fontWeight: "800",
        color: WHITE,
        letterSpacing: 0.3,
    },

    list: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 40,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: GLASS,
        borderRadius: 14,
        padding: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: GLASS_BORDER_LIGHT,
    },

    rowHighlight: {
        backgroundColor: GLASS_LIGHT,
        borderColor: GLASS_BORDER,
    },

    rankNum: {
        width: 24,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "700",
        color: DARK_GRAY,
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: GLASS_BORDER,
    },

    info: {
        flex: 1,
    },

    name: {
        fontSize: 13,
        fontWeight: "700",
        color: BLACK,
    },

    quizTitle: {
        fontSize: 10,
        color: DARK_GRAY,
        marginTop: 2,
    },

    empty: {
        textAlign: "center",
        color: DARK_GRAY,
        paddingVertical: 10,
        fontSize: 12,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },

    modalContent: {
        width: "100%",
        backgroundColor: WHITE,
        borderRadius: 18,
        maxHeight: "55%",
        padding: 16,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 12,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor:
            GLASS_BORDER_LIGHT,
    },

    modalHeaderTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: BLACK,
    },

    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 9,
        marginBottom: 3,
    },

    modalOptionSelected: {
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },

    modalOptionText: {
        fontSize: 12,
        color: DARK_GRAY,
        fontWeight: "500",
    },

    modalOptionTextSelected: {
        color: BLACK,
        fontWeight: "700",
    },
});

// ─── Score Ring ───────────────────────────────────────────────────────────────

const sr = StyleSheet.create({
    wrap: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },

    track: {
        position: "absolute",
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        borderColor:
            "rgba(169,169,169,0.18)",
    },

    fill: {
        position: "absolute",
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        borderTopColor: "transparent",
        borderRightColor: "transparent",
    },

    text: {
        fontSize: 10,
        fontWeight: "800",
    },
});

// ─── Shared Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Flat page — no outer card/container
    screen: {
        flex: 1,
        backgroundColor: WHITE,
    },

    scrollContent: {
        paddingBottom: 40,
    },

    titleIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        alignItems: "center",
        justifyContent: "center",
    },

    filterLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        gap: 9,
    },

    sectionEyebrow: {
        fontSize: 9,
        fontWeight: "800",
        color: DARK_GRAY,
        letterSpacing: 1.2,
    },

    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor:
            GLASS_BORDER_LIGHT,
    },

    podiumAvatarWrap: {
        position: "relative",
        marginBottom: 5,
    },

    podiumNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        flexWrap: "wrap",
        justifyContent: "center",
        minHeight: 20,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    rankColumn: {
        width: 24,
        alignItems: "center",
    },

    emptyPanel: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: GLASS,
        borderWidth: 1,
        borderColor: GLASS_BORDER_LIGHT,
        borderRadius: 14,
        paddingVertical: 22,
    },

    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },

    modalSub: {
        color: DARK_GRAY,
        fontSize: 10,
        marginTop: 3,
    },

    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: BLACK,
        alignItems: "center",
        justifyContent: "center",
    },

    loadingIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },
});