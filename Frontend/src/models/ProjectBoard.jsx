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
            try {
                if (hub.state === "Connecting") {
                    while (hub.state === "Connecting" && isMounted) {
                        await new Promise(r => setTimeout(r, 100));
                    }
                } else if (hub.state === "Disconnected") {
                    await hub.start();
                }
                if (hub.state === "Connected" && isMounted) {
                    await hub.invoke("JoinProject", id);
                }
            } catch (e) {
                console.error("Не удалось войти в комнату проекта:", e);
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
        <Container fluid className="project-board pt-2 px-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom border-light-subtle position-relative">
                <div className="d-flex align-items-center gap-3 flex-wrap min-w-0">
                    <h1
                        className="project-heading  project-heading-centered  fw-bold m-0 text-truncate"
                        style={{ fontSize: '1.9rem', maxWidth: '1000px' }}
                        title={name}
                    >
                        Проект: <span style={{ textDecoration: 'underline', textUnderlineOffset: '6px' }}>{name}</span>
                    </h1>

                    {!isViewer && (
                        <Button
                            variant="dark"
                            className="project-button rounded-pill px-3 shadow-sm flex-shrink-0"
                            onClick={async () => {
                                await post(newColumn());
                            }}
                        >
                            + {boardMode === BOARD_MODES.KANBAN ? 'Добавить колонку' : 'Добавить группу'}
                        </Button>
                    )}
                </div>
                
                <div
                    className="d-flex align-items-center gap-2 flex-wrap flex-shrink-0 ms-auto"
                    // style={{
                    //     top: '0.5rem',
                    //     right: '1.5rem',
                    //     zIndex: 10,
                    // }}
                >
                    <Button
                        variant="dark"
                        className="d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                            height: '42px',
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
                            height: '42px',
                            paddingLeft: '1rem',
                            paddingRight: '1rem',
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
                            width: '42px',
                            height: '42px',
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

                        const roadmapContainer = document.querySelector('.roadmap-scroll');
                        const isRoadmap = roadmapContainer && roadmapContainer.contains(el);

                        if (isRoadmap) {
                            const elRect = el.getBoundingClientRect();
                            const contRect = roadmapContainer.getBoundingClientRect();
                            const stickyOffset = 696;
                            const visibleWidth = contRect.width - stickyOffset;

                            const targetLeft = (elRect.left - contRect.left + roadmapContainer.scrollLeft) - stickyOffset - (visibleWidth / 2) + (elRect.width / 2);
                            const targetTop = (elRect.top - contRect.top + roadmapContainer.scrollTop) - (contRect.height / 2) + (elRect.height / 2);

                            roadmapContainer.scrollTo({
                                left: Math.max(0, targetLeft),
                                top: Math.max(0, targetTop),
                                behavior: 'smooth'
                            });
                        } else {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                        }

                        const currentTheme = document.documentElement.dataset.theme || 'colorful';
                        const themeColorMap = {
                            neon: { hex: '#D9FF52', rgb: '217, 255, 82' },
                            colorful: { hex: '#5E17EB', rgb: '94, 23, 235' },
                            beige: { hex: '#9C7954', rgb: '156, 121, 84' },
                            mono: { hex: '#333333', rgb: '51, 51, 51' }
                        };
                        const themeColor = themeColorMap[currentTheme] || themeColorMap.colorful;

                        el.style.zIndex = '30';
                        el.style.position = 'relative';
                        el.style.outline = `3px solid ${themeColor.hex}`;
                        el.style.outlineOffset = '-1px';
                        el.style.borderRadius = '12px';

                        const keyframes = isRoadmap ? [
                            { boxShadow: `0 0 0 0 rgba(${themeColor.rgb}, 0)` },
                            { boxShadow: `0 0 16px 3px rgba(${themeColor.rgb}, 0.6)` },
                            { boxShadow: `0 0 0 0 rgba(${themeColor.rgb}, 0)` },
                            { boxShadow: `0 0 12px 2px rgba(${themeColor.rgb}, 0.5)` },
                            { boxShadow: `0 0 0 0 rgba(${themeColor.rgb}, 0)` }
                        ] : [
                            { transform: 'scale(1)', boxShadow: `0 0 0 0 rgba(${themeColor.rgb}, 0)` },
                            { transform: 'scale(1.02)', boxShadow: `0 0 14px 2px rgba(${themeColor.rgb}, 0.5)` },
                            { transform: 'scale(1)', boxShadow: `0 0 0 0 rgba(${themeColor.rgb}, 0)` },
                            { transform: 'scale(1.015)', boxShadow: `0 0 10px 1px rgba(${themeColor.rgb}, 0.4)` },
                            { transform: 'scale(1)', boxShadow: `0 0 0 0 rgba(${themeColor.rgb}, 0)` }
                        ];

                        const animation = el.animate(keyframes, {
                            duration: 2500,
                            easing: 'ease-in-out'
                        });

                        animation.onfinish = () => {
                            el.style.outline = '';
                            el.style.outlineOffset = '';
                            el.style.zIndex = '';
                            el.style.position = '';
                        };
                    }, 150);
                }}
            />
        </Container>
    );
}

export default ProjectBoard;