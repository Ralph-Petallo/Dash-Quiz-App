import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
    // change into localhost port if testing
    // http://localhost:8001/api
    baseURL: 'https://dashquiz.ralphcabanero.com/api'
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