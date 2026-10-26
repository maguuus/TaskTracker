import { useMemo, useState } from 'react';
import { Badge, Dropdown, Form } from 'react-bootstrap';
import { useColumn } from '../hooks/BoardHooks';
import { useDBTask } from '../hooks/DataBaseHook';
import Task from './Task';

const LABEL_WIDTH = 230;
const UNDATED_WIDTH = 220;

function getDayKey(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function shiftDays(dayKey, amount) {
    const date = new Date(`${dayKey}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
}

function getWeekKey(dayKey) {
    const weekday = new Date(`${dayKey}T00:00:00Z`).getUTCDay();
    return shiftDays(dayKey, -(weekday === 0 ? 6 : weekday - 1));
}

function getMonthKey(dayKey) {
    return dayKey.slice(0, 7);
}

function shiftMonths(monthKey, amount) {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1 + amount, 1)).toISOString().slice(0, 7);
}

function getBuckets(columns) {
    const taskDays = columns.flatMap(column => (column.tasks || [])
        .map(task => getDayKey(task.dueDate))
        .filter(Boolean))
        .sort();
    const today = new Date().toISOString().slice(0, 10);
    const firstDay = taskDays[0] || today;
    const lastDay = taskDays[taskDays.length - 1] || today;
    const daySpan = (Date.parse(`${lastDay}T00:00:00Z`) - Date.parse(`${firstDay}T00:00:00Z`)) / 86400000;

    if (daySpan <= 120) {
        const start = shiftDays(firstDay, -7);
        const end = shiftDays(lastDay, 7);
        const buckets = [];
        for (let day = start; day <= end; day = shiftDays(day, 1)) buckets.push(day);
        return { type: 'day', buckets, width: 150 };
    }

    if (daySpan <= 730) {
        const firstWeek = shiftDays(getWeekKey(firstDay), -28);
        const lastWeek = shiftDays(getWeekKey(lastDay), 28);
        const buckets = [];
        for (let week = firstWeek; week <= lastWeek; week = shiftDays(week, 7)) buckets.push(week);
        return { type: 'week', buckets, width: 190 };
    }

    const firstMonth = shiftMonths(getMonthKey(firstDay), -1);
    const lastMonth = shiftMonths(getMonthKey(lastDay), 1);
    const buckets = [];
    for (let month = firstMonth; month <= lastMonth; month = shiftMonths(month, 1)) buckets.push(month);
    return { type: 'month', buckets, width: 180 };
}

function getBucketKey(dayKey, type) {
    if (type === 'week') return getWeekKey(dayKey);
    if (type === 'month') return getMonthKey(dayKey);
    return dayKey;
}

function getBucketLabel(bucket, type) {
    if (type === 'month') {
        return new Date(`${bucket}-01T00:00:00Z`).toLocaleDateString('ru-RU', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
    }

    const date = new Date(`${bucket}T00:00:00Z`);
    if (type === 'week') {
        const weekEnd = new Date(`${shiftDays(bucket, 6)}T00:00:00Z`);
        const startLabel = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
        const endLabel = weekEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
        return `${startLabel} – ${endLabel}`;
    }

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function Roadmap({ columns, onColumnUpdate, onColumnDelete }) {
    const { type, buckets, width } = useMemo(() => getBuckets(columns), [columns]);
    const gridColumns = `${LABEL_WIDTH}px ${UNDATED_WIDTH}px repeat(${buckets.length}, ${width}px)`;
    const bucketIndex = new Map(buckets.map((bucket, index) => [bucket, index]));

    return (
        <div className="roadmap-scroll">
            <div className="roadmap-grid" style={{ gridTemplateColumns: gridColumns }}>
                <div className="roadmap-header roadmap-label roadmap-corner">Группа</div>
                <div className="roadmap-header roadmap-date roadmap-undated-header">Без даты</div>
                {buckets.map(bucket => (
                    <div className="roadmap-header roadmap-date" key={bucket}>
                        {getBucketLabel(bucket, type)}
                    </div>
                ))}

                {columns.map(column => (
                    <RoadmapRow
                        key={`${column.id}-${column.title}`}
                        column={column}
                        type={type}
                        buckets={buckets}
                        bucketIndex={bucketIndex}
                        onColumnUpdate={onColumnUpdate}
                        onColumnDelete={() => onColumnDelete(column)}
                    />
                ))}
            </div>
        </div>
    );
}

function RoadmapRow({ column, type, buckets, bucketIndex, onColumnUpdate, onColumnDelete }) {
    const [post, patch, remove] = useDBTask();
    const [addTask, updateTask, removeTask] = useColumn(column.id);
    const [title, setTitle] = useState(column.title);
    const tasks = column.tasks || [];
    const undatedTasks = tasks
        .filter(task => !getDayKey(task.dueDate))
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const tasksByBucket = new Map();

    for (const task of tasks) {
        const dayKey = getDayKey(task.dueDate);
        if (!dayKey) continue;
        const key = getBucketKey(dayKey, type);
        const index = bucketIndex.get(key);
        if (index === undefined) continue;
        const bucketTasks = tasksByBucket.get(index) || [];
        bucketTasks.push(task);
        tasksByBucket.set(index, bucketTasks);
    }

    for (const bucketTasks of tasksByBucket.values()) {
        bucketTasks.sort((a, b) => {
            const dateComparison = getDayKey(a.dueDate).localeCompare(getDayKey(b.dueDate));
            return dateComparison || (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        });
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

    return (
        <>
            <div className="roadmap-label roadmap-row-label">
                <div className="d-flex align-items-center justify-content-between mt-2">
                    <Badge bg="secondary">Задач: {tasks.length} </Badge>
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
                {undatedTasks.map(task => (
                    <div key={task.id} onDragStart={() => { window.__draggedTaskInstance = task; }}>
                        <Task
                            task={task}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskDelete={() => handleTaskDelete(task)}
                        />
                    </div>
                ))}
                {!undatedTasks.length && <span className="roadmap-empty">—</span>}
            </div>

            {buckets.map((bucket, index) => {
                const bucketTasks = tasksByBucket.get(index) || [];
                return (
                    <div
                        className="roadmap-cell"
                        key={bucket}
                        onDragOver={event => event.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {bucketTasks.map(task => (
                            <div key={task.id} onDragStart={() => { window.__draggedTaskInstance = task; }}>
                                <Task
                                    task={task}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskDelete={() => handleTaskDelete(task)}
                                />
                            </div>
                        ))}
                        {!bucketTasks.length && <span className="roadmap-empty">—</span>}
                    </div>
                );
            })}
        </>
    );
}

export default Roadmap;
