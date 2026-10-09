import { useState, useRef, useEffect } from 'react';
import { Badge, Card, Dropdown, Form } from 'react-bootstrap';
import { useColumn } from '../hooks/BoardHooks';
import useColumns from '../context/BoardContext';
import { useDBTask } from '../hooks/DataBaseHook';
import { hub } from '../api/index.js';
import Task from './Task';

/**
 * @param {Object} props
 * @param {Column} props.column
 */

function Column({ column, projectId, onColumnUpdate, onColumnDelete }) {
    const [post, patch, remove] = useDBTask();
    const [, updateTask, removeTask] = useColumn(column.id);
    const [, setColumns] = useColumns();

    const [title, setTitle] = useState(column.title);
    const inputRef = useRef(null);

    useEffect(() => {
        setTitle(column.title);
    }, [column.title]);

    useEffect(() => {
        const handleStateChanged = (message) => {
            if (!message || message.type !== 'stateChanged' || message.projectId !== projectId) return;

            const { entityType, action, payload } = message;
            if (entityType !== 'task') return;

            const task = payload?.task;
            const taskId = payload?.taskId ?? task?.id;

            if (action === 'created' && task && column.id === task.columnId) {
                setColumns(prev => prev.map(col =>
                    col.id === column.id
                        ? { ...col, tasks: [...col.tasks.filter(t => t.id !== task.id), task] }
                        : col
                ));
            } else if (action === 'deleted' && taskId) {
                setColumns(prev => prev.map(col =>
                    col.id === column.id
                        ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                        : col
                ));
            } else if (action === 'updated' && task) {
                setColumns(prev => prev.map(col => {
                    if (col.id === column.id && col.id === task.columnId) {
                        const cleanTasks = col.tasks.filter(t => t.id !== task.id);
                        return {
                            ...col,
                            tasks: [...cleanTasks, task].sort((a, b) => a.orderIndex - b.orderIndex)
                        };
                    }
                    if (col.id === column.id) {
                        return {
                            ...col,
                            tasks: col.tasks.filter(t => t.id !== task.id)
                        };
                    }
                    return col;
                }));
            }
        };

        hub.on('stateChanged', handleStateChanged);
        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [column.id, projectId, setColumns]);

    const getColumnBg = (t) => {
        const val = (t || '').toLowerCase();
        if (val.includes('do') || val.includes('дел')) return '#FFDE6A';
        if (val.includes('progress') || val.includes('ход')) return '#FFA6B4';
        return '#C79EFF';
    };

    function reset() {
        setTitle(column.title);
        setTimeout(() => { inputRef.current?.blur(); }, 0);
    }

    async function handleSave() {
        if (title.trim() && title.trim() !== column.title) {
            inputRef.current?.blur();
            await onColumnUpdate({ ...column, title: title.trim() });
        } else {
            reset();
        }
    }

    const handleDrop = async (e) => {
        e.preventDefault();

        if (window.__draggedTaskInstance && window.__draggedTaskInstance.columnId !== column.id) {
            const taskToMove = window.__draggedTaskInstance;
            const updatedTask = {
                ...taskToMove,
                columnId: column.id
            };
            window.__draggedTaskInstance = null;

            try {
                await patch(updatedTask);
            } catch (error) {
                if (error.response?.status === 409) {
                    alert("Задача была изменена другим участником. Доска будет обновлена.");
                    window.location.reload();
                } else {
                    alert(error.response?.data || "Не удалось переместить задачу");
                }
            }
        }
    };

    function newTask(col) {
        const currentTasks = col.tasks || [];
        const order = currentTasks.length !== 0 ? Math.max(...currentTasks.map(t => t.orderIndex)) + 1 : 0;
        return {
            columnId: col.id,
            orderIndex: order,
            title: `Новая задача ${order + 1}`,
            description: `Описание задачи`
        };
    }

    const tasksList = column.tasks || [];

    return (
        <Card style={{
            backgroundColor: getColumnBg(column.title),
            height: 'calc(110vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '24px',
            border: 'none',
            padding: '13px 10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
            <Card.Header className="bg-transparent border-0 text-center py-2 position-relative">
                <Dropdown className="position-absolute" style={{ top: '0.5rem', right: '0.5rem' }} align="end">
                    <Dropdown.Toggle variant="link" className="text-secondary p-0 border-0 shadow-none no-caret" style={{ fontSize: '1.2rem' }}>
                        ⋮
                    </Dropdown.Toggle>
                    <Dropdown.Menu variant="dark">
                        <Dropdown.Item onClick={async () => {
                            await post(newTask(column));
                        }}>
                            Добавить задачу
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => { if (window.confirm("Удалить колонку?")) onColumnDelete(); }} className="text-danger">
                            Удалить
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <h3 className="mb-0 d-flex align-items-center justify-content-center w-100 fw-normal">
                    <Form className="d-inline-block w-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <Form.Control
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => { if (e.key === "Escape") reset(); }}
                            className="fs-4 fw-normal text-center border-0 border-bottom rounded-0 p-0 shadow-none bg-transparent"
                            style={{ cursor: 'pointer' }}
                        />
                    </Form>
                    <Badge bg="secondary" className="ms-2 fs-6 rounded-circle">
                        {tasksList.length}
                    </Badge>
                </h3>
            </Card.Header>

            <Card.Body
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{ overflowY: 'auto', padding: '10px' }}
            >
                {tasksList.map((task) => (
                    <div key={task.id} onDragStart={() => { window.__draggedTaskInstance = task; }}>
                        <Task
                            key={task.id}
                            task={task}
                            onTaskUpdate={async (t) => {
                                try {
                                    const saved = await patch(t);
                                    updateTask(saved || t);
                                } catch (error) {
                                    if (error.response?.status === 409) {
                                        alert("Задача была изменена другим участником прямо сейчас. Доска будет обновлена.");
                                        window.location.reload();
                                    } else {
                                        alert(error.response?.data || "Ошибка при сохранении задачи");
                                    }
                                }
                            }}
                            onTaskDelete={async () => {
                                if (window.confirm("Удалить задачу?")) {
                                    await remove(task);
                                    removeTask(task);
                                }
                            }}
                        />
                    </div>
                ))}
            </Card.Body>
        </Card>
    );
}

export default Column;