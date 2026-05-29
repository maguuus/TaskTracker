import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProjectCard from '../models/ProjectCard.jsx';
import { useProject } from '../context/ProjectContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useProjectsMeta } from '../context/ProjectMetaHook.jsx';
import { useDBProjectMeta } from '../DataBaseHook.jsx';

const newProject = (ownerId) => ({
    ownerId: ownerId,
    name: "New project",
    description: 'Empty project',
    header: 'Header',
    subhead: 'Subhead',
    subtitle: 'Subtitle'
});

function Home() {
    const [getMetas, post, patch, remove] = useDBProjectMeta();
    const navigate = useNavigate();

    const [, setCurrentProject] = useProject();
    const [currentUser, setCurrentUser] = useUser();
    const [createProjectMeta, updateProjectMeta, removeProjectMeta] = useProjectsMeta();

    function onProjectCardClicked(project) {
        setCurrentProject(project);
        navigate(`/${project.id}/board/`);
    }

    useEffect(() => {
        async function fetchProjects() {
            if (!currentUser?.id) return;

            try {
                const response = await getMetas(currentUser.id);
                if (response.length === 0) return;

                setCurrentUser(prevUser => ({
                    ...prevUser,
                    projects: response
                }));
            } catch (error) {
                console.error(error);
            }
        }

        fetchProjects();
    }, [currentUser?.id]);

    if (!currentUser) {
        return (
            <Container fluid className="d-flex align-items-center justify-content-center" style={{ backgroundColor: '#CBB4F5', minHeight: '100vh' }}>
                <div className="text-center text-white">
                    <h2>Проекты</h2>
                    <p>Войдите в аккаунт, чтобы увидеть проекты.</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5" style={{ backgroundColor: '#CBB4F5', minHeight: '100vh', width: '100vw' }}>
            {/* Заголовок с кнопкой добавления проектов */}
            <div className="d-flex justify-content-center align-items-center position-relative mb-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 className="display-4 fw-medium m-0" style={{ color: '#5E17EB' }}>Projects</h1>
                
                <Button
                    variant="dark"
                    className="position-absolute end-0 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ backgroundColor: '#5E17EB', borderColor: '#5E17EB', width: '45px', height: '45px', fontSize: '1.5rem', paddingBottom: '5px' }}
                    onClick={async () => { 
                        let p = await post(newProject(currentUser.id)); 
                        createProjectMeta(p); 
                    }}
                >
                    +
                </Button>
            </div>

            {/* Сетка карточек проектов */}
            <Row className="justify-content-center px-4 gx-4 gy-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {currentUser.projects && currentUser.projects.length !== 0 ? (
                    currentUser.projects.map((project) => (
                        <Col key={project.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                            <ProjectCard
                                project={project}
                                onChoose={() => onProjectCardClicked(project)}
                                onDelete={async () => { 
                                    await remove(project); 
                                    removeProjectMeta(project); 
                                }}
                                onUpdate={async (updatedProject) => { 
                                    await patch(updatedProject); 
                                    updateProjectMeta(updatedProject); 
                                }}
                            />
                        </Col>
                    ))
                ) : (
                    <div className="text-center text-white opacity-75 fs-5 mt-4">Создайте новый проект!</div>
                )}
            </Row>
        </Container>
    );
}

export default Home;
