import {useEffect, useState} from 'react';
import { Badge, Dropdown, Form } from 'react-bootstrap';
import { useColumn } from '../hooks/BoardHooks';
import { useDBTask } from '../hooks/DataBaseHook';
import useColumns from '../context/BoardContext';
import Task from './Task';

const TASK_CARD_WIDTH = 260;
const TASK_LANE_HEIGHT = 175;
const DAY_WIDTH = 72;
const DAY_MS = 24 * 60 * 60 * 1000;

function getTaskPosition(task, timeline) {
    if (!task) return 0;
    const date = new Date(task.dueDate);
    if (Number.isNaN(date.getTime())) return 0;
    const taskKey = date.toISOString().slice(0, 10);
    let dayIndex = timeline.days.findIndex(d => d.key === taskKey);
    if (dayIndex === -1) {
        dayIndex = Math.floor((date.getTime() - timeline.start) / DAY_MS);
    }
    const rightEdge = (dayIndex + 1) * DAY_WIDTH;
    const left = rightEdge - TASK_CARD_WIDTH;

    return Math.max(0, Math.min(left, timeline.width - TASK_CARD_WIDTH));
}

function RoadmapRow({ column, timeline, onColumnUpdate, onColumnDelete }) {
    const [post, patch, remove] = useDBTask();
    const [addTask, updateTask, removeTask] = useColumn(column.id);
    const [, setColumns] = useColumns();
    const [title, setTitle] = useState(column.title);
    const tasks = column.tasks || [];

    useEffect(() => {
        setTitle(column.title);
    }, [column.title]);
    
    const undatedTasks = tasks
        .filter(task => !task.dueDate || Number.isNaN(new Date(task.dueDate).getTime()))
        .sort((first, second) => (first.orderIndex ?? 0) - (second.orderIndex ?? 0));
    const datedTasks = tasks
        .filter(task => task.dueDate && !Number.isNaN(new Date(task.dueDate).getTime()))
        .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate)
            || (first.orderIndex ?? 0) - (second.orderIndex ?? 0));
    
    const laneEnds = [];
    const positionedTasks = datedTasks.map(task => {
        const left = getTaskPosition(task, timeline);
        let lane = laneEnds.findIndex(end => left >= end);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = left + TASK_CARD_WIDTH + 14;
        return { task, left, lane };
    });

    const timelineHeight = Math.max(180, (laneEnds.length || 1) * TASK_LANE_HEIGHT + 25);
    
    function applyTaskUpdate(finalTask, sourceColumnId, targetColumnId) {
        setColumns(prev => prev.map(col => {
            if (col.id === sourceColumnId && sourceColumnId !== targetColumnId) {
                return {
                    ...col,
                    tasks: col.tasks.filter(t => t.id !== finalTask.id)
                };
            }
            if (col.id === targetColumnId) {
                const cleanTasks = col.tasks.filter(t => t.id !== finalTask.id);
                return {
                    ...col,
                    tasks: [...cleanTasks, finalTask]
                };
            }
            return col;
        }));
    }
    
    async function handleSaveTitle() {
        const trimmedTitle = title.trim();
        if (trimmedTitle && trimmedTitle !== column.title) {
            await onColumnUpdate({ ...column, title: trimmedTitle });
        } else {
            setTitle(column.title);
        }
    }

    async function handleAddTask() {
        const orderIndex = tasks.length ? Math.max(...tasks.map(task => task.orderIndex ?? 0)) + 1 : 0;
        const createdTask = await post({
            columnId: column.id,
            orderIndex,
            title: `Новая задача ${orderIndex + 1}`,
            description: 'Описание задачи'
        });
        if (createdTask) addTask(createdTask);
    }

    async function handleTaskUpdate(task) {
        try {
            const savedTask = await patch(task);
            updateTask(savedTask || task);
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Задача была изменена другим участником прямо сейчас. Доска будет обновлена.');
                window.location.reload();
            } else {
                alert(error.response?.data || 'Ошибка при сохранении задачи');
            }
        }
    }

    async function handleTaskDelete(task) {
        if (!window.confirm('Удалить задачу?')) return;
        await remove(task);
        setColumns(prev => prev.map(col => col.id === column.id ? {
            ...col,
            tasks: col.tasks.filter(t => t.id !== task.id)
        } : col));
    }

    /**
     * @deprecated This function is deprecated. Use `handleTimelineDrop` or 'handleUndatedDrop' instead.
     */
    async function handleDrop(event) {
        event.preventDefault();
        const draggedTask = window.__draggedTaskInstance;
        if (!draggedTask || draggedTask.columnId === column.id) return;

        window.__draggedTaskInstance = null;
        const updatedTask = { ...draggedTask, columnId: column.id };
        try {
            const savedTask = await patch(updatedTask);
            addTask(savedTask || updatedTask);
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Задача была изменена другим участником. Доска будет обновлена.');
                window.location.reload();
            } else {
                alert(error.response?.data || 'Не удалось переместить задачу');
            }
        }
    }

    async function handleUndatedDrop(event) {
        event.preventDefault();
        const draggedTask = window.__draggedTaskInstance;
        if (!draggedTask) return;

        window.__draggedTaskInstance = null;
        const sourceColumnId = draggedTask.columnId;
        const targetColumnId = column.id;

        if (sourceColumnId === targetColumnId && !draggedTask.dueDate) return;

        const updatedTask = {
            ...draggedTask,
            columnId: targetColumnId,
            dueDate: null
        };

        try {
            const savedTask = await patch(updatedTask);
            applyTaskUpdate(savedTask || updatedTask, sourceColumnId, targetColumnId);
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Задача была изменена другим участником. Доска будет обновлена.');
                window.location.reload();
            } else {
                alert(error.response?.data || 'Не удалось убрать срок у задачи');
            }
        }
    }

    async function handleTimelineDrop(event) {
        event.preventDefault();
        const draggedTask = window.__draggedTaskInstance;
        if (!draggedTask) return;

        const grabOffset = window.__dragOffsetX ?? (TASK_CARD_WIDTH / 2);
        window.__draggedTaskInstance = null;
        window.__dragOffsetX = null;
        
        const sourceColumnId = draggedTask.columnId;
        const targetColumnId = column.id;

        const rect = event.currentTarget.getBoundingClientRect();
        const cardLeft = (event.clientX - rect.left) - grabOffset;
        const cardRight = cardLeft + TASK_CARD_WIDTH;

        const dayIndex = Math.floor(cardRight / DAY_WIDTH);
        const clampedIndex = Math.max(0, Math.min(timeline.days.length - 1, dayIndex));
        const targetDay = timeline.days[clampedIndex];
        if (!targetDay) return;

        const newDate = new Date(`${targetDay.key}T12:00:00.000Z`);

        const updatedTask = {
            ...draggedTask,
            columnId: targetColumnId,
            dueDate: newDate.toISOString()
        };

        try {
            const savedTask = await patch(updatedTask);
            applyTaskUpdate(savedTask || updatedTask, sourceColumnId, targetColumnId);
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Задача была изменена другим участником. Доска будет обновлена.');
                window.location.reload();
            } else {
                alert(error.response?.data || 'Не удалось изменить срок задачи');
            }
        }
    }

    function renderTask(task, compact = false) {
        return (
            <div key={task.id} onDragStart={() => { window.__draggedTaskInstance = task; }}>
                <Task
                    task={task}
                    projectId={column.projectId}
                    compact={compact}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={() => handleTaskDelete(task)}
                />
            </div>
        );
    }

    return (
        <>
            <div className="roadmap-label roadmap-row-label">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <Badge bg="secondary">Задач: {tasks.length}</Badge>
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="text-secondary p-0 border-0 shadow-none no-caret">
                            ⋮
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleAddTask}>Добавить задачу</Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                                if (window.confirm('Удалить колонку?')) onColumnDelete();
                            }} className="text-danger">
                                Удалить группу
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <Form onSubmit={event => { event.preventDefault(); handleSaveTitle(); }}>
                    <Form.Control
                        type="text"
                        maxLength={30}
                        value={title}
                        onChange={event => setTitle(event.target.value)}
                        onBlur={handleSaveTitle}
                        aria-label="Название группы"
                    />
                </Form>
            </div>

            <div
                className="roadmap-cell roadmap-undated"
                onDragOver={event => event.preventDefault()}
                onDrop={handleUndatedDrop}
            >
                <div className="roadmap-undated-scroll">
                    <div className="roadmap-undated-tasks">
                        {undatedTasks.map(t => renderTask(t, false))}
                    </div>
                </div>
            </div>

            <div
                className="roadmap-cell roadmap-timeline"
                style={{ width: timeline.width, minHeight: timelineHeight, height: timelineHeight }}
                onDragOver={event => event.preventDefault()}
                onDrop={handleTimelineDrop}
            >
                {positionedTasks.map(({ task, left, lane }) => (
                    <div
                        className="roadmap-timeline-task"
                        key={task.id}
                        style={{ left, top: lane * TASK_LANE_HEIGHT + 8, width: TASK_CARD_WIDTH }}
                        onDragStart={() => { window.__draggedTaskInstance = task; }}
                    >
                        {renderTask(task, true)}
                    </div>
                ))}
            </div>
        </>
    );
}

export default RoadmapRow;
