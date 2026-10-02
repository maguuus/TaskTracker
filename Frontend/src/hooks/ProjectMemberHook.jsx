import api from '../api/index.js';

/** 
 * @typedef {Object} AddProjectMemberDto
 * @property {string} email
*/

/**
 * @returns {[
 *   (project: Project) => Promise<any>, 
 *   (project: Project, user: AddProjectMemberDto) => Promise<any>, 
 *   (project: Project, member: ProjectMember) => Promise<any>
 * ]}
 */
export function useProjectMembers() {

    async function getProjectMembers(/** @type {Project} */ project) {
        return (await api.get(`/api/projects/${project.id}/members`)).data;
    }

    async function addProjectMember(/** @type {Project} */ project, /** @type {AddProjectMemberDto} */ user) {
        return (await api.post(`/api/projects/${project.id}/members`, user)).data;
    }

    async function removeProjectMember(/** @type {Project} */ project, /** @type {ProjectMember} */ member) {
        return (await api.delete(`/api/projects/${project.id}/members/${member.userId || member.id}`)).data;
    }

    async function updateMemberRole(project, memberId, newRole) {
        return (await api.patch(`/api/projects/${project.id}/members/${memberId}`, { role: newRole })).data;
    }

    return [getProjectMembers, addProjectMember, removeProjectMember, updateMemberRole];
}