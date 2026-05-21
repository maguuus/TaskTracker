import { Container, Row, Col, Button } from 'react-bootstrap';
import Column from './Column';
import { useColumns } from '../context/BoardContext';
import { useBoard } from '../context/BoardHooks';
import { useEffect } from 'react';
import { useDBColumn } from '../DataBaseHook';

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

function ProjectBoard({ header, id, ...rest }) {

    const [getColumns, getTasks, post, patch, remove] = useDBColumn();

    const [columns, setColumns] = useColumns();
    const [addColumn, updateColumn, removeColumn] = useBoard();

    const newColumn = (columns) => ({
        id: (columns[columns.length - 1]?.id ?? -1) + 1,
        title: `On Review ${columns.length}`,
        tasks: [
            makeTask(),
        ]
    });

    useEffect(() => {
        async function fetchColumns() {
            setColumns(await getColumns(id));

            const promises = columns.forEach(async (column) => {
                const tasks = await getTasks(column.id);
                updateColumn({ ...column, tasks });
            });

            await promises;
        }

        fetchColumns();
    }, []);

    if (!columns)
        return <h1>Loading Columns for {header}...</h1>

    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4">Проект <mark>{header}</mark>:</h2>

            <Button
                variant='secondary'
                className="border-2 mb-4"
                onClick={async () => { let c = newColumn(columns); c = await post(c); addColumn(c); }}
            >
                +
            </Button>

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }}>
                    {columns.map((column) =>
                        <Col key={column.id} style={{ minWidth: '350px', width: '350px' }} className="me-3">
                            <Column column={column} onColumnUpdate={async (c) => { await pathc(c); updateColumn(c); }} onColumnDelete={async () => { await remove(column); removeColumn(column); }} />
                        </Col>)}
                </Row>
            </div>
        </Container >
    );
}

export default ProjectBoard