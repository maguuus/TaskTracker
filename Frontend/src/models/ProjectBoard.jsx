import { Container, Row, Col, Button } from 'react-bootstrap';
import Column from './Column';
import { useBoard } from '../context/BoardContext';
import { useEffect } from 'react';

var id = 0;
function makeTask() { // testing only
    id++;

    return {
        id: id,
        title: `Текст оглавление ${id}`,
        description: `Тело текста ${id}`
    };
}

// (testing only)
const mockcolumns = [
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

function FetchColumns(projectId, setCols) {
    if (projectId == 0 || projectId == 1)
        setCols(mockcolumns);
}

function ProjectBoard({ name, id, ...rest }) {

    const [columns, setColumns] = useBoard();

    function onColumnCreate() {
        const newColumn = {
            id: (columns[columns.length - 1]?.id ?? -1) + 1,
            title: `On Review ${columns.length}`,
            tasks: [
                makeTask(),
            ]
        }
        setColumns(prev =>
            [...prev, newColumn]
        );
    }


    useEffect(() => FetchColumns(id, setColumns), []);

    if (!columns)
        return <h1>Loading Columns for {name}...</h1>

    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4">Проект <mark>{name}</mark>:</h2>

            <Button
                variant='secondary'
                className="border-2 mb-4"
                onClick={() => onColumnCreate()}
            >
                +
            </Button>

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }}>
                    {columns.map((column) =>
                        <Col key={column.id} style={{ minWidth: '350px', width: '350px' }} className="me-3">
                            <Column column={column} />
                        </Col>)}
                </Row>
            </div>
        </Container >
    );
}

export default ProjectBoard