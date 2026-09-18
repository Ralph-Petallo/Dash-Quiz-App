import Sidebar from '@/components/Sidebar';
import useAuth from '@/hooks/useAuth';
import { API_BASE_URL } from '@/services/api';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const NAV_BG = '#1a1740';

export default function Layout() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    /* ── Hide header on quiz pages ── */
    const hideHeader = pathname.includes('quiz/') || pathname === '/quiz';

    /* ── Authentication ── */
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    /* ── Avatar ── */
    const LOCAL_AVATAR_BASE = `${API_BASE_URL}/storage/images/profiles/`;

    if (loading || !user) {
        return null;
    }

    const avatarUri = user.profile_photo
        ? `${LOCAL_AVATAR_BASE}${user.profile_photo}`
        : `${LOCAL_AVATAR_BASE}default.png`;

    return (
        <Drawer
            /*
             * Expo Router SDK 56+
             *
             * Sidebar is now a custom drawer content component.
             * Do NOT pass React Navigation drawer props.
             *
             * NOTE: because drawerContent is custom, React Navigation's
             * built-in drawer item list is never rendered, so
             * drawerStyle / drawerActiveTintColor / drawerInactiveTintColor /
             * drawerItemStyle / drawerLabelStyle / drawerIcon below have no
             * effect. Styling and icons belong in <Sidebar /> now.
             */
            drawerContent={() => <Sidebar />}

            screenOptions={{
                drawerStyle: {
                    backgroundColor: NAV_BG,
                    width: 250,
                },

                headerStatusBarHeight: 0,

                drawerActiveTintColor: '#ffffff',

                drawerActiveBackgroundColor:
                    'rgba(99, 102, 241, 0.25)',

                drawerInactiveTintColor: '#94a3b8',

                drawerInactiveBackgroundColor:
                    'transparent',

                drawerItemStyle: {
                    borderRadius: 10,
                    marginVertical: 2,
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                },

                drawerLabelStyle: {
                    fontSize: 15,
                    fontWeight: '500',
                    marginLeft: 10,
                },

                /* ─────────────────────────
                 * HEADER
                 * ───────────────────────── */
                headerShown: !hideHeader,

                headerStyle: {
                    backgroundColor: '#fff',
                    height: 56,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                },

                headerTintColor: 'black',

                /* ─────────────────────────
                 * HEADER RIGHT
                 * ───────────────────────── */
                headerRight: hideHeader
                    ? undefined
                    : () => (
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push(
                                        '/user-folder/profile'
                                    )
                                }
                            >
                                <Image
                                    source={{
                                        uri: avatarUri,
                                    }}
                                    style={styles.headerAvatar}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
            }}
        >
            {/* ─────────────────────────
             * HOME
             * ───────────────────────── */}
            <Drawer.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />

            {/* ─────────────────────────
             * QUIZZES
             * ───────────────────────── */}
            <Drawer.Screen
                name="quizzes"
                options={{
                    title: 'Assessments',
                }}
            />

            {/* ─────────────────────────
             * RECORDS
             * ───────────────────────── */}
            <Drawer.Screen
                name="records"
                options={{
                    title: 'My Records',
                }}
            />

            {/* ─────────────────────────
             * PROFILE
             * ───────────────────────── */}
            <Drawer.Screen
                name="profile"
                options={{
                    title: 'My Profile',

                    headerRight: () => null,
                }}
            />
        </Drawer>
    );
}

/* ─────────────────────────
 * STYLES
 * ───────────────────────── */

const styles = StyleSheet.create({
    /* ── Header right ── */
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginRight: 16,
    },

    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.15)',
    },
});