import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { hub } from '../api/index.js';
import Kanban from '../components/Kanban';
import ProjectContributors from '../components/ProjectContributorsPanel';
import Roadmap from '../components/Roadmap';
import TaskSearchDrawer from '../components/TaskSearchDrawer';
import useColumns from '../context/BoardContext';
import useProject from "../context/ProjectContext.jsx";
import { useBoard } from '../hooks/BoardHooks';
import { useDBColumn } from '../hooks/DataBaseHook';

const BOARD_MODES = Object.freeze({
    KANBAN: 'Kanban',
    ROADMAP: 'Roadmap'
});

function ProjectBoard({ name, id }) {
    const [getColumns, getTasks, post, patch, remove] = useDBColumn();
    const [columns, setColumns] = useColumns();
    const [addColumn, updateColumn, removeColumn] = useBoard();
    const [currentProject] = useProject();
    const [showSettings, setShowSettings] = useState(false);
    const [boardMode, setBoardMode] = useState(BOARD_MODES.KANBAN);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const handleOpenSearchByTag = () => setShowSearch(true);
        window.addEventListener('filter-by-tag', handleOpenSearchByTag);
        return () => window.removeEventListener('filter-by-tag', handleOpenSearchByTag);
    }, []);
    const isViewer = currentProject?.role === "Viewer";
    const newColumn = () => ({
        orderIndex: (columns[columns.length - 1]?.orderIndex ?? -1) + 1,
        title: `Новая колонка`,
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
                hub.invoke("LeaveProject", id).catch(() => { });
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
                } else if (action === 'deleted' && colId) {
                    removeColumn({ id: colId });
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
                }
            } else if (entityType === 'task') {
                const task = payload?.task;
                const taskId = payload?.taskId ?? task?.id;

                if (action === 'created' && task) {
                    setColumns(prev => prev.map(col => col.id === task.columnId
                        ? {
                            ...col,
                            tasks: [...col.tasks.filter(existing => existing.id !== task.id), task]
                                .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                        }
                        : col
                    ));
                } else if (action === 'deleted' && taskId) {
                    setColumns(prev => prev.map(col => ({
                        ...col,
                        tasks: col.tasks.filter(existing => existing.id !== taskId)
                    })));
                } else if (action === 'updated' && task) {
                    setColumns(prev => prev.map(col => {
                        const tasks = col.tasks.filter(existing => existing.id !== task.id);
                        if (col.id !== task.columnId) return { ...col, tasks };
                        return {
                            ...col,
                            tasks: [...tasks, task].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                        };
                    }));
                }
            }

        };

        hub.on('stateChanged', handleStateChanged);
        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [id, addColumn, removeColumn, updateColumn, setColumns]);

    if (!columns) return <h1>Загрузка колонок для {name}...</h1>;

    return (
        <Container fluid className="project-board pt-2 px-4 position-relative">
            <div className="text-center mb-3" style={{ height: '50px' }}>
                <h1
                    className="project-heading fw-bold m-0 position-absolute start-50 translate-middle-x"
                    style={{ fontSize: '2.2rem', whiteSpace: 'nowrap' }}
                >
                    Проект: <span style={{ textDecoration: 'underline', textUnderlineOffset: '6px' }}>{name}</span>
                </h1>

                <div className="d-flex align-items-center" style={{ marginRight: '60px', paddingTop: '5px' }}>
                    {!isViewer && (
                        <Button
                            variant="dark"
                            className="project-button rounded-pill px-4 shadow-sm"
                            onClick={async () => {
                                await post(newColumn());
                            }}
                        >
                            + {boardMode === BOARD_MODES.KANBAN ? 'Добавить колонку' : 'Добавить группу'}
                        </Button>
                    )}
                </div>
            </div>
            
            <div
                className="position-absolute d-flex gap-3 align-items-center"
                style={{
                    top: '0.5rem',
                    right: '1.5rem',
                    zIndex: 10,
                }}
            >
                <Button
                    variant="dark"
                    className="d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                        height: '48px',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        backgroundColor: 'var(--project-button-bg)',
                        color: 'var(--project-button-text)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '0.5rem',
                    }}
                    onClick={() => setShowSearch(true)}
                    aria-label="Поиск и фильтрация"
                >
                    🔍 Поиск
                </Button>

                <Button
                    variant="dark"
                    className="d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                        height: '48px',
                        backgroundColor: 'var(--project-button-bg)',
                        color: 'var(--project-button-text)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '0.5rem',
                    }}
                    onClick={() => setBoardMode(currentMode => (
                        currentMode === BOARD_MODES.KANBAN ? BOARD_MODES.ROADMAP : BOARD_MODES.KANBAN
                    ))}
                    aria-label={`Переключить на ${boardMode === BOARD_MODES.KANBAN ? 'Roadmap' : 'Kanban'}`}
                >
                    {boardMode === BOARD_MODES.KANBAN ? 'Roadmap' : 'Kanban'}
                </Button>

                <Button
                    variant="dark"
                    className="d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'var(--project-button-bg)',
                        color: 'var(--project-button-text)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '0.5rem',
                    }}
                    onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
                    aria-label="Настройки"
                >
                    ⚙️
                </Button>
            </div>
            <div>
            {boardMode === BOARD_MODES.KANBAN ? (
                <Kanban
                    columns={columns}
                    onColumnUpdate={async (column) => { await patch(column); }}
                    onColumnDelete={async (column) => { await remove(column); }}
                />
            ) : (
                <Roadmap
                    columns={columns}
                    onColumnUpdate={async (column) => { await patch(column); }}
                    onColumnDelete={async (column) => { await remove(column); }}
                />
            )}
            </div>

            <ProjectContributors showSettings={showSettings} setShowSettings={setShowSettings} />

            <TaskSearchDrawer
                show={showSearch}
                onHide={() => setShowSearch(false)}
                projectId={id}
                onTaskSelect={(task) => {
                    setShowSearch(false);
                    setTimeout(() => {
                        const el = document.getElementById(`task-${task.id}`);
                        if (!el) return;

                        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                        el.animate([
                            {
                                transform: 'scale(1)',
                                boxShadow: '0 0 0 0 rgba(13, 110, 253, 0)',
                                filter: 'brightness(1)'
                            },
                            {
                                transform: 'scale(1.05)',
                                boxShadow: '0 0 0 8px rgba(13, 110, 253, 0.75), 0 16px 32px rgba(13, 110, 253, 0.3)',
                                filter: 'brightness(1.15)'
                            },
                            {
                                transform: 'scale(1.01)',
                                boxShadow: '0 0 0 4px rgba(13, 110, 253, 0.4), 0 6px 16px rgba(13, 110, 253, 0.15)',
                                filter: 'brightness(1.05)'
                            },
                            {
                                transform: 'scale(1.03)',
                                boxShadow: '0 0 0 6px rgba(13, 110, 253, 0.6), 0 12px 24px rgba(13, 110, 253, 0.25)',
                                filter: 'brightness(1.1)'
                            },
                            {
                                transform: 'scale(1)',
                                boxShadow: '0 0 0 0 rgba(13, 110, 253, 0)',
                                filter: 'brightness(1)'
                            }
                        ], {
                            duration: 1600,
                            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
                        });
                    }, 280);
                }}
            />
        </Container>
    );
}

export default ProjectBoard;