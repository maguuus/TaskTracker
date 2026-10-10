import { useState, useRef } from 'react';
import { Badge, Card, Dropdown, Form } from 'react-bootstrap';
import useColumns from '../context/BoardContext';
import { useColumn } from '../hooks/BoardHooks';
import { useDBTask } from '../hooks/DataBaseHook';
import { useTheme } from '../context/ThemeContext';
import Task from './Task';

/**
 * @param {Object} props
 * @param {Column} props.column
*/

function Column({ column, onColumnUpdate, onColumnDelete }) {

    const [post, patch, remove] = useDBTask();

    const [addTask, updateTask, removeTask] = useColumn(column.id);

    const [title, setTitle] = useState(column.title);
    const inputRef = useRef(null);
    const { theme } = useTheme();

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
        // Задержка на один тик, чтобы стейт успел сброситься до blur
        setTitle(column.title);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.blur(); // Убираем курсор
            }
        }, 0);
    }

    async function handleSave() {
        if (title.trim() && title.trim() !== column.title) {
            if (inputRef.current) {
                inputRef.current.blur();
            }
            await onColumnUpdate({ ...column, title: title.trim() });
        }
        else reset();
    }

    async function handleKeyDown(e) {
        if (e.key === "Escape")
            reset();
    }

    function handleDeleteClick() {
        if (window.confirm("Вы уверены, что хотите удалить эту колонку?")) {
            onColumnDelete();
        }
    };

    function newTask(column) {
        const id = column.tasks.length != 0 ? Math.max(...column.tasks.map(t => t.orderIndex)) + 1 : 0;
        const newTask = {
            columnId: column.id,
            orderIndex: id,
            title: `Task head ${id + 1}`,
            description: `Task body ${id + 1}`
        }
        return newTask;
    }

    const [, setColumns] = useColumns();

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = async (e) => {
        e.preventDefault();

        if (window.__draggedTaskInstance && window.__draggedTaskInstance.columnId !== column.id) {
            const taskToMove = window.__draggedTaskInstance;
            const updatedTask = {
                ...taskToMove,
                columnId: column.id
            };
            try {
                const savedTask = await patch(updatedTask);
                const finalTask = savedTask || updatedTask;
                window.__draggedTaskInstance = finalTask;
                setColumns(prevColumns => {
                    return prevColumns.map(col => {
                        if (col.id === taskToMove.columnId) {
                            return {
                                ...col,
                                tasks: col.tasks.filter(t => t.id !== taskToMove.id)
                            };
                        }
                        if (col.id === column.id) {
                            return {
                                ...col,
                                tasks: [...col.tasks, finalTask]
                            };
                        }
                        return col;
                    });
                });
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

    return (
        <ColumnCard
            theme={theme}
            inputRef={inputRef}
            getColumnBg={getColumnBg}
            column={column}
            handleSave={handleSave}
            handleDeleteClick={handleDeleteClick}
            title={title}
            setTitle={setTitle}
            handleKeyDown={handleKeyDown}
            post={post} newTask={newTask}
            addTask={addTask}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            patch={patch}
            updateTask={updateTask}
            remove={remove}
            removeTask={removeTask}
        />

    )
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
    addTask,
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
        borderBottom: 'none',
        boxShadow: 'none',
        outline: 'none',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '150px',
    };

    const getGlowClass = (title) => {
        const t = title.toLowerCase();

        if (t.includes('do') || t.includes('дел')) return 'glow-blue';
        if (t.includes('progress') || t.includes('ход')) return 'glow-green';
        if (t.includes('review') || t.includes('пров')) return 'glow-yellow';

        return 'glow-red';
    };

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
                    <Dropdown.Item onClick={async () => { let t = await post(newTask(column)); addTask(t); }}>
                        Добавить задачу
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDeleteClick} className="text-danger">
                        Удалить
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            <h3 className="column-title mb-0 d-flex align-items-center justify-content-center fw-normal">

                <Form
                    className="d-inline-block w-auto"
                    onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                >
                    <Form.Control
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave} // Сохраняем при клике мимо
                        onKeyDown={handleKeyDown}
                        required
                        size="sm"
                        className="fs-4 fw-normal text-center border-0 border-bottom rounded-0 p-0 shadow-none"
                        style={inlineInputStyle}
                    />
                </Form>

                <Badge 
                    bg={theme === 'colorful' ? 'secondary' : undefined}
                    className={`column-count ms-2 fs-6 rounded-circle ${theme !== 'colorful' ? 'themed-count' : ''}`}
                >
                    {column.tasks.length}
                </Badge>
            </h3>
        </Card.Header>

        <Card.Body
            className="column-body"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {column.tasks.map((task) => (
                <div key={task.id} onDragStart={() => { window.__draggedTaskInstance = task; }}>
                    <Task
                        key={task.id}
                        task={task}
                        onTaskUpdate={async (/** @type {Task} */ t) => {
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
                            if (window.confirm("Вы уверены, что хотите удалить эту задачу?")) {
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
