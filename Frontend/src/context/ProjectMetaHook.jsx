import useUser from './UserContext';

// move to ..hooks/
export function useMYProjectsMeta() {
    const [currentUser, setCurrentUser] = useUser();

    function createProjectMeta(newProject) {
        if (!newProject?.id) return newProject;

        setCurrentUser(prev => {
            const existing = prev?.projects ?? [];
            if (existing.some(p => p.id === newProject.id)) {
                return prev;
            }
            return {
                ...prev,
                projects: [...existing, newProject],
            };
        });

        return newProject;
    }

    function updateProjectMeta(updatedProject) {
        setCurrentUser(prev => ({
            ...prev,
            projects: (prev?.projects ?? []).map(p =>
                p.id === updatedProject.id ? { ...p, ...updatedProject } : p
            ),
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