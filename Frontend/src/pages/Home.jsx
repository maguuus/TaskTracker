import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useProject } from '../context/ProjectContext.jsx';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../models/ProjectCard.jsx';
import { useUser } from '../context/UserContext.jsx';



function onProjectCreate()
{

}


function Home() {

    const [currentProject, setCurrentProject] = useProject();
    const navigate = useNavigate();

    const [currentUser] = useUser();

    function onProjectCardClicked(project) {
        setCurrentProject(project);
        navigate(`/${project.id}/board/`);
    }

    function UserDefined() {
    return (
        <Row>
            {currentUser.projects
                ? currentUser.projects.map((project) =>
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => onProjectCardClicked(project)}
                    />)
                : `Создайте новый проект!`}
        </Row>
    )
}

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between">
                <h2 className="mb-4">Проекты</h2>
                <Button
                    variant='secondary'
                    className="border-2 mb-4"
                   
                >
                    +
                </Button>
            </div>
            {currentUser ? <UserDefined /> : `Войдите в аккаунт, чтобы увидеть проекты.`}
        </Container>
    );
}

export default Home;