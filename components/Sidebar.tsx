import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Power icon drawn with pure RN views
function PowerIcon() {
    return (
        <View style={powerStyles.wrap}>
            <View style={powerStyles.arc} />
            <View style={powerStyles.stem} />
        </View>
    );
}

const powerStyles = StyleSheet.create({
    wrap: {
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arc: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#fff',
        // clip top gap via borderTopColor transparent
        borderTopColor: 'transparent',
        transform: [{ rotate: '0deg' }],
    },
    stem: {
        position: 'absolute',
        top: 0,
        width: 2,
        height: 8,
        backgroundColor: '#fff',
        borderRadius: 1,
    },
});

export default function Sidebar(props: any) {
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.post('/logout');
                    } catch (e) {
                        console.log('Logout API error:', e);
                    }
                    await AsyncStorage.removeItem('token');
                    router.replace('/');
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.drawerContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.logoIconWrap}>
                        {/* Lightning bolt */}
                        <View style={styles.boltTop} />
                        <View style={styles.boltBottom} />
                    </View>
                    <Text style={styles.appName}>
                        DASH<Text style={styles.appNameAccent}>QUIZ</Text>
                    </Text>
                </View>

                {/* ── MENU LABEL ── */}
                <Text style={styles.menuLabel}>MAIN MENU</Text>

                {/* ── MENU ITEMS ── */}
                <View style={styles.menuContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* ── FOOTER ── */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <View style={styles.footerBox}>
                    {/* Avatar + info */}
                    <View style={styles.footerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>U</Text>
                        </View>
                        <View>
                            <Text style={styles.userName}>User</Text>
                            <Text style={styles.userRole}>Student</Text>
                        </View>
                    </View>

                    {/* Logout power button */}
                    <Pressable
                        onPress={handleLogout}
                        style={({ pressed }) => [
                            styles.logoutBtn,
                            pressed && styles.logoutBtnPressed,
                        ]}
                    >
                        <PowerIcon />
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}

const NAV_BG = '#1a1740';
const ITEM_ACTIVE = 'rgba(99, 102, 241, 0.25)';
const INDIGO = '#6366f1';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: NAV_BG,
    },

    drawerContent: {
        paddingTop: 0,
        paddingHorizontal: 0,
    },

    /* ── Header ── */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
        marginBottom: 6,
    },

    logoIconWrap: {
        width: 32,
        height: 32,
        backgroundColor: INDIGO,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    boltTop: {
        position: 'absolute',
        top: 3,
        left: 9,
        width: 9,
        height: 13,
        backgroundColor: '#fff',
        borderRadius: 2,
        transform: [{ rotate: '20deg' }, { skewX: '-12deg' }],
    },

    boltBottom: {
        position: 'absolute',
        bottom: 3,
        left: 14,
        width: 9,
        height: 13,
        backgroundColor: '#fff',
        borderRadius: 2,
        transform: [{ rotate: '20deg' }, { skewX: '-12deg' }],
    },

    appName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 1.5,
    },

    appNameAccent: {
        color: '#818cf8',
    },

    /* ── Menu label ── */
    menuLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 1.4,
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 6,
    },

    menuContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },

    /* ── Footer ── */
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.07)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: NAV_BG,
    },

    footerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    avatar: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: INDIGO,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },

    userName: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },

    userRole: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 1,
    },

    logoutBtn: {
        width: 34,
        height: 34,
        borderRadius: 5,
        backgroundColor: '#dc2626',
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoutBtnPressed: {
        backgroundColor: '#b91c1c',
    },
});