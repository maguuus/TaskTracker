import {useState, useRef, useEffect} from 'react';
import { Badge, Button, Card, Dropdown, Form } from 'react-bootstrap';
import { useColumn } from '../hooks/BoardHooks';
import useColumns from '../context/BoardContext';
import { useDBTask } from '../hooks/DataBaseHook';
import { useTheme } from '../context/ThemeContext';
import Task from './Task';
import task from "./Task";

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
    const { theme } = useTheme();

    useEffect(() => {
        setTitle(column.title);
    }, [column.title]);

    const getColumnBg = (title, theme = 'colorful') => {
        const t = title.toLowerCase();

        if (theme === 'beige') {
            if (t.includes('do') || t.includes('дел')) return '#E8D3A8';
            if (t.includes('progress') || t.includes('ход')) return '#E8C2B8';
            return '#D8CBE2';
        }

        if (t.includes('do') || t.includes('дел')) return '#FFDE6A';
        if (t.includes('progress') || t.includes('ход')) return '#FFA6B4';
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

        const taskToMove = window.__draggedTaskInstance;
        window.__draggedTaskInstance = null;
        
        if (taskToMove && taskToMove.columnId !== column.id) {
            const updatedTask = {
                ...taskToMove,
                columnId: column.id
            };
            window.__draggedTaskInstance = null;
            const sourceColumnId = taskToMove.columnId;
            const targetColumnId = column.id;
            
            try {
                const saved = await patch(updatedTask);
                const finalTask = saved || updatedTask;

                setColumns(prev => prev.map(col => {
                    if (col.id === sourceColumnId) {
                        return {
                            ...col,
                            tasks: col.tasks.filter(t => t.id !== finalTask.id)
                        };
                    }
                    if (col.id === targetColumnId) {
                        const cleanTasks = col.tasks.filter(t => t.id !== finalTask.id);
                        return {
                            ...col,
                            tasks: [...cleanTasks, finalTask].sort((a, b) => a.orderIndex - b.orderIndex)
                        };
                    }
                    return col;
                }));
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
            description: `Описание задачи`,
            tags: []
        };
    }

    return (
        <ColumnCard
            theme={theme}
            inputRef={inputRef}
            getColumnBg={getColumnBg}
            column={column}
            handleSave={handleSave}
            handleDeleteClick={() => { if (window.confirm("Удалить колонку?")) onColumnDelete(); }}
            title={title}
            setTitle={setTitle}
            handleKeyDown={(e) => { if (e.key === "Escape") reset(); }}
            post={post}
            newTask={newTask}
            handleDragOver={(e) => e.preventDefault()}
            handleDrop={handleDrop}
            patch={patch}
            updateTask={updateTask}
            remove={remove}
            removeTask={removeTask}
        />
    );
}

export default Column;

function ColumnCard({
    theme,
    getColumnBg,
    column,
    handleSave,
    handleDeleteClick,
    inputRef,
    title,
    setTitle,
    handleKeyDown,
    post,
    newTask,
    handleDragOver,
    handleDrop,
    patch,
    updateTask,
    remove,
    removeTask
}) {
    const inlineInputStyle = {
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        textAlign: 'center',
        cursor: 'pointer',
        minWidth: '180px',
        maxWidth: '240px',
        width: `${Math.max(title.length + 1, 12)}ch`,
        textOverflow: 'ellipsis',
    };

    const getGlowClass = (titleStr) => {
        const t = (titleStr || '').toLowerCase();
        if (t.includes('do') || t.includes('дел')) return 'glow-blue';
        if (t.includes('progress') || t.includes('ход')) return 'glow-green';
        if (t.includes('review') || t.includes('пров')) return 'glow-yellow';
        return 'glow-red';
    };

    const tasksList = column.tasks || [];

    return (
        <Card
            className={`board-column ${theme === 'neon' ? getGlowClass(column.title) : ''}`}
            style={
                ['colorful', 'beige'].includes(theme)
                    ? { backgroundColor: getColumnBg(column.title, theme) }
                    : undefined
            }
        >
            <Card.Header className="bg-transparent border-0 text-center py-2 position-relative">
                <Dropdown className="position-absolute" style={{ top: '0.5rem', right: '0.5rem' }} align="end">
                    <Dropdown.Toggle
                        variant="link"
                        className="text-secondary p-0 border-0 shadow-none no-caret"
                        style={{ fontSize: '1.2rem', textDecoration: 'none' }}
                    >
                        ⋮
                    </Dropdown.Toggle>

                    <Dropdown.Menu variant="dark">
                        <Dropdown.Item onClick={handleDeleteClick} className="text-danger">
                            Удалить
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <h3 className="column-title mb-0 d-flex align-items-center justify-content-center fw-normal">
                    <Button
                        type="button"
                        variant="light"
                        className="add-task-circle column-add-task"
                        aria-label={`Добавить задачу в колонку ${title}`}
                        title="Добавить задачу"
                        onClick={async () => { await post(newTask(column)); }}
                    >
                        +
                    </Button>
                    <Form className="d-inline-block w-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <Form.Control
                            ref={inputRef}
                            type="text"
                            maxLength={30}
                            title={title}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            size="sm"
                            className="fs-4 fw-normal text-center border-0 border-bottom rounded-0 p-0 shadow-none"
                            style={inlineInputStyle}
                        />
                    </Form>

                    <Badge
                        bg={theme === 'colorful' ? 'secondary' : undefined}
                        className={`column-count ms-2 fs-6 rounded-circle ${theme !== 'colorful' ? 'themed-count' : ''}`}
                    >
                        {tasksList.length}
                    </Badge>
                </h3>
            </Card.Header>

            <Card.Body
                className="column-body"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {tasksList.map((task) => (
                    <div key={task.id} className="mb-3" onDragStart={() => { window.__draggedTaskInstance = task; }}>
                        <Task
                            key={task.id}
                            task={task}
                            projectId={column.projectId}
                            compact={false}
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