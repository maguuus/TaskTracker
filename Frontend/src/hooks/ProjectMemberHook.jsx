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
        return api.get(`/api/projects/${project.id}/members`);
    }

    async function addProjectMember(/** @type {Project} */ project, /** @type {AddProjectMemberDto} */ user) {
        return api.post(`/api/projects/${project.id}/members`, user)
    }

    async function removeProjectMember(/** @type {Project} */ project, /** @type {ProjectMember} */ member) {
        return api.delete(`api/projects/${project.id}/${member.id}`);
    }

    return [getProjectMembers, addProjectMember, removeProjectMember];
}