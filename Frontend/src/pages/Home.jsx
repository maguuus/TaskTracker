import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProjectCard from '../models/ProjectCard.jsx';
import { useProject } from '../context/ProjectContext.jsx';
import { useUser } from '../context/UserContext.jsx';

function onProjectCreate(setCurrentUser) {
    const newProject = {
        id: 0,
        name: "New project",
        icon: '📁',
        header: 'Empty project',
    };
    setCurrentUser(prev =>
        ({ ...prev, projects: [...prev.projects, newProject] })
    );
}

function onProjectDelete(project, setCurrentUser) {
    setCurrentUser(prev =>
        ({ ...prev, projects: prev.projects.filter(p => p != project) })
    );
}

function onProjectEdit(project, setCurrentUser) {
    return;
}

function Home() {

    const navigate = useNavigate();

    const [currentProject, setCurrentProject] = useProject();
    const [currentUser, setCurrentUser] = useUser();

    function onProjectCardClicked(project) {
        setCurrentProject(project);
        navigate(`/${project.id}/board/`);
    }

    async function LoadUserProjectsMeta(id) {
        try {
            const response = await api.get(`/user/${id}`);
            return response.data;
        }
        catch (error) {
            return []
        }
    }

    useEffect(() => {
        async function fetchProjects() {
            if (!currentUser?.id) return;

            const projects = await LoadUserProjectsMeta(currentUser.id);

            if (projects.length != 0)
                setCurrentUser(prevUser => ({
                    ...prevUser,
                    projects
                }));
        }
        fetchProjects();
    }, [currentUser?.id]);

    function onProjectCardClicked(project) {
        setCurrentProject(project);
        navigate(`/${project.id}/board/`);
    }

    function UserProjects() {

        return (
            <Row>
                {currentUser.projects
                    ? currentUser.projects.map((project) =>
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onChoose={() => onProjectCardClicked(project)}
                            onDelete={() => onProjectDelete(project, setCurrentUser)}
                            onEdit={() => onProjectEdit(project, setCurrentUser)}
                        />)
                    : `Создайте новый проект!`}
            </Row>
        )
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
                    onClick={() => onProjectCreate(setCurrentUser)}
                >
                    +
                </Button>
            </div>
            <UserProjects />
        </Container>
    );
}

export default Home;