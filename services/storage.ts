import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const USER_STORAGE_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';

export const storage = {
    // Register: Adds a new user to the array
    registerUser: async (userData: Omit<UserProfile, 'id'>) => {
        try {
            const existingData = await AsyncStorage.getItem(USER_STORAGE_KEY);
            const users: UserProfile[] = existingData ? JSON.parse(existingData) : [];
            
            const newUser: UserProfile = { 
                ...userData, 
                id: Date.now() // Simple unique ID
            };

            users.push(newUser);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
            return newUser;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },

    // Login: Finds user and sets "session"
    login: async (email: string, pass: string): Promise<UserProfile | null> => {
        try {
            const data = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (!data) return null;

            const users: UserProfile[] = JSON.parse(data);
            const user = users.find(u => u.email === email && u.password === pass);

            if (user) {
                await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                return user;
            }
            return null;
        } catch (error) {
            return null;
        }
    },

    // Get current logged in user
    getCurrentUser: async (): Promise<UserProfile | null> => {
        const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    logout: async () => {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
};