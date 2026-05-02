import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Sidebar(props: any) {
    const router = useRouter()
    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.post('/logout'); // backend logout
                        } catch (e) {
                            console.log('Logout API error:', e);
                        }

                        await AsyncStorage.removeItem('token'); // remove token

                        router.replace('/'); // go to login
                    }
                }
            ]
        );

    }
    return (
        <View style={styles.container}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.drawerContent}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <Image
                        source={require('../assets/images/bolt.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Dash Quiz</Text>
                </View>

                {/* MENU */}
                <View style={styles.menuContainer}>
                    <DrawerItemList {...props} />
                </View>

            </DrawerContentScrollView>

            {/* FOOTER */}
            <SafeAreaView style={styles.footer}>
                <View style={styles.footerBox}>
                    <View style={styles.footerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>U</Text>
                        </View>

                        <View>
                            <Text style={styles.userName}>User</Text>
                            <Text style={styles.userRole}>Student</Text>
                        </View>
                    </View>

                    {/* LOGOUT BUTTON (RIGHT SIDE) */}
                    <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1B4B',
    },

    drawerContent: {
        paddingTop: 0,
    },

    header: {
        padding: 30,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        marginBottom: 10,
    },

    logo: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },

    appName: {
        fontSize: 22,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
    },

    menuContainer: {
        flex: 1,
    },

    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        padding: 12,
    },

    footerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },

    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    logoutBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#dc2626',
        borderRadius: 6,
    },

    logoutText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
    },

    avatar: {
        width: 38,
        height: 38,
        backgroundColor: 'purple',
        alignItems: 'center',
    },

    avatarText: {
        flex: 1,
        alignContent: 'center',
        color: 'white',
        fontWeight: 'bold',
    },

    userName: {
        color: 'white',
        fontWeight: '600',
    },

    userRole: {
        color: '#94a3b8',
        fontSize: 12,
    },
});