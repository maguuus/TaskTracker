import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProjectCard from '../models/ProjectCard.jsx';
import useProject from '../context/ProjectContext.jsx';
import useUser from '../context/UserContext.jsx';
import { useMYProjectsMeta } from '../context/ProjectMetaHook.jsx';
import { useDBProjectMeta } from '../hooks/DataBaseHook.jsx';
import { hub } from '../api/index.js';

const newProject = (ownerId) => ({
    ownerId: ownerId,
    name: "New project",
    description: 'Empty project',
});

function Home() {
    const navigate = useNavigate();

    const [getMetas, post, patch, remove] = useDBProjectMeta();
    const [currentProject, setCurrentProject] = useProject();
    const [currentUser, setCurrentUser] = useUser();
    const [createProjectMeta, updateProjectMeta, removeProjectMeta, setProjectsMeta] = useMYProjectsMeta();

    useEffect(() => {
        async function fetchProjects() {
            if (!currentUser?.id) return;

            try {
                const response = await getMetas(currentUser.id);
                setProjectsMeta(response);
            }
            catch (error) {
                throw error;
            }
        }

        fetchProjects();
    }, [currentUser?.id]);

    // --- Обработка событий из вебсокета ---
    useEffect(() => {
        if (!currentUser?.id) return;

        const handleStateChanged = async (message) => {
            if (!message || message.type !== 'stateChanged') return;

            const { entityType, action, payload } = message;
            if (!['project', 'projectMember'].includes(entityType)) return;

            if (entityType === 'project') {
                if (action === 'created' && payload?.project) {
                    createProjectMeta(payload.project);
                    return;
                }

                if (action === 'deleted' && payload?.projectId) {
                    removeProjectMeta({ id: payload.projectId });
                    return;
                }

                if (action === 'updated' && payload?.projectId) {
                    const currentProjectRecord = (currentUser?.projects ?? []).find(project => project.id === payload.projectId);
                    updateProjectMeta({
                        ...(currentProjectRecord ?? {}),
                        ...payload.project,
                        id: payload.projectId,
                    });
                    return;
                }
            }

            if (entityType === 'projectMember') {
                const memberId = payload?.memberId ?? payload?.member?.userId ?? payload?.member?.id;
                const projectId = payload?.projectId;
                
                if ((action === 'created' || action === 'updated') && memberId === currentUser.id) {
                    const refreshedProjects = await getMetas(currentUser.id);
                    setProjectsMeta(refreshedProjects);
                    return;
                }

                if (action === 'deleted' && memberId === currentUser.id) {
                    const refreshedProjects = await getMetas(currentUser.id);
                    setProjectsMeta(refreshedProjects);
                    return;
                }

                if (action === 'deleted' && projectId && !(currentUser.projects ?? []).some(project => project.id === projectId)) {
                    const refreshedProjects = await getMetas(currentUser.id);
                    setProjectsMeta(refreshedProjects);
                    return;
                }
            }
        };

        hub.on('stateChanged', handleStateChanged);

        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [currentUser?.id, currentUser?.projects, createProjectMeta, updateProjectMeta, removeProjectMeta, getMetas, setCurrentUser]);
    // --- Конец обработки событйи из веб сокета ---


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
                    onClick={async () => {
                        const savedProject = await post(newProject(currentUser.id));
                        createProjectMeta(savedProject);
                    }}
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
                                onDelete={async () => {
                                    await remove(project);
                                    removeProjectMeta(project);
                                }}
                                onUpdate={async (p) => {
                                    await patch(p);
                                    updateProjectMeta(p);
                                }}
                            />
                        </Col>)
                    : <div className="text-center text-white opacity-75 fs-5 mt-4">Создайте новый проект!</div>
                }
            </Row>
        </Container>
    );
}

export default Home;
