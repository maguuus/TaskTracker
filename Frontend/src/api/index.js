import axios from "axios";
import * as signalr from "@microsoft/signalr"

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

/** @type {signalr.HubConnection} */
export const hub = new signalr.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}/hubs/task-tracker`, {
        accessTokenFactory: () => localStorage.getItem("token"),
    })
    .withAutomaticReconnect()
    .build();