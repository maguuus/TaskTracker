import api from '../api/index.js';

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

    async function changePassword(dto) {
        return (await api.post('/api/user/change-password', dto)).data; 
    }

    return [login, register, getMe, changePassword];
}

export function useDBProjectMeta() {

    async function getMetas(id) {
        return (await api.get(`/api/projects/user/${id}`)).data;
    }
    async function post(/** @type {Project} */ project) {
        return (await api.post(`/api/projects/`, project)).data;
    }
    async function patch(/** @type {Project} */ project) {
        return (await api.patch(`/api/projects/${project.id}`, project)).data;
    }
    async function remove(/** @type {Project} */ project) {
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
    async function patch(/** @type {Column} */ column) {
        return (await api.patch(`/api/columns/${column.id}`, column)).data;
    }
    async function remove(/** @type {Column} */ column) {
        return (await api.delete(`/api/columns/${column.id}`)).data;
    }

    return [getColumns, getTasks, post, patch, remove];
}

export function useDBTask() {

    /** 
     * @returns {Task}
     */
    async function post(task) {
        return (await api.post(`/api/tasks/`, task)).data;
    }
    async function patch(/** @type {Task} */ task) {
        return (await api.patch(`/api/tasks/${task.id}`, task)).data;
    }
    async function remove(/** @type {Task} */ task) {
        return (await api.delete(`/api/tasks/${task.id}`)).data;
    }

    return [post, patch, remove];
}