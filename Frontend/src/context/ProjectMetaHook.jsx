import { useUser } from './UserContext';

export function useProjectsMeta() {
    const [currentUser, setCurrentUser] = useUser();

    function createProjectMeta(newProject) {
        setCurrentUser(prev => ({ ...prev, projects: [...prev.projects, newProject] })
        );
    }
    function updateProjectMeta(updatedProject) {
        setCurrentUser(prev => ({ ...prev, projects: prev.projects.map(p => p.id === updatedProject.id ? updatedProject : p) })
        );
    }
    function removeProjectMeta(projectToDelete) {
        setCurrentUser(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== projectToDelete.id) })
        );
    }

    return [createProjectMeta, updateProjectMeta, removeProjectMeta];
}