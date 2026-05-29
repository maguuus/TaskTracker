import { Card, Button } from 'react-bootstrap';
import { useState } from 'react';

function Task({ task, onTaskUpdate, onTaskDelete }) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [editMode, setEditMode] = useState(false);

    function toggleEditMode() {
        if (editMode === false) {
            setEditMode(true);
            return;
        }
        setEditMode(false);
        onTaskUpdate({ ...task, title: title, description: description });
    }

    return (
        <Card className="position-relative border-0 shadow-sm mb-3 bg-white" style={{ borderRadius: '12px' }}>
            {/* Крестик удаления */}
            <button 
                type="button" 
                className="btn-close position-absolute" 
                style={{ top: '12px', right: '12px', fontSize: '0.8rem' }}
                onClick={onTaskDelete}
                aria-label="Close"
            ></button>

            <Card.Body className="p-3">
                {/* Заголовок */}
                <h5 className="fw-bold mb-1 pe-4 text-start">
                    {editMode ? (
                        <input type="text" className="form-control form-control-sm" value={title} onChange={e => setTitle(e.target.value)} />
                    ) : (
                        title
                    )}
                </h5>
                {/* Описание */}
                <p className="text-muted small mb-3 text-start">
                    {editMode ? (
                        <textarea className="form-control form-control-sm" value={description} onChange={e => setDescription(e.target.value)} />
                    ) : (
                        description
                    )}
                </p>
                </div>
            </Card.Body>
        </Card>
    );
}

export default Task;
