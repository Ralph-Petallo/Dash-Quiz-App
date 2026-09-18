import useData from '@/hooks/useData';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// FROSTED NOIR
// ─────────────────────────────────────────────────────────────────────────────

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const LIGHT_GRAY = '#D3D3D3';
const DARK_GRAY = '#696969';

const GLASS = 'rgba(0,0,0,0.035)';
const GLASS_LIGHT = 'rgba(0,0,0,0.06)';
const GLASS_BORDER = 'rgba(0,0,0,0.10)';
const GLASS_BORDER_SOFT = 'rgba(0,0,0,0.07)';

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty bars
// ─────────────────────────────────────────────────────────────────────────────

function DifficultyBars() {
    return (
        <View style={barStyles.wrap}>
            <View style={[barStyles.bar, { height: 5 }]} />
            <View style={[barStyles.bar, { height: 8 }]} />
            <View style={[barStyles.bar, { height: 11 }]} />
        </View>
    );
}

const icons = [
    'microchip',
    'desktop',
    'cogs',
];

const barStyles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        marginLeft: 7,
    },

    bar: {
        width: 4,
        backgroundColor: BLACK,
        borderRadius: 2,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function QuizDashboard() {
    const router = useRouter();

    const {
        quizzes,
        error,
        loadingQuizzes,
    } = useData();

    // ─────────────────────────────────────────────────────────────────────────
    // Error
    // ─────────────────────────────────────────────────────────────────────────

    if (error) {
        return (
            <View style={styles.centered}>
                <View style={styles.errorIcon}>
                    <FontAwesome
                        name="exclamation"
                        size={18}
                        color={BLACK}
                    />
                </View>

                <Text style={styles.errorTitle}>
                    Something went wrong
                </Text>

                <Text style={styles.errorText}>
                    {error}
                </Text>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Loading
    // ─────────────────────────────────────────────────────────────────────────

    if (loadingQuizzes && quizzes.length === 0) {
        return (
            <View style={styles.centered}>
                <View style={styles.loadingIcon}>
                    <FontAwesome5
                        name="clipboard-list"
                        size={19}
                        color={BLACK}
                    />
                </View>

                <ActivityIndicator
                    size="small"
                    color={BLACK}
                    style={styles.loader}
                />

                <Text style={styles.loadingText}>
                    Loading assessments...
                </Text>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Main
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >

            {/* ───────────────────────────────────────────────────────────────
                PAGE HEADER
            ─────────────────────────────────────────────────────────────── */}

            <View style={styles.pageHeader}>

                <View style={styles.headerIcon}>
                    <FontAwesome5
                        name="clipboard-check"
                        size={18}
                        color={WHITE}
                    />
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.pageTitle}>
                        Assessments
                    </Text>

                    <Text style={styles.pageSubtitle}>
                        Select a competency to begin your assessment
                    </Text>
                </View>

            </View>

            {/* ───────────────────────────────────────────────────────────────
                SUMMARY STRIP
            ─────────────────────────────────────────────────────────────── */}

            <View style={styles.summaryCard}>

                <View style={styles.summaryLeft}>

                    <View style={styles.summaryIcon}>
                        <FontAwesome
                            name="th-large"
                            size={15}
                            color={BLACK}
                        />
                    </View>

                    <View>
                        <Text style={styles.summaryTitle}>
                            Available Competencies
                        </Text>

                        <Text style={styles.summarySubtitle}>
                            Choose one to continue
                        </Text>
                    </View>

                </View>

                <View style={styles.countBadge}>
                    <Text style={styles.countValue}>
                        {quizzes.length}
                    </Text>

                    <Text style={styles.countLabel}>
                        {quizzes.length === 1
                            ? 'ASSESSMENT'
                            : 'ASSESSMENTS'}
                    </Text>
                </View>

            </View>

            {/* ───────────────────────────────────────────────────────────────
                SECTION HEADER
            ─────────────────────────────────────────────────────────────── */}

            {quizzes.length > 0 && (
                <View style={styles.sectionHeader}>

                    <View>
                        <Text style={styles.sectionTitle}>
                            COMPETENCY LIST
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Select an assessment below
                        </Text>
                    </View>

                    <View style={styles.sectionLine} />

                </View>
            )}

            {/* ───────────────────────────────────────────────────────────────
                EMPTY STATE
            ─────────────────────────────────────────────────────────────── */}

            {quizzes.length === 0 ? (
                <View style={styles.emptyContainer}>

                    <View style={styles.emptyIcon}>
                        <FontAwesome
                            name="folder-open-o"
                            size={25}
                            color={DARK_GRAY}
                        />
                    </View>

                    <Text style={styles.emptyTitle}>
                        No assessments available
                    </Text>

                    <Text style={styles.emptyText}>
                        There are currently no assessments
                        available to take.
                    </Text>

                </View>
            ) : (

                /* ───────────────────────────────────────────────────────────
                   ASSESSMENT CARDS
                ─────────────────────────────────────────────────────────── */

                quizzes.map((quiz: any, index: number) => {

                    const icon =
                        icons[index % icons.length];

                    return (
                        <TouchableOpacity
                            key={quiz.id}
                            activeOpacity={0.82}
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: '/quiz/[id]',
                                    params: {
                                        id: quiz.id,
                                    },
                                })
                            }
                        >

                            {/* Top accent line */}
                            <View style={styles.cardTopLine} />

                            <View style={styles.cardContent}>

                                {/* ───────────────────────────────────────
                                    ICON
                                ─────────────────────────────────────── */}

                                <View style={styles.iconColumn}>

                                    <View style={styles.iconWrapper}>
                                        <FontAwesome5
                                            name={icon}
                                            size={18}
                                            color={BLACK}
                                        />
                                    </View>

                                    <View style={styles.indexBadge}>
                                        <Text style={styles.indexText}>
                                            {String(index + 1).padStart(
                                                2,
                                                '0'
                                            )}
                                        </Text>
                                    </View>

                                </View>

                                {/* ───────────────────────────────────────
                                    INFORMATION
                                ─────────────────────────────────────── */}

                                <View style={styles.info}>

                                    <Text
                                        style={styles.title}
                                        numberOfLines={2}
                                    >
                                        {quiz.title}
                                    </Text>

                                    <Text
                                        style={styles.assessmentLabel}
                                    >
                                        COMPETENCY ASSESSMENT
                                    </Text>

                                    {/* Metadata */}
                                    <View style={styles.metaRow}>

                                        <View style={styles.metaItem}>
                                            <FontAwesome
                                                name="list-ul"
                                                size={10}
                                                color={DARK_GRAY}
                                            />

                                            <Text style={styles.meta}>
                                                {quiz.total_questions ?? 0}
                                                {' '}Questions
                                            </Text>
                                        </View>

                                        <View style={styles.metaDivider} />

                                        <View style={styles.metaItem}>
                                            <FontAwesome5
                                                name="signal"
                                                size={9}
                                                color={DARK_GRAY}
                                            />

                                            <Text style={styles.meta}>
                                                Assessment
                                            </Text>

                                            <DifficultyBars />
                                        </View>

                                    </View>

                                    {/* Completed */}
                                    {!!quiz.completed && (
                                        <View
                                            style={
                                                styles.completedBadge
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.completedIcon
                                                }
                                            >
                                                <FontAwesome
                                                    name="check"
                                                    size={7}
                                                    color={WHITE}
                                                />
                                            </View>

                                            <Text
                                                style={
                                                    styles.completedText
                                                }
                                            >
                                                Previously Completed
                                            </Text>
                                        </View>
                                    )}

                                </View>
                            </View>

                            {/* Bottom metadata */}
                            <View style={styles.cardFooter}>

                                <View style={styles.footerIndicator} />

                                <Text style={styles.footerText}>
                                    Tap to view assessment
                                </Text>

                                <View style={styles.footerSpacer} />

                                <FontAwesome
                                    name="long-arrow-right"
                                    size={12}
                                    color={DARK_GRAY}
                                />

                            </View>

                        </TouchableOpacity>
                    );
                })
            )}

        </ScrollView>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

    // ─────────────────────────────────────────────────────────────────────────
    // SCREEN
    // ─────────────────────────────────────────────────────────────────────────

    screen: {
        flex: 1,
        backgroundColor: WHITE,
    },

    container: {
        padding: 16,
        paddingBottom: 40,
        backgroundColor: WHITE,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CENTER STATES
    // ─────────────────────────────────────────────────────────────────────────

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: WHITE,
        paddingHorizontal: 30,
    },

    loadingIcon: {
        width: 52,
        height: 52,
        borderRadius: 15,
        backgroundColor: BLACK,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    loader: {
        marginBottom: 8,
    },

    loadingText: {
        color: DARK_GRAY,
        fontSize: 12,
        fontWeight: '600',
    },

    errorIcon: {
        width: 52,
        height: 52,
        borderRadius: 15,
        backgroundColor: GLASS_LIGHT,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    errorTitle: {
        color: BLACK,
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 5,
    },

    errorText: {
        color: DARK_GRAY,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE HEADER
    // ─────────────────────────────────────────────────────────────────────────

    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: BLACK,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    headerInfo: {
        flex: 1,
    },

    pageTitle: {
        color: BLACK,
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: -0.4,
    },

    pageSubtitle: {
        color: DARK_GRAY,
        fontSize: 11,
        marginTop: 3,
        lineHeight: 16,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────────────

    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        backgroundColor: BLACK,

        borderRadius: 15,

        paddingHorizontal: 14,
        paddingVertical: 13,

        marginBottom: 22,
    },

    summaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    summaryIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    summaryTitle: {
        color: WHITE,
        fontSize: 12,
        fontWeight: '800',
    },

    summarySubtitle: {
        color: LIGHT_GRAY,
        fontSize: 10,
        marginTop: 2,
    },

    countBadge: {
        minWidth: 48,
        height: 43,
        borderRadius: 10,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 7,
    },

    countValue: {
        color: BLACK,
        fontSize: 16,
        fontWeight: '900',
        lineHeight: 18,
    },

    countLabel: {
        color: DARK_GRAY,
        fontSize: 6.5,
        fontWeight: '800',
        letterSpacing: 0.4,
        marginTop: 2,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION HEADER
    // ─────────────────────────────────────────────────────────────────────────

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 11,
        paddingHorizontal: 2,
    },

    sectionTitle: {
        color: BLACK,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.1,
    },

    sectionSubtitle: {
        color: DARK_GRAY,
        fontSize: 10,
        marginTop: 3,
    },

    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: LIGHT_GRAY,
        marginLeft: 14,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CARD
    // ─────────────────────────────────────────────────────────────────────────

    card: {
        backgroundColor: WHITE,
        borderRadius: 15,
        marginBottom: 12,

        borderWidth: 1,
        borderColor: LIGHT_GRAY,

        overflow: 'hidden',

        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.055,
        shadowRadius: 6,

        elevation: 2,
    },

    cardTopLine: {
        height: 3,
        backgroundColor: BLACK,
    },

    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        paddingTop: 14,
        paddingBottom: 13,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ICON
    // ─────────────────────────────────────────────────────────────────────────

    iconColumn: {
        width: 49,
        alignItems: 'center',
        marginRight: 11,
    },

    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,

        backgroundColor: GLASS_LIGHT,

        borderWidth: 1,
        borderColor: GLASS_BORDER,

        alignItems: 'center',
        justifyContent: 'center',
    },

    indexBadge: {
        marginTop: 5,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: BLACK,
    },

    indexText: {
        color: WHITE,
        fontSize: 7,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // INFO
    // ─────────────────────────────────────────────────────────────────────────

    info: {
        flex: 1,
        minWidth: 0,
    },

    title: {
        color: BLACK,
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 19,
        marginBottom: 3,
    },

    assessmentLabel: {
        color: DARK_GRAY,
        fontSize: 7.5,
        fontWeight: '800',
        letterSpacing: 0.8,
        marginBottom: 7,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    meta: {
        color: DARK_GRAY,
        fontSize: 10,
        marginLeft: 5,
    },

    metaDivider: {
        width: 1,
        height: 12,
        backgroundColor: LIGHT_GRAY,
        marginHorizontal: 8,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COMPLETED
    // ─────────────────────────────────────────────────────────────────────────

    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',

        marginTop: 7,

        paddingHorizontal: 7,
        paddingVertical: 4,

        borderRadius: 6,

        backgroundColor: GLASS_LIGHT,

        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },

    completedIcon: {
        width: 14,
        height: 14,
        borderRadius: 4,
        backgroundColor: BLACK,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },

    completedText: {
        color: BLACK,
        fontSize: 9,
        fontWeight: '700',
    },


    // ─────────────────────────────────────────────────────────────────────────
    // CARD FOOTER
    // ─────────────────────────────────────────────────────────────────────────

    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 13,
        paddingVertical: 8,

        backgroundColor: GLASS,

        borderTopWidth: 1,
        borderTopColor: GLASS_BORDER_SOFT,
    },

    footerIndicator: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: BLACK,
        marginRight: 6,
    },

    footerText: {
        color: DARK_GRAY,
        fontSize: 8.5,
        fontWeight: '600',
    },

    footerSpacer: {
        flex: 1,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // EMPTY
    // ─────────────────────────────────────────────────────────────────────────

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',

        paddingVertical: 60,
        paddingHorizontal: 30,

        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        borderRadius: 15,

        backgroundColor: GLASS,
    },

    emptyIcon: {
        width: 58,
        height: 58,
        borderRadius: 17,

        backgroundColor: GLASS_LIGHT,

        borderWidth: 1,
        borderColor: LIGHT_GRAY,

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: 14,
    },

    emptyTitle: {
        color: BLACK,
        fontSize: 15,
        fontWeight: '800',
        textAlign: 'center',
    },

    emptyText: {
        color: DARK_GRAY,
        fontSize: 11,
        lineHeight: 17,
        textAlign: 'center',
        marginTop: 5,
        maxWidth: 260,
    },
});