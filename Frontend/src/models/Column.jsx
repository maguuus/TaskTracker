import { Col, Card, Badge, Button, Dropdown } from 'react-bootstrap';
import { useColumns } from '../context/BoardContext';
import { useColumn } from '../context/BoardHooks';
import Task from './Task';
import { useState } from 'react';
import { useDBTask } from '../DataBaseHook';


function Column({ column, onColumnUpdate, onColumnDelete }) {

    const [post, patch, remove] = useDBTask();

    const [addTask, updateTask, removeTask] = useColumn(column.id);

    const [title, setTitle] = useState(column.title);
    const [editMode, setEditMode] = useState(false);

    const getColumnBg = (title) => {
        const t = title.toLowerCase();
        if (t.includes('do') || t.includes('дел')) return '#fdeca6';
        if (t.includes('progress') || t.includes('ход')) return '#ebd0ff';
        return '#ffd2d2';
    };

    async function toggleEditMode() {
        if (editMode === false) {
            setEditMode(true);
            return;
        }
        await onColumnUpdate({ ...column, title: title });
        setEditMode(false);
    }

    function handleEnterKey(e) {
        if (e.key === "Enter")
            toggleEditMode();
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
            await patch(updatedTask);
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
                            tasks: [...col.tasks, updatedTask]
                        };
                    }
                    return col;
                });
            });
        }
    };


    return (
        <Card style={{
            backgroundColor: getColumnBg(column.title),
            height: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            border: 'none',
            padding: '20px 10px',
            boxShadow: 'none'
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
                        <Dropdown.Item onClick={toggleEditMode}>
                            {editMode ? 'Сохранить' : 'Переименовать'}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleDeleteClick} className="text-danger">
                            Удалить
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <h3 className="mb-0 d-flex align-items-center justify-content-center w-100 fw-normal" style={{ color: '#2e7d32' }}>
                    {editMode ? (
                        <input type="text" size="8" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={handleEnterKey} />
                    ) : (
                        column.title
                    )}

                    <Badge bg="secondary" className="ms-2 fs-6 rounded-circle">
                        {column.tasks.length}
                    </Badge>
                </h3>

                <div className="d-flex justify-content-center gap-1 mt-2">
                    <Button variant='primary' size="sm" onClick={async () => { let t = await post(newTask(column)); addTask(t); }}>+</Button>
                </div>
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
                            onTaskUpdate={async (t) => { await patch(t); updateTask(t); }}
                            onTaskDelete={async () => { await remove(task); removeTask(task); }}
                        />
                    </div>
                ))}
            </Card.Body>
        </Card>
    )
}

export default Column;