import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
    // change into localhost port if testing
    // http://127.0.0.1:8000/api
    baseURL: 'http://127.0.0.1:8000/api'
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

function helpme() { return "awesome bro!" }

helpme()