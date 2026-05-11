import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useProject } from '../context/ProjectContext.jsx';
import { useNavigate } from 'react-router-dom';

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

export function Home() {

    const projects = [projectData1, projectData2, projectData3];
    return (
        <Container className="mt-4">
            <h2 className="mb-4">Проекты</h2>
            <Row>
                {projects.map(PaintProject)} {/* TO REACT */}
            </Row>
        </Container>
    );
}

function PaintProject(project, idx) {

    const { setCurrentProject } = useProject();
    const navigate = useNavigate();

    return (
        <Col key={idx} md={4} className="mb-4">
            <Card style={{ height: '100%' }}>

                <Card.Header>
                    <div className="d-flex align-items-center mb-2">
                        <span style={{ fontSize: '1.8rem', marginRight: '0.8rem' }}>
                            {project.icon}
                        </span>
                        <h4 className="mb-0">{project.header}</h4>
                    </div>

                    <h6 className="text-muted mb-3">{project.subhead}</h6>

                </Card.Header>

                <Card.Img
                    variant="top"
                    src=""
                    alt={project.imageAlt}
                    style={{ marginBottom: '1rem' }}
                />

                <Card.Body>
                    <Card.Title>{project.title}</Card.Title>

                    <Card.Subtitle className="mb-2 text-muted">
                        {project.subtitle}
                    </Card.Subtitle>

                    <Card.Text>{project.bodyText}</Card.Text>

                    <div className="d-flex justify-content-between mt-3">

                    </div>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-end gap-3">
                    <Button variant="light border">Вторичная</Button>
                    <Button variant="primary"
                        onClick={() => { setCurrentProject(project); navigate(`/${project.id}/board/`); }}> {/* To Do вынести лямбду */}
                        Изначальная
                    </Button>
                </Card.Footer>

            </Card>
        </Col >
    )
}