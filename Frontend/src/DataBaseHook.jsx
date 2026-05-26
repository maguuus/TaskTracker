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
        return await /**/api.post(`/api/auth/login`, user);
    }
    async function register(user) {
        return await /**/api.post(`/api/auth/register`, user);
    }
    // async function remove(id) {
    //     return await /**/api.patch(`/projects/${id}`);
    // }

    return [login, register];
}

export function useDBProjectMeta() {

    async function getMetas(id) {
        return await /**/api.get(`/api/user/${id}`);
    }
    async function post(project) {
        return await /**/api.post(`/api/`, project);
    }
    async function patch(project) {
        return await /**/api.patch(`/api/${project.id}`, project);
    }
    async function remove(id) {
        return await /**/api.patch(`/api/${id}`);
    }

    return [getMetas, post, patch, remove];
}

export function useDBColumn() {

    async function getColumns(id) {
        return await /**/api.get(`/api/project/${id}`);
    }
    async function getTasks(id) {
        return await /**/api.get(`/api/column/${id}`);
    }
    async function post(column) {
        return await /**/api.post(`/api/`, column);
    }
    async function patch(column) {
        return await /**/api.patch(`/api/${column.id}`, column);
    }
    async function remove(id) {
        return await /**/api.patch(`/api/${id}`);
    }

    return [getTasks, post, patch, remove];
}

export function useDBTask() {

    async function post(task) {
        return await /**/api.post(`/api/`, task);
    }
    async function patch(task) {
        return await /**/api.patch(`/api/${task.id}`, task);
    }
    async function remove(id) {
        return await /**/api.patch(`/api/${id}`);
    }

    return [post, patch, remove];
}