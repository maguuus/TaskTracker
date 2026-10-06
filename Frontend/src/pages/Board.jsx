import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react'
import useProject from '../context/ProjectContext.jsx';
import useUser from '../context/UserContext.jsx';
import ProjectBoard from '../models/ProjectBoard.jsx';
import { hub } from '../api/index.js';

function Board() {

    const { projectId } = useParams();
    const navigate = useNavigate();

    const [currentProject, setCurrentProject] = useProject();
    const [currentUser, setCurrentUser] = useUser();

    if (!projectId)
        return <Navigate to="/" replace />;

    useEffect(() => {
        if (!currentProject) return;

        if (currentProject.id !== projectId) {
            setCurrentProject(null);
        }
    }, [currentProject, projectId, setCurrentProject]);

    // --- Обработка событий из вебсокета ---
    useEffect(() => {
        if (!projectId || !currentUser?.id) return;

        const handleStateChanged = (message) => {
            if (!message || message.type !== 'stateChanged') return;

            const { entityType, action, payload } = message;
            if (!['project', 'projectMember'].includes(entityType)) return;

            if (entityType === 'projectMember') {
                const memberId = payload?.memberId ?? payload?.member?.userId ?? payload?.member?.id ?? payload?.userId;
                const eventProjectId = payload?.projectId;

                if (eventProjectId !== projectId) return;

                if ((action === 'created' || action === 'updated') && memberId === currentUser.id) {
                    const nextRole = payload?.member?.role ?? payload?.role;
                    if (!nextRole) return;

                    setCurrentProject(prev => prev ? { ...prev, role: nextRole } : prev);
                    setCurrentUser(prev => prev ? {
                        ...prev,
                        projects: (prev.projects ?? []).map(p => p.id === projectId ? { ...p, role: nextRole } : p),
                    } : prev);
                    return;
                }

                if (action === 'deleted' && memberId === currentUser.id) {
                    navigate('/', { replace: true });
                    setCurrentProject(null);
                    setCurrentUser(prev => prev ? {
                        ...prev,
                        projects: (prev.projects ?? []).filter(p => p.id !== projectId),
                    } : prev);
                    return;
                }
            }

            if (entityType === 'project') {
                const eventProjectId = payload?.projectId ?? payload?.project?.id ?? payload?.id;
                if (eventProjectId !== projectId) return;

                if (action === 'deleted') {
                    setCurrentProject(null);
                    setCurrentUser(prev => prev ? {
                        ...prev,
                        projects: (prev.projects ?? []).filter(p => p.id !== projectId),
                    } : prev);
                    navigate('/', { replace: true });
                    return;
                }

                if (action === 'updated' && payload?.project) {
                    const nextProject = { ...currentProject, ...payload.project, id: projectId };
                    setCurrentProject(nextProject);
                    setCurrentUser(prev => prev ? {
                        ...prev,
                        projects: (prev.projects ?? []).map(p => p.id === projectId ? { ...p, ...payload.project, id: projectId } : p),
                    } : prev);
                }
            }
        };

        hub.on('stateChanged', handleStateChanged);

        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [projectId, currentUser?.id, currentProject, navigate, setCurrentProject, setCurrentUser]);
    // --- Конец обработки событий из вебсокета ---

    if (currentProject?.id !== projectId)
        return <h1>Loading Project Meta...</h1>

    return (
        <ProjectBoard
            name={currentProject ? currentProject.name : "unknown"}
            id={projectId} />
    );
}

export default Board;
