import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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
});

function Home() {

    const [getMetas, post, patch, remove] = useDBProjectMeta();

    const navigate = useNavigate();

    const [currentProject, setCurrentProject] = useProject();
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
                if (response.length == 0) return;

                setCurrentUser(prevUser => ({
                    ...prevUser,
                    projects: response
                }));
            }
            catch (error) {
                throw error;
            }
        }

        fetchProjects();
    }, [currentUser?.id]);

    function onProjectCardClicked(project) {
        setCurrentProject(project);
        navigate(`/${project.id}/board/`);
    }

    if (!currentUser)
        return (
            <Container>
                <h2>Проекты</h2>
                <p>Войдите в аккаунт, чтобы увидеть проекты.</p>
            </Container>
        )

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between">
                <h2 className="mb-4">Проекты</h2>
                <Button
                    variant='secondary'
                    className="border-2 mb-4"
                    onClick={async () => { let p = await post(newProject(currentUser.id)); createProjectMeta(p); }}
                >
                    +
                </Button>
            </div>
            <Row>
                {currentUser.projects.length != 0
                    ? currentUser.projects.map((project) =>
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onChoose={() => onProjectCardClicked(project)}
                            onDelete={async () => { await remove(project); removeProjectMeta(project); }}
                            onUpdate={async (p) => { await patch(p); updateProjectMeta(p); }}
                        />)
                    : `Создайте новый проект!`
                }
            </Row>
        </Container>
    );
}

export default Home;