import Sidebar from '@/components/Sidebar';
import { COLORS } from '@/constants/colors';
import useAuth from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type IconProps = { color: string; size: number }

export default function Layout() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const hideHeader =
        pathname.startsWith('/quiz') ||
        pathname.includes('quiz/');

    // ✅ AUTH GUARD
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login'); // adjust if your route is different
        }
    }, [user, loading, router]);

    // ✅ PREVENT FLICKER
    if (loading || !user) {
        return null; // or splash screen
    }

    return (
        <Drawer
            drawerContent={(props: any) => <Sidebar {...props} />}
            screenOptions={{
                drawerStyle: {
                    backgroundColor: COLORS.dark,
                    width: 250,
                },

                headerShown: !hideHeader,
                headerStyle: {
                    backgroundColor: COLORS.primary,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#fff',
                drawerActiveTintColor: '#fff',
                drawerActiveBackgroundColor: COLORS.primary,
                drawerInactiveTintColor: COLORS.textLight,
                drawerLabelStyle: {
                    marginLeft: -10,
                    fontWeight: '600',
                },

                headerRight: hideHeader
                    ? () => null
                    : () => (
                        <View style={styles.headerContainer}>
                            <View style={styles.textContainer}>
                                <Text style={styles.nameText} numberOfLines={1}>
                                    {user.full_name}
                                </Text>
                                <Text style={styles.statusText}>
                                    Online
                                </Text>
                            </View>
                            <Image
                                source={{
                                    uri: user.profile_photo
                                        ? user.profile_photo
                                        : 'https://i.pravatar.cc/100',
                                }}
                                style={styles.avatar}
                            />
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: 15,
        gap: 10,
    },
    textContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    nameText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
        maxWidth: 120,
    },
    statusText: {
        color: COLORS.online,
        fontSize: 10,
        marginTop: 2,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
});