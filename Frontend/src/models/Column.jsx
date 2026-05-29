import { Card, Badge, Button } from 'react-bootstrap';
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

    function newTask(column) {
        const id = column.tasks.length !== 0 ? Math.max(...column.tasks.map(t => t.orderIndex)) + 1 : 0;
        return {
            columnId: column.id,
            orderIndex: id,
            title: `Text Heading`,
            description: `Body text`
        };
    }

    return (
        <Card style={{ 
            backgroundColor: getColumnBg(column.title), 
            height: 'calc(100vh - 150px)', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: '50px',
            border: 'none',
            padding: '20px 10px',
            boxShadow: 'none'
        }}>
            {/* Шапка колонки */}
            <Card.Header className="bg-transparent border-0 text-center py-2">
                <h3 className="mb-0 d-flex align-items-center justify-content-center w-100 fw-normal" style={{ color: '#2e7d32' }}>
                    {editMode ? (
                        <input type="text" size="8" value={title} onChange={e => setTitle(e.target.value)} />
                    ) : (
                        column.title
                    )}

                    <Badge bg="secondary" className="ms-2 fs-6 rounded-circle">
                        {column.tasks.length}
                    </Badge>
                </h3>
                
                {/* Панель управления колонкой (кнопки скрыты аккуратно под заголовком) */}
                <div className="d-flex justify-content-center gap-1 mt-2">
                    <Button variant='primary' size="sm" onClick={async () => { let t = await post(newTask(column)); addTask(t); }}>+</Button>
                    <Button variant='outline-secondary' size="sm" onClick={toggleEditMode}>Edit</Button>
                    <Button variant='dark' size="sm" onClick={onColumnDelete}>-</Button>
                </div>
            </Card.Header>

            {/* Тело со списком тасок */}
            <Card.Body style={{ overflowY: 'auto', padding: '10px' }}>
                {column.tasks.map((task) => (
                    <Task
                        key={task.id}
                        task={task}
                        onTaskUpdate={async (t) => { await patch(t); updateTask(t); }}
                        onTaskDelete={async () => { await remove(task); removeTask(task); }}
                    />
                ))}
            </Card.Body>
        </Card>
    );
}

export default Column;
