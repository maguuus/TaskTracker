import api from '../api/index.js';

/**
 * @returns {[
 *   (user: { email: string, password: string }) => Promise<{ token: string, user: User }>,
 *   (user: { name?: string, email: string, password: string }) => Promise<{ token: string, user: User }>,
 *   () => Promise<User>,
 *   (dto: { oldPassword: string, newPassword: string }) => Promise<{ message?: string }>
 * ]}
 */
export function useDBUser() {

    async function login(user) {
        return (await api.post(`/api/auth/login`, user)).data;
    }
    async function register(user) {
        return (await api.post(`/api/auth/register`, user)).data;
    }
    
    /** 
     * @returns{Promise<User>}
     */
    async function getMe() {
        return (await api.get('/api/user/me')).data;
    }

    async function changePassword(dto) {
        return (await api.post('/api/user/change-password', dto)).data; 
    }

    return [login, register, getMe, changePassword];
}

/**
 * @returns {[
 *   (id: string) => Promise<Project[]>,
 *   (project: { name: string, ownerId: string, description?: string }) => Promise<Project>,
 *   (project: Partial<Project> & { id: string, name?: string, description?: string }) => Promise<void>,
 *   (project: Pick<Project, 'id'>) => Promise<void>
 * ]}
 */
export function useDBProjectMeta() {

    async function getMetas(id) {
        return (await api.get(`/api/projects/user/${id}`)).data;
    }
    async function post(/** @type {{ name: string, ownerId: string, description?: string }} */ project) {
        return (await api.post(`/api/projects/`, project)).data;
    }
    async function patch(/** @type {Partial<Project> & { id: string, name?: string, description?: string }} */ project) {
        return (await api.patch(`/api/projects/${project.id}`, project)).data;
    }
    async function remove(/** @type {Pick<Project, 'id'>} */ project) {
        return (await api.delete(`/api/projects/${project.id}`)).data;
    }

    return [getMetas, post, patch, remove];
}

/**
 * @returns {[
 *   (id: string) => Promise<Column[]>,
 *   (id: string) => Promise<Task[]>,
 *   (column: { title?: string, orderIndex: number, projectId: string }) => Promise<Column>,
 *   (column: Partial<Column> & { id: string }) => Promise<void>,
 *   (column: Pick<Column, 'id'>) => Promise<void>
 * ]}
 */
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
    async function patch(/** @type {Partial<Column> & { id: string }} */ column) {
        return (await api.patch(`/api/columns/${column.id}`, column)).data;
    }
    async function remove(/** @type {Pick<Column, 'id'>} */ column) {
        return (await api.delete(`/api/columns/${column.id}`)).data;
    }

    return [getColumns, getTasks, post, patch, remove];
}

/**
 * @returns {[
 *   (task: {
 *     title: string,
 *     description?: string,
 *     icon?: string,
 *     priority?: string,
 *     urgency?: string,
 *     dueDate?: string,
 *     columnId: string,
 *     orderIndex: number,
 *     plannedStartAt?: string,
 *     tags?: string[]
 *   }) => Promise<Task>,
 *   (task: Partial<Task> & { id: string }) => Promise<Task>,
 *   (task: Pick<Task, 'id'>) => Promise<void>
 * ]}
 */
export function useDBTask() {

    /** 
     * @returns {Task}
     */
    async function post(task) {
        return (await api.post(`/api/tasks/`, task)).data;
    }
    async function patch(/** @type {Partial<Task> & { id: string }} */ task) {
        return (await api.patch(`/api/tasks/${task.id}`, task)).data;
    }
    async function remove(/** @type {Pick<Task, 'id'>} */ task) {
        return (await api.delete(`/api/tasks/${task.id}`)).data;
    }

    return [post, patch, remove];
}