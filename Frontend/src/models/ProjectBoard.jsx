import { Container, Row, Col, Button } from 'react-bootstrap';
import Column from './Column';
import { useColumns } from '../context/BoardContext';
import { useBoard } from '../context/BoardHooks';
import { useEffect } from 'react';
import { useDBColumn } from '../hooks/DataBaseHook';
import { useState } from 'react';
import ProjectContributors from '../components/ProjectContributorsPanel';
import {useProject} from "../context/ProjectContext.jsx";


function ProjectBoard({ name, id, ...rest }) {

    const [getColumns, getTasks, post, patch, remove] = useDBColumn();

    const [columns, setColumns] = useColumns();
    const [addColumn, updateColumn, removeColumn] = useBoard();

    const [currentProject] = useProject();
    const isViewer = currentProject?.role === "Viewer";
    
    const newColumn = () => ({
        orderIndex: (columns[columns.length - 1]?.orderIndex ?? -1) + 1,
        title: `New Column`,
        projectId: id
    });

    useEffect(() => {
        let cancelled = false;

        async function fetchColumns() {
            setColumns([]);
            const fetched = await getColumns(id);

            const promises = fetched.map(async (column) => {
                const tasks = await getTasks(column.id);
                return { ...column, tasks: tasks };
            });

            const columnsWithTasks = await Promise.all(promises);
            if (!cancelled) {
                columnsWithTasks.sort((a, b) => a.orderIndex - b.orderIndex);
                setColumns(columnsWithTasks);
            }
        }

        fetchColumns();

        return () => { cancelled = true; };
    }, [id]);

    if (!columns)
        return <h1>Loading Columns for {name}...</h1>


    const [showSettings, setShowSettings] = useState(false);

    return (
        <Container fluid className="pt-4 px-4 position-relative" style={{ backgroundColor: '#bee0c6', minHeight: '100vh' }}>
            <div className="text-center mb-3">
                <h1 className="fw-bold mb-3" style={{ color: '#212121' }}>Проект <mark>{name}</mark></h1>

                {!isViewer && (
                    <Button
                        variant="dark"
                        className="rounded-pill px-4 shadow-sm"
                        style={{ backgroundColor: '#212121' }}
                        onClick={async () => { let c = await post(newColumn()); addColumn({ ...c, tasks: [] }); }}
                    >
                        + Добавить колонку
                    </Button>
                )}
            </div>

            <Button
                variant="dark"
                className="position-absolute d-flex align-items-center justify-content-center shadow-sm"
                style={{
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#212121',
                    borderRadius: '0.5rem',
                    zIndex: 10,
                }}
                onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
                aria-label="Настройки"
            >
                ⚙️
            </Button>

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }} className="justify-content-start align-items-stretch">
                    {columns.map((column) =>
                        <Col key={column.id} style={{ minWidth: '410px', width: '410px', flexGrow: 0 }} className="me-2 h-100">
                            <Column
                                column={column}
                                onColumnUpdate={async (c) => { await patch(c); updateColumn(c); }}
                                onColumnDelete={async () => { await remove(column); removeColumn(column); }}
                            />
                        </Col>
                    )}
                </Row>
            </div>

            <ProjectContributors showSettings={showSettings} setShowSettings={setShowSettings} />
        </Container>
    );
}



export default ProjectBoard