import Sidebar from '@/components/Sidebar';
import { COLORS } from '@/constants/colors';
import useAuth from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IconProps = { color: string; size: number };

const NAV_BG = '#1a1740';
const INDIGO = '#6366f1';

export default function Layout() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const hideHeader =
        pathname.startsWith('/quiz') || pathname.includes('quiz/');

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    const AVATAR_BASE = 'https://dashquiz.ralphcabanero.com/storage/images/profiles/';
    const LOCAL_AVATAR_BASE = 'http://127.0.0.1:8000/storage/images/profiles/';

    if (loading || !user) return null;
    const avatarUri = user.profile_photo
        ? `${LOCAL_AVATAR_BASE}${user.profile_photo}`
        : `${LOCAL_AVATAR_BASE}default.png`;


    return (
        <Drawer
            drawerContent={(props: any) => <Sidebar {...props} />}
            screenOptions={{
                /* ── Drawer panel ── */
                drawerStyle: {
                    backgroundColor: NAV_BG,
                    width: 250,
                }, headerStatusBarHeight: 0,

                /* ── Item colors ── */
                drawerActiveTintColor: '#ffffff',
                drawerActiveBackgroundColor: 'rgba(99, 102, 241, 0.25)',
                drawerInactiveTintColor: '#94a3b8',
                drawerInactiveBackgroundColor: 'transparent',
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

                /* ── Header ── */
                headerShown: !hideHeader,
                headerStyle: {
                    backgroundColor: '#1a1740',
                    height: 56,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                },
                headerTintColor: '#fff',

                /* ── Header left: hamburger is auto, tintColor makes it white ── */

                /* ── Header right: user info + avatar ── */
                headerRight: hideHeader
                    ? () => null
                    : () => (
                        <View style={styles.headerRight}>
                            <View style={styles.headerTextWrap}>
                                <Text style={styles.headerName} numberOfLines={1}>
                                    {user.full_name}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => router.push('/user-folder/profile')}>
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={styles.headerAvatar}
                                />
                            </TouchableOpacity>
                        </View>
                    ),

            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: 'Home',
                    drawerIcon: ({ color, size }: IconProps) => (
                        <Ionicons name="home" color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="quizzes"
                options={{
                    title: 'Quizzes',
                    drawerIcon: ({ color, size }: IconProps) => (
                        <Ionicons name="reader" color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="records"
                options={{
                    title: 'My Records',
                    drawerIcon: ({ color, size }: IconProps) => (
                        <Ionicons name="bar-chart" color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="profile"
                options={{
                    title: 'My Profile',
                    headerRight: () => null,
                    drawerIcon: ({ color, size }: IconProps) => (
                        <Ionicons name="person" color={color} size={size} />
                    ),
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    /* ── Header title ── */
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerLogoWrap: {
        width: 26,
        height: 26,
        backgroundColor: INDIGO,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    boltTop: {
        position: 'absolute',
        top: 2,
        left: 7,
        width: 8,
        height: 11,
        backgroundColor: '#fff',
        borderRadius: 2,
        transform: [{ rotate: '20deg' }, { skewX: '-12deg' }],
    },
    boltBottom: {
        position: 'absolute',
        bottom: 2,
        left: 11,
        width: 8,
        height: 11,
        backgroundColor: '#fff',
        borderRadius: 2,
        transform: [{ rotate: '20deg' }, { skewX: '-12deg' }],
    },
    headerLogoText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 1.2,
    },
    headerLogoAccent: {
        color: '#818cf8',
    },

    /* ── Header right ── */
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginRight: 16,
    },
    headerTextWrap: {
        alignItems: 'flex-end',
    },
    headerName: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
        maxWidth: 120,
    },
    headerStatus: {
        color: COLORS.online,
        fontSize: 10,
        marginTop: 2,
        fontWeight: '500',
    },
    headerAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});