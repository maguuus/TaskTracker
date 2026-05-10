import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Navigate, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext.jsx';

import Task from '../models/Task.jsx';

export function Board() {

    const { projectName } = useParams();
    const { currentProject } = useProject();

    if (!currentProject && !projectName)
        return <Navigate to="/" replace />;
    if (!projectName)
        return <Navigate to={`/${currentProject.header}/board/`} replace />;


    let id = 0;
    function makeTask() { // testing only
        id++;

        return {
            id: id,
            title: `Текст оглавление ${id}`,
            description: `Тело текста ${id}`
        };
    }

    // Данные колонок и карточек (testing only)
    const columns = [
        {
            id: 1,
            title: "To Do",
            tasks: [
                makeTask(),
                makeTask(),
            ]
        },
        {
            id: 2,
            title: "In Progress",
            tasks: Array(5).fill().map((_) => makeTask())
        },
        {
            id: 3,
            title: "On Review",
            tasks: [
                makeTask(),
            ]
        }
    ];

    return <RenderProject project={{ name: projectName, columns: columns }} />;
}

/* 
const project: Project = {
    id: 1,
    name: "" ///
    owner: {user}
    createdAt: {time}
    columns: List<Column>: [] ///
    }

const column: Column = {
    id: 1,
    title: "", ///
    tasks: List<Task>: [] ///
    }

const task: Task = {
    id: = 1,
    title: "", ///
    description: "", ///
    }
*/

function RenderProject({ project }) {
    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4">Проект <mark>{project.name}</mark>:</h2>

            {/* + Горизонтальный скролл */}
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }}>
                    {project.columns.map(RenderColumn)}
                </Row>
            </div>
        </Container >
    );
}

function RenderColumn(column) {
    return (
        <Col
            key={column.id}
            style={{ minWidth: '350px', width: '350px' }}
            className="me-3"
        >
            {/* Колонка*/}
            <Card style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        {column.title}
                        <Badge bg="secondary" className="ms-2">
                            {column.tasks.length}
                        </Badge>
                    </h5>
                </Card.Header>

                {/* область с карточками (тело)*/}
                <Card.Body style={{ overflowY: 'auto', padding: '0.75rem' }}>
                    {column.tasks.map((task) =>
                        <Task key={task.id} {...task}/>
                    )}
                </Card.Body>
            </Card>
        </Col>

    )
}