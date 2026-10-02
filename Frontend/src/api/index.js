import axios from "axios";
import signalr from "@microsoft/signalr"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
})

export default api;

export const hub = new signalr.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}/hubs/board`, {
        accessTokenFactory: () => loaclStorage.getItem("token"),
    })
    .withAutomaticReconnect()
    .build();
