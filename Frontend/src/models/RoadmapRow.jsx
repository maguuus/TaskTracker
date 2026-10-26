import { useState } from 'react';
import { Badge, Dropdown, Form } from 'react-bootstrap';
import { useColumn } from '../hooks/BoardHooks';
import { useDBTask } from '../hooks/DataBaseHook';
import Task from './Task';

const TASK_CARD_WIDTH = 260;
const TASK_LANE_HEIGHT = 155;

function getTaskPosition(task, timeline) {
    const date = new Date(task.dueDate);
    const ratio = Math.max(0, Math.min(1, (date.getTime() - timeline.start) / (timeline.end - timeline.start)));
    return Math.min(ratio * timeline.width, Math.max(0, timeline.width - TASK_CARD_WIDTH));
}

function RoadmapRow({ column, timeline, onColumnUpdate, onColumnDelete }) {
    const [post, patch, remove] = useDBTask();
    const [addTask, updateTask, removeTask] = useColumn(column.id);
    const [title, setTitle] = useState(column.title);
    const tasks = column.tasks || [];
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
        laneEnds[lane] = left + TASK_CARD_WIDTH + 12;
        return { task, left, lane };
    });
    const timelineHeight = Math.max(180, laneEnds.length * TASK_LANE_HEIGHT + 35);

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
        removeTask(task);
    }

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

    function renderTask(task) {
        return (
            <div key={task.id} onDragStart={() => { window.__draggedTaskInstance = task; }}>
                <Task
                    task={task}
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
                onDrop={handleDrop}
            >
                <div className="roadmap-undated-scroll">
                    <div className="roadmap-undated-tasks">
                        {undatedTasks.map(renderTask)}
                    </div>
                </div>
            </div>

            <div
                className="roadmap-cell roadmap-timeline"
                style={{ width: timeline.width, minHeight: timelineHeight }}
                onDragOver={event => event.preventDefault()}
                onDrop={handleDrop}
            >
                {positionedTasks.map(({ task, left, lane }) => (
                    <div
                        className="roadmap-timeline-task"
                        key={task.id}
                        style={{ left, top: lane * TASK_LANE_HEIGHT, width: TASK_CARD_WIDTH }}
                        onDragStart={() => { window.__draggedTaskInstance = task; }}
                    >
                        <Task
                            task={task}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskDelete={() => handleTaskDelete(task)}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}

export default RoadmapRow;
