import { useDBProjectMeta } from '../hooks/DataBaseHook.jsx';
import useUser from './UserContext';

export function useMYProjectsMeta() {
    const [currentUser, setCurrentUser] = useUser();
    const [getMetas, post, patch, remove] = useDBProjectMeta();

    async function loadProjectMeta() {
        if (!currentUser.id) return [];

        const response = await getMetas(currentUser.id);
        setCurrentUser(prevUser => ({
            ...prevUser,
            projects: response,
        }));

        return response;
    }

    async function createProjectMeta(newProject) {
        const savedProject = await post(newProject);
        setCurrentUser(prev => ({
            ...prev,
            projects: [...(prev?.projects ?? []), savedProject],
        }));
        return savedProject;
    }

    async function updateProjectMeta(updatedProject) {
        await patch(updatedProject);
        setCurrentUser(prev => ({
            ...prev,
            projects: (prev?.projects ?? []).map(p => p.id === updatedProject.id ? updatedProject : p),
        }));
        return updatedProject;
    }

    async function removeProjectMeta(projectToDelete) {
        await remove(projectToDelete);
        setCurrentUser(prev => ({
            ...prev,
            projects: (prev?.projects ?? []).filter(p => p.id !== projectToDelete.id),
        }));
        return projectToDelete;
    }

    return [createProjectMeta, updateProjectMeta, removeProjectMeta, loadProjectMeta];
}