import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

export const API_BASE_URL =
    Platform.OS === 'web'
        ? 'http://127.0.0.1:8000/api'
        : process.env.API_URL_BASE_SERVER;

const api = axios.create({
    // change into localhost port if testing
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log('TOKEN:', token);
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
