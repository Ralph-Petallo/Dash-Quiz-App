import api from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, useRouter } from 'expo-router';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const LIGHT_GRAY = '#D3D3D3';
const GRAY = '#A9A9A9';
const DARK_GRAY = '#696969';

const GLASS = 'rgba(0,0,0,0.04)';
const GLASS_LIGHT = 'rgba(0,0,0,0.07)';
const GLASS_BORDER = 'rgba(0,0,0,0.12)';
const GLASS_BORDER_SOFT = 'rgba(0,0,0,0.07)';


const NAV_ITEMS = [
    { key: 'home', label: 'Home', icon: 'home', route_path: '/user-folder' },
    { key: 'quiz', label: 'Assessments', icon: 'desktop', route_path: '/user-folder/quizzes' },
    { key: 'records', label: 'Records', icon: 'chart-bar', route_path: '/user-folder/records' },
    { key: 'profile', label: 'Profile', icon: 'user', route_path: '/user-folder/profile' },
];

export default function Sidebar() {
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
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
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom']}
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.logoIconWrap}>
                        <Image
                            source={require('../assets/images/lightning.png')}
                            style={styles.logo}
                        />
                    </View>

                    <Text style={styles.appName}>
                        CSS
                        <Text style={styles.appNameAccent}>
                            Prep
                        </Text>
                    </Text>
                </View>

                {/* MENU LABEL */}
                <Text style={styles.menuLabel}>
                    MAIN MENU
                </Text>

                {/* MENU ITEMS */}
                {NAV_ITEMS.map((item) => (
                    <Pressable
                        key={item.key}
                        style={({ pressed }) => [
                            styles.menuItem,
                            pressed && styles.menuItemPressed,
                        ]}
                        onPress={() => router.push(item.route_path as Href)}
                    >
                        <View style={styles.menuIconWrap}>
                            <FontAwesome5
                                name={item.icon}
                                size={15}
                                color={BLACK}
                            />
                        </View>

                        <Text style={styles.menuText}>
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>
                <View style={styles.footerBox}>

                    <Pressable
                        onPress={handleLogout}
                        style={({ pressed }) => [
                            styles.logoutBtn,
                            pressed && styles.logoutBtnPressed,
                        ]}
                    >
                        <FontAwesome5
                            name="sign-out-alt"
                            size={24}
                            color="#ff0000"
                        />
                        <Text>Logout</Text>
                    </Pressable>

                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    /*
    |--------------------------------------------------------------------------
    | MAIN
    |--------------------------------------------------------------------------
    */

    container: {
        flex: 1,
        backgroundColor: WHITE,
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,

        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,

        marginBottom: 6,
    },

    logoIconWrap: {
        width: 32,
        height: 32,

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',
        borderRadius: 8,
    },

    logo: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },

    appName: {
        fontSize: 18,
        fontWeight: '800',

        color: BLACK,

        letterSpacing: 1.5,
    },

    appNameAccent: {
        color: DARK_GRAY,
    },

    /*
    |--------------------------------------------------------------------------
    | MENU
    |--------------------------------------------------------------------------
    */

    menuLabel: {
        fontSize: 10,
        fontWeight: '700',

        color: DARK_GRAY,

        letterSpacing: 1.4,

        paddingHorizontal: 20,

        marginTop: 10,
        marginBottom: 6,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',

        marginHorizontal: 12,
        marginVertical: 3,

        paddingHorizontal: 12,
        paddingVertical: 12,

        borderRadius: 10,

        borderWidth: 1,
        borderColor: 'transparent',
    },

    menuItemPressed: {
        backgroundColor: GLASS_LIGHT,
        borderColor: GLASS_BORDER,
    },

    menuIconWrap: {
        width: 32,
        height: 32,

        borderRadius: 9,

        alignItems: 'center',
        justifyContent: 'center',


        borderWidth: 1,
        borderColor: GLASS_BORDER_SOFT,
    },

    menuText: {
        color: BLACK,

        fontSize: 14,
        fontWeight: '600',

        marginLeft: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | FOOTER
    |--------------------------------------------------------------------------
    */

    footer: {
        borderTopWidth: 1,
        borderTopColor: GLASS_BORDER_SOFT,

        backgroundColor: WHITE,
    },

    footerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 16,
        paddingVertical: 12,
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

        backgroundColor: BLACK,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 1,
        borderColor: DARK_GRAY,
    },

    avatarText: {
        color: WHITE,

        fontWeight: '800',
        fontSize: 16,
    },

    userName: {
        color: BLACK,

        fontWeight: '700',
        fontSize: 14,
    },

    userRole: {
        color: DARK_GRAY,

        fontSize: 12,

        marginTop: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    logoutBtn: {
        width: 100,
        height: 34,

        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoutBtnPressed:{
        backgroundColor:'red'
    }
});