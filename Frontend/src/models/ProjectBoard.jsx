import { Container, Row, Col, Button } from 'react-bootstrap';
import Column from './Column';
import useColumns from '../context/BoardContext';
import { useBoard } from '../hooks/BoardHooks';
import { useEffect, useState } from 'react';
import { useDBColumn } from '../hooks/DataBaseHook';
import ProjectContributors from '../components/ProjectContributorsPanel';
import useProject from "../context/ProjectContext.jsx";
import { hub } from '../api/index.js';

function ProjectBoard({ name, id }) {
    const [getColumns, getTasks, post, patch, remove] = useDBColumn();
    const [columns, setColumns] = useColumns();
    const [addColumn, updateColumn, removeColumn] = useBoard();
    const [currentProject] = useProject();
    const [showSettings, setShowSettings] = useState(false);

    const isViewer = currentProject?.role === "Viewer";

    useEffect(() => {
        let cancelled = false;

        async function fetchColumns() {
            setColumns([]);
            const fetched = await getColumns(id);

            const promises = fetched.map(async (col) => {
                const tasks = await getTasks(col.id);
                return { ...col, tasks: tasks || [] };
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

    useEffect(() => {
        if (!id) return;
        let isMounted = true;

        const joinRoom = async () => {
            if (hub.state === "Connected" && isMounted) {
                try {
                    await hub.invoke("JoinProject", id);
                } catch (e) {
                    console.error("Не удалось войти в комнату проекта:", e);
                }
            }
        };

        joinRoom();

        const onReconnected = () => {
            if (isMounted) joinRoom();
        };
        hub.onreconnected(onReconnected);

        return () => {
            isMounted = false;
            if (hub.state === "Connected") {
                hub.invoke("LeaveProject", id).catch(() => {});
            }
        };
    }, [id]);

    useEffect(() => {
        const handleStateChanged = (message) => {
            if (!message || message.type !== 'stateChanged' || message.projectId !== id) return;

            const { entityType, action, payload } = message;

            if (entityType === 'column') {
                const colPayload = payload?.column ?? payload;
                const colId = payload?.columnId ?? colPayload?.id;

                if (action === 'created' && colPayload) {
                    setColumns(prev => {
                        if (prev.some(col => col.id === colPayload.id)) return prev;
                        const nextCols = [...prev, { ...colPayload, tasks: colPayload.tasks || [] }];
                        return nextCols.sort((a, b) => a.orderIndex - b.orderIndex);
                    });
                    return;
                } else if (action === 'deleted' && colId) {
                    removeColumn({ id: colId });
                    return;
                } else if (action === 'updated' && colId) {
                    setColumns(prev => prev.map(col => {
                        if (col.id === colId) {
                            return {
                                ...col,
                                ...colPayload,
                                title: colPayload?.title ?? col.title,
                                orderIndex: colPayload?.orderIndex ?? col.orderIndex,
                                tasks: col.tasks || []
                            };
                        }
                        return col;
                    }));
                    return;
                }
            }

        };

        hub.on('stateChanged', handleStateChanged);
        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [id, addColumn, removeColumn, updateColumn, setColumns]);
    
    const newColumn = () => ({
        orderIndex: (columns[columns.length - 1]?.orderIndex ?? -1) + 1,
        title: `Новая колонка`,
        projectId: id
    });

    if (!columns) return <h1>Загрузка колонок для {name}...</h1>;

    return (
        <Container fluid className="pt-2 px-4 position-relative" style={{ backgroundColor: '#bee0c6', minHeight: '100vh' }}>
            <div className="text-center mb-3">
                <h1 className="fw-bold m-0 position-absolute start-50 translate-middle-x" style={{ color: '#212121', fontSize: '2.2rem', whiteSpace: 'nowrap' }}>
                    Проект: <span style={{ textDecoration: 'underline', textUnderlineOffset: '6px' }}>{name}</span>
                </h1>

                <div className="d-flex align-items-center" style={{ marginRight: '60px', paddingTop: '5px' }}>
                    {!isViewer && (
                        <Button
                            variant="dark"
                            className="rounded-pill px-4 shadow-sm"
                            style={{ backgroundColor: '#212121' }}
                            onClick={async () => {
                                await post(newColumn());
                            }}
                        >
                            + Добавить колонку
                        </Button>
                    )}
                </div>
            </div>

            <Button
                variant="dark"
                className="position-absolute d-flex align-items-center justify-content-center shadow-sm"
                style={{
                    top: '0.5rem',
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

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem', marginTop: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }} className="justify-content-start align-items-stretch">
                    {columns.map((column) => (
                        <Col key={column.id} style={{ minWidth: '410px', width: '410px', flexGrow: 0 }} className="me-2 h-100">
                            <Column
                                column={column}
                                projectId={id}
                                onColumnUpdate={async (c) => { await patch(c); }}
                                onColumnDelete={async () => { await remove(column); }}
                            />
                        </Col>
                    ))}
                </Row>
            </div>

            <ProjectContributors showSettings={showSettings} setShowSettings={setShowSettings} />
        </Container>
    );
}

export default ProjectBoard;