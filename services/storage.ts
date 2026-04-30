import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
    id: number;
    firstName: string;
    email: string;
    lastName: string;
    password: string;
    confirmPassword: string;
}

export const USER_STORAGE_KEY = 'users';
const ID_COUNTER_KEY = 'last_user_id';

AsyncStorage.getItem(ID_COUNTER_KEY, Object.create([]));

export const storage = {

    // Internal helper to get and bump the ID
    getNextId: async (): Promise<number> => {
        try {
            const lastId = await AsyncStorage.getItem(ID_COUNTER_KEY);
            const nextId = lastId ? parseInt(lastId, 10) + 1 : 1;

            await AsyncStorage.setItem(ID_COUNTER_KEY, nextId.toString());
            return nextId;
        } catch (error) {
            return 1;
        }
    },

    registerUser: async (userData: Omit<UserProfile, 'id'>) => {
        try {
            // 1. Get the auto-incremented ID
            const newId = await storage.getNextId();

            const newUser: UserProfile = { ...userData, id: newId };

            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify([newUser]));

            console.log(`User registered with ID: ${newId}`);
            return newUser;
        } catch (error) {
            console.error("Save error:", error);
        }
    },

    getUser: async (): Promise<UserProfile | null> => {
        if (!USER_STORAGE_KEY) return null;

        try {
            const value = await AsyncStorage.getItem(USER_STORAGE_KEY);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("Fetch error:", error);
            return null;
        }
    },

    userLogout: async () => {
        try {

        } catch (error) {
            console.error("Clear error:", error);
        }
    },

    // 3. Add a clear method (Essential for Logouts!)
    clearUser: async () => {
        try {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        } catch (error) {
            console.error("Clear error:", error);
        }
    }
};