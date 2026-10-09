import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useProject from '../context/ProjectContext.jsx';
import useUser from '../context/UserContext.jsx';
import ProjectBoard from '../models/ProjectBoard.jsx';
import { useDBProjectMeta } from '../hooks/DataBaseHook.jsx';
import { hub } from '../api/index.js';

function Board() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [getMetas] = useDBProjectMeta();
    const [currentProject, setCurrentProject] = useProject();
    const [currentUser, setCurrentUser] = useUser();
    const [loading, setLoading] = useState(!currentProject || currentProject.id !== projectId);

    if (!projectId) return <Navigate to="/" replace />;

    useEffect(() => {
        async function restoreProject() {
            if (currentProject && currentProject.id === projectId) {
                setLoading(false);
                return;
            }

            if (!currentUser?.id) return;

            try {
                const projects = await getMetas(currentUser.id);
                const found = projects.find(p => p.id === projectId);
                if (found) {
                    setCurrentProject(found);
                } else {
                    navigate('/', { replace: true });
                }
            } catch (err) {
                console.error("Ошибка при восстановлении проекта:", err);
                navigate('/', { replace: true });
            } finally {
                setLoading(false);
            }
        }

        restoreProject();
    }, [projectId, currentUser?.id]);

    useEffect(() => {
        if (!projectId || !currentUser?.id) return;

        let hasAlerted = false;
        const handleStateChanged = (message) => {
            if (!message || message.type !== 'stateChanged') return;

            const { entityType, action, payload } = message;

            if (entityType === 'projectMember') {
                const memberId = payload?.memberId ?? payload?.userId;
                if (payload?.projectId === projectId && action === 'deleted' && memberId === currentUser.id) {
                    if (hasAlerted) return;
                    hasAlerted = true;

                    alert("Вы были исключены из этого проекта.");
                    setCurrentProject(null);
                    navigate('/', { replace: true });
                }
            }

            if (entityType === 'project') {
                const eventProjectId = payload?.projectId ?? payload?.project?.id ?? payload?.id;
                if (eventProjectId !== projectId) return;

                if (action === 'deleted') {
                    if (hasAlerted) return;
                    hasAlerted = true;
                    alert("Этот проект был удален владельцем.");
                    setCurrentProject(null);
                    navigate('/', { replace: true });
                    return;
                }

                if (action === 'updated' && payload?.project) {
                    setCurrentProject(prev => prev ? { ...prev, ...payload.project } : payload.project);
                    setCurrentUser(prev => prev ? {
                        ...prev,
                        projects: (prev.projects ?? []).map(p => p.id === projectId ? { ...p, ...payload.project } : p),
                    } : prev);
                }
            }
        };

        hub.on('stateChanged', handleStateChanged);
        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [projectId, currentUser?.id, navigate, setCurrentProject, setCurrentUser]);

    if (loading || !currentProject) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
                <h4>Загрузка данных проекта...</h4>
            </div>
        );
    }

    return <ProjectBoard name={currentProject.name} id={projectId} />;
}

export default Board;