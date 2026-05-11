import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useProject } from '../context/ProjectContext.jsx';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../models/ProjectCard.jsx';

const projectData1 = {
    id: 0,
    name: "Project 1",
    icon: '📁',
    header: 'Head1',
    subhead: 'Субголова',
    imageAlt: 'Портрет  проекта',
    title: 'Титул',
    subtitle: 'Субтитул',
    bodyText: 'Лорем ипсум долор сит амет, консектетур адиписцинг элит, сед ду элисмод темпор.',
};

const projectData2 = {
    id: 1,
    name: "Project 2",
    icon: '📁',
    header: 'Head2',
    subhead: 'Субголова',
    imageAlt: 'Портрет  проекта',
    title: 'Титул',
    subtitle: 'Субтитул',
    bodyText: 'Лорем ипсум долор сит амет, консектетур адиписцинг элит, сед ду элисмод темпор.',
};

const projectData3 = {
    id: 2,
    name: "Project 3",
    icon: '📁',
    header: 'Head3',
    subhead: 'Субголова',
    imageAlt: 'Портрет  проекта',
    title: 'Титул',
    subtitle: 'Субтитул',
    bodyText: 'Лорем ипсум долор сит амет, консектетур адиписцинг элит, сед ду элисмод темпор.',
};

function Home() {

    const { setCurrentProject } = useProject();
    const navigate = useNavigate();

    function onProjectCardClicked(project) {
        setCurrentProject(project);
        navigate(`/${project.id}/board/`);
    }

    const projects = [projectData1, projectData2, projectData3];
    return (
        <Container className="mt-4">
            <h2 className="mb-4">Проекты</h2>
            <Row>
                {projects.map((project) =>
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => onProjectCardClicked(project)}
                    />)}
            </Row>
        </Container>
    );
}



export default Home;