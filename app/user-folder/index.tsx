import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface User {
    full_name: string;
    email: string;
}

export default function Home() {
    // 2. Tell the state it can be a User OR null
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('token');

                if (!token) {
                    console.log("No token found");
                    return;
                }

                const res = await api.get('/me');
                // res.data.results should match the User interface
                setUserData(res.data.results);
            } catch (error) {
                console.log("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <View style={{ padding: 20 }}>
            <Text>Welcome to your Home Tab!</Text>

            {loading && <Text>Loading...</Text>}

            {/* 3. TypeScript now knows userData has full_name and email */}
            {userData && (
                <View>
                    <Text>Name: {userData.full_name}</Text>
                    <Text>Email: {userData.email}</Text>
                </View>
            )}
        </View>
    );
}