import api from './api/index.js';

async function requestDB(request) {
    try {
        const response = await request();
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

export function useDBUser() {

    async function login(user) {
        return (await api.post(`/api/auth/login`, user)).data;
    }
    async function register(user) {
        return (await api.post(`/api/auth/register`, user)).data;
    }
    
    async function getMe() {
        return (await api.get('/api/user/me')).data;
    }

    return [login, register, getMe];
}

export function useDBProjectMeta() {

    async function getMetas(id) {
        return (await api.get(`/api/projects/user/${id}`)).data;
    }
    async function post(project) {
        return (await api.post(`/api/projects/`, project)).data;
    }
    async function patch(project) {
        return (await api.patch(`/api/projects/${project.id}`, project)).data;
    }
    async function remove(project) {
        return (await api.delete(`/api/projects/${project.id}`)).data;
    }

    return [getMetas, post, patch, remove];
}

export function useDBColumn() {

    async function getColumns(id) {
        return (await api.get(`/api/columns/project/${id}`)).data;
    }
    async function getTasks(id) {
        return (await api.get(`/api/tasks/column/${id}`)).data;
    }
    async function post(column) {
        return (await api.post(`/api/columns/`, column)).data;
    }
    async function patch(column) {
        return (await api.patch(`/api/columns/${column.id}`, column)).data;
    }
    async function remove(column) {
        return (await api.delete(`/api/columns/${column.id}`)).data;
    }

    return [getColumns, getTasks, post, patch, remove];
}

export function useDBTask() {

    async function post(task) {
        return (await api.post(`/api/tasks/`, task)).data;
    }
    async function patch(task) {
        return (await api.patch(`/api/tasks/${task.id}`, task)).data;
    }
    async function remove(task) {
        return (await api.delete(`/api/tasks/${task.id}`)).data;
    }

    return [post, patch, remove];
}