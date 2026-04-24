import { Drawer } from 'expo-router/drawer';
import Sidebar from '../../components/Sidebar'; // Import your component

export default function Layout() {
    return (
        <Drawer
            drawerContent={(props) => <Sidebar {...props} />}
            screenOptions={{
                headerStyle: { backgroundColor: '#4f46e5' },
                headerTintColor: '#fff',
                drawerActiveBackgroundColor: '#f5f5f5', // Light blue tint
                drawerActiveTintColor: '#4f46e5',
                drawerLabelStyle: { marginLeft: 20, fontWeight: '600' },
            }}
        >
            <Drawer.Screen name="index" options={{ drawerLabel: 'Home', title: 'Dashboard' }} />
            <Drawer.Screen name="profile" options={{ drawerLabel: 'Profile', title: 'My Profile' }} />
            <Drawer.Screen name="quizzes" options={{ drawerLabel: 'Quizzes', title: 'Quizzes' }} />
            <Drawer.Screen name="records" options={{ drawerLabel: 'Records', title: 'My Records' }} />
        </Drawer>
    );
}