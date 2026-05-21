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

    return [getMetas, login, register];
}

export function useDBProjectMeta() {

    async function getMetas(id) {
        return await /**/api.get(`/user/${id}`);
    }
    async function post(project) {
        return await /**/api.post(`/`, project);
    }
    async function patch(project) {
        return await /**/api.patch(`/${project.id}`, project);
    }
    async function remove(id) {
        return await /**/api.patch(`/${id}`);
    }

    return [getColumns, post, patch, remove];
}

export function useDBColumn() {

    async function getColumns(id) {
        return await /**/api.get(`/project/${id}`);
    }
    async function getTasks(id) {
        return await /**/api.get(`/column/${id}`);
    }
    async function post(column) {
        return await /**/api.post(`/`, column);
    }
    async function patch(column) {
        return await /**/api.patch(`/${column.id}`, column);
    }
    async function remove(id) {
        return await /**/api.patch(`/${id}`);
    }

    return [getTasks, post, patch, remove];
}

export function useDBTask() {

    async function post(task) {
        return await /**/api.post(`/`, task);
    }
    async function patch(task) {
        return await /**/api.patch(`/${task.id}`, task);
    }
    async function remove(id) {
        return await /**/api.patch(`/${id}`);
    }

    return [post, patch, remove];
}