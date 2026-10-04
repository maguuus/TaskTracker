import { useState } from 'react';
import { Badge, Button, Card, Dropdown } from 'react-bootstrap';
import useColumns from '../context/BoardContext';
import { useColumn } from '../hooks/BoardHooks';
import { useDBTask } from '../hooks/DataBaseHook';
import Task from './Task';

/**
 * @param {Object} props
 * @param {Column} props.column
*/

function Column({ column, onColumnUpdate, onColumnDelete }) {

    const [post, patch, remove] = useDBTask();

    const [addTask, updateTask, removeTask] = useColumn(column.id);

    const [title, setTitle] = useState(column.title);
    const [editMode, setEditMode] = useState(false);

    const getColumnBg = (title) => {
        const t = title.toLowerCase();
        if (t.includes('do') || t.includes('дел')) {
            return '#FFDE6A';
        }
        if (t.includes('progress') || t.includes('ход')) {
            return '#FFA6B4';
        }
        return '#C79EFF';
    };

    async function toggleEditMode() {
        if (editMode === false) {
            setTitle(column.title);
            setEditMode(true);
            return;
        }
        if (title.trim() && title.trim() !== column.title) {
            await onColumnUpdate({ ...column, title: title.trim() });
        } else {
            setTitle(column.title);
        }
        setEditMode(false);
    }

    async function handleKeyDown(e) {
        if (e.key === "Enter") {
            await toggleEditMode();
        }
        if (e.key === "Escape") {
            setTitle(column.title);
            setEditMode(false);
        }
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

    const [columns, setColumns] = useColumns();

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
            getColumnBg={getColumnBg}
            column={column}
            toggleEditMode={toggleEditMode}
            editMode={editMode}
            handleDeleteClick={handleDeleteClick}
            title={title} setTitle={setTitle}
            handleEnterKey={handleKeyDown}
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
    getColumnBg,
    column,
    toggleEditMode,
    editMode,
    handleDeleteClick,
    title,
    setTitle,
    handleEnterKey,
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
    return (<Card style={{
        backgroundColor: getColumnBg(column.title),
        height: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: 'none',
        padding: '20px 14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
    }}>
        <Card.Header className="bg-transparent border-0 text-center py-2">
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

            <h3 className="mb-0 d-flex align-items-center justify-content-center w-100 fw-normal" style={{ color: '#212121' }}>
                {editMode ? (
                    <input 
                        type="text" 
                        size={8} 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        onKeyDown={handleEnterKey}
                        onBlur={toggleEditMode}
                        autoFocus
                    />
                ) : (
                    <span onClick={toggleEditMode} style={{ cursor: 'pointer' }}>
                        {column.title}
                    </span>
                )}

                <Badge bg="secondary" className="ms-2 fs-6 rounded-circle">
                    {column.tasks.length}
                </Badge>
            </h3>

            
        </Card.Header>

            <Card.Body
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ overflowY: 'auto', padding: '10px' }}
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
                            onTaskDelete={async () => { await remove(task); removeTask(task); }}
                        />
                    </div>
                ))}
            </Card.Body>
        </Card>
    );
}
