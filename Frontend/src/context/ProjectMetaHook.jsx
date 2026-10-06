import useUser from './UserContext';

// move to ..hooks/
export function useMYProjectsMeta() {
    const [currentUser, setCurrentUser] = useUser();

    function createProjectMeta(newProject) {
        setCurrentUser(prev => ({
            ...prev,
            projects: [...(prev?.projects ?? []), newProject],
        }));
        return newProject;
    }

    function updateProjectMeta(updatedProject) {
        setCurrentUser(prev => ({
            ...prev,
            projects: (prev?.projects ?? []).map(p => p.id === updatedProject.id ? updatedProject : p),
        }));
        return updatedProject;
    }

    function removeProjectMeta(projectToDelete) {
        setCurrentUser(prev => ({
            ...prev,
            projects: (prev?.projects ?? []).filter(p => p.id !== projectToDelete.id),
        }));
        return projectToDelete;
    }

    function setProjectsMeta(projects) {
        setCurrentUser(prev => ({
            ...prev,
            projects: projects,
        }));
        return projects;
    }

    return [createProjectMeta, updateProjectMeta, removeProjectMeta, setProjectsMeta];
}