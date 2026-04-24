import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Sidebar(props: any) {
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                {/* Sidebar Header: Logo and Title */}
                <View style={styles.header}>
                    <Image
                        source={require('../assets/images/bolt.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Dash Quiz</Text>
                </View>

                {/* This renders your actual menu links (Home, Profile, etc.) */}
                <View style={styles.menuContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* Sidebar Footer: Capstone Credit */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    © {new Date().getFullYear()} SNSU Capstone
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        backgroundColor: 'brown',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    appName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    menuContainer: {
        flex: 1,
        paddingTop: 10,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    footerText: {
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'center',
    },
});