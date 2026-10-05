import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProjectCard from '../models/ProjectCard.jsx';
import useProject from '../context/ProjectContext.jsx';
import useUser from '../context/UserContext.jsx';
import { useMYProjectsMeta } from '../context/ProjectMetaHook.jsx';
import { hub } from '../api/index.js';

const newProject = (ownerId) => ({
    ownerId: ownerId,
    name: "New project",
    description: 'Empty project',
});

function Home() {
    const navigate = useNavigate();

    const [currentProject, setCurrentProject] = useProject();
    const [currentUser, setCurrentUser] = useUser();
    const [createProjectMeta, updateProjectMeta, removeProjectMeta, loadProjectMeta] = useMYProjectsMeta();

    useEffect(() => {
        async function fetchProjects() {
            if (!currentUser?.id) return;

            try {
                await loadProjectMeta(); // Загружает в пользователя сам
            }
            catch (error) {
                throw error;
            }
        }

        fetchProjects();
    }, [currentUser?.id]);

    useEffect(() => {
        if (!currentUser?.id) return;

        const handleStateChanged = async (message) => {
            if (!message || message.type !== 'stateChanged') return;

            const { entityType, action, payload } = message;
            if (!['project', 'projectMember'].includes(entityType)) return;

            if (entityType === 'project') {
                if (action === 'created' && payload?.project) {
                    setCurrentUser(prev => ({
                        ...prev,
                        projects: [...(prev?.projects ?? []), payload.project],
                    }));
                    return;
                }

                if (action === 'deleted' && payload?.projectId) {
                    setCurrentUser(prev => ({
                        ...prev,
                        projects: (prev?.projects ?? []).filter(project => project.id !== payload.projectId),
                    }));
                    return;
                }

                if (action === 'updated' && payload?.projectId) {
                    setCurrentUser(prev => ({ // Вернуть хук для взаимодействия в useMyProjectsMeta
                        ...prev,
                        projects: (prev?.projects ?? []).map(project =>
                            project.id === payload.projectId
                                ? { ...project, ...payload.project }
                                : project
                        ),
                    }));
                    return;
                }
            }

            if (entityType === 'projectMember') {
                const memberId = payload?.memberId ?? payload?.member?.userId ?? payload?.member?.id;
                const projectId = payload?.projectId;

                if ((action === 'created' || action === 'updated') && memberId === currentUser.id) {
                    await loadProjectMeta(); // Скачивать один конкретный проект по id
                    return;
                }

                if ((action === 'deleted' && memberId === currentUser.id) || (action === 'deleted' && projectId && !(currentUser.projects ?? []).some(project => project.id === projectId))) {
                    await loadProjectMeta(); // Скачивать один конкретный проект по id
                    return;
                }
            }
        };

        hub.on('stateChanged', handleStateChanged);

        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [currentUser?.id, currentUser?.projects, loadProjectMeta, setCurrentUser]);

    function onProjectCardClicked(project) {
        setCurrentProject(project);
        navigate(`/${project.id}/board/`);
    }

    if (!currentUser)
        return (
            <Container fluid className="d-flex align-items-center justify-content-center" style={{ backgroundColor: '#CBB4F5', minHeight: '100vh' }}>
                <div className="text-center text-white">
                    <h2>Проекты</h2>
                    <p>Войдите в аккаунт, чтобы увидеть проекты.</p>
                </div>
            </Container>
        )

    return (
        <Container fluid className="py-5" style={{ backgroundColor: '#CBB4F5', minHeight: '100vh', width: '100vw' }}>
            <div className="d-flex justify-content-center align-items-center position-relative mb-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 className="display-4 fw-medium m-0" style={{ color: '#5E17EB' }}>Проекты</h1>

                <Button
                    variant="dark"
                    className="position-absolute end-0 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ backgroundColor: '#5E17EB', borderColor: '#5E17EB', width: '45px', height: '45px', fontSize: '1.5rem', paddingBottom: '5px' }}
                    onClick={async () => { await createProjectMeta(newProject(currentUser.id)); }}
                >
                    +
                </Button>
            </div>

            <Row className="justify-content-center px-4 gx-4 gy-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {currentUser.projects.length !== 0
                    ? currentUser.projects.map((project) =>
                        <Col key={project.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                            <ProjectCard
                                project={project}
                                onChoose={() => onProjectCardClicked(project)}
                                onDelete={async () => { await removeProjectMeta(project); }}
                                onUpdate={async (p) => { await updateProjectMeta(p); }}
                            />
                        </Col>)
                    : <div className="text-center text-white opacity-75 fs-5 mt-4">Создайте новый проект!</div>
                }
            </Row>
        </Container>
    );
}

export default Home;
