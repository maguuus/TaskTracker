import { Col, Card, Badge, Button } from 'react-bootstrap';
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

    async function toggleEditMode() {
        if (editMode === false) {
            setEditMode(true);
            return;
        }
        await onColumnUpdate({ ...column, title: title });
        setEditMode(false);
    }

    function newTask(column) {
        const id = column.tasks.length != 0 ? Math.max(...column.tasks.map(t => t.id)) + 1 : 0;
        const newTask = {
            id: id,
            title: `Текст оглавление ${id}`,
            description: `Тело текста ${id}`
        }
        return newTask;
    }

    return (
        <Card style={{ backgroundColor: 'lightblue', height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <Card.Header className="bg-light">
                <h5 className="mb-0 d-flex align-items-center justify-content-between w-100">
                    {editMode
                        ? (<form>
                            <label>
                                <input type="text" size="5" value={title} onChange={e => setTitle(e.target.value)} />
                            </label>
                        </form>)
                        : column.title}

                    <Badge bg="secondary" className="ms-2">
                        {column.tasks.length}
                    </Badge>
                    <Button
                        variant='primary'
                        className="ms-auto py-0 px-2"
                        style={{ height: '24px', minWidth: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={async () => { let t = newTask(column); t = await post(t); addTask(t); }}
                    >
                        +
                    </Button>
                    <Button
                        variant='primary'
                        className="ms-auto py-0 px-2"
                        style={{ height: '24px', minWidth: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={toggleEditMode}
                    >
                        Edit
                    </Button>
                    <Button
                        variant='dark'
                        className="ms-auto py-0 px-2"
                        style={{ height: '24px', minWidth: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={onColumnDelete}
                    >
                        -
                    </Button>
                </h5>
            </Card.Header>

            <Card.Body style={{ overflowY: 'auto', padding: '0.75rem' }}>
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
    )
}

export default Column;