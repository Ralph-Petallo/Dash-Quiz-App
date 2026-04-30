import { FontAwesome5 } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import Sidebar from '../../components/Sidebar';

export default function Layout() {
    return (
        <Drawer
            drawerContent={(props) => <Sidebar {...props} />}
            screenOptions={{
                drawerLabel: () => null,
                drawerStyle: {
                    backgroundColor: '#1e1b4b', // dark purple
                    width: 200, // slim sidebar

                },
                headerStyle: { backgroundColor: '#4f46e5' },
                headerTintColor: '#fff',
                drawerActiveTintColor: '#4f46e5',
                drawerInactiveTintColor: 'white',
                drawerLabelStyle: { marginLeft: 20, fontWeight: '600', color: 'white', },
            }}>
            <Drawer.Screen
                name="index"
                options={{
                    drawerLabel: 'Home',
                    title: 'Home',
                    drawerIcon: ({ focused }) => (
                        <FontAwesome5
                            name="home"
                            size={24}
                            solid
                            color={focused ? '#6366f1' : '#9ca3af'}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="quizzes"
                options={{
                    drawerLabel: 'Quizzes',
                    title: 'Quizzes',
                    drawerIcon: ({ focused }) => (
                        <FontAwesome5
                            name="clipboard-list"
                            size={24}
                            solid
                            color={focused ? '#6366f1' : '#9ca3af'}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="records"
                options={{
                    drawerLabel: 'Record',
                    title: 'My Records',
                    drawerIcon: ({ focused }) => (
                        <FontAwesome5
                            name="chart-bar"
                            size={24}
                            solid
                            color={focused ? '#6366f1' : '#9ca3af'}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="profile"
                options={{
                    drawerLabel: 'Profile',
                    title: 'My Profile',
                    drawerIcon: ({ focused }) => (
                        <FontAwesome5
                            name="user"
                            size={24}
                            solid
                            color={focused ? '#6366f1' : '#9ca3af'}
                        />
                    ),
                }}
            />

        </Drawer>
    );
}