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
                style={{ top: '12px', right: '12px', fontSize: '0.8rem', zIndex: 10 }}
                onClick={onTaskDelete}
                aria-label="Close"
            ></button>

            <Card.Body 
                className="p-3"
                onDoubleClick={() => { if (!editMode) setEditMode(true); }}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setEditMode(false);
                        onTaskUpdate({ ...task, title: title, description: description });
                    }
                }}
            >
                {/* Заголовок */}
                <div className="fw-bold mb-1 pe-4 text-start" style={{ fontSize: '1rem' }}>
                    {editMode ? (
                        <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                        />
                    ) : (
                        title
                    )}
                </div>

                <div className="text-muted small mb-0 text-start">
                    {editMode ? (
                        <textarea 
                            className="form-control form-control-sm mt-2" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                        />
                    ) : (
                        description
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}

export default Task;
