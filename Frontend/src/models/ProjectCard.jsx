import { Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDBProjectMeta } from '../DataBaseHook';

function ProjectCard({ project, onChoose, onDelete, onUpdate, disabled }) {

    const [getMetas, post, patch, remove] = useDBProjectMeta();

    const [editMode, setEditMode] = useState(false);

    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    
    useEffect(() => {
        setName(project.name);
        setDescription(project.description);
    }, [project]);
    
    async function onToggleEdit() {
        if (editMode) {
            const newProject = { ...project, name: name, description: description };
            await onUpdate(newProject);
            setEditMode(false);
            return;
        }

        setEditMode(true)
    }

    const avatarLetter = (name || "A").charAt(0).toUpperCase();

    return (
        <Card
            className="border-0 shadow-sm w-100 rounded-4 overflow-hidden position-relative"
            style={{ backgroundColor: '#FFFFFF', maxWidth: '280px', height: '100%' }}
        >
            <button
                onClick={onDelete}
                className="btn-close position-absolute top-0 end-0 m-3"
                style={{ fontSize: '0.65rem', zIndex: 10 }}
                aria-label="Delete project"
            ></button>

            <div className="d-flex align-items-center p-3 pb-2">
                <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold me-2 flex-shrink-0"
                    style={{ backgroundColor: '#EBE4FA', color: '#5E17EB', width: '32px', height: '32px', fontSize: project.icon ? '1rem' : '0.8rem' }}
                >
                    {project.icon || avatarLetter}
                </div>
                <div className="lh-sm overflow-hidden">
                    {editMode ?
                        <form>
                            <label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-control form-control-sm" />
                            </label>
                        </form>
                        :
                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{name}</div>
                    }
                    <div className="text-muted text-truncate" style={{ fontSize: '0.65rem' }}>{project.subhead || ""}</div>
                </div>
            </div>

            <div
                className="d-flex align-items-center justify-content-center border-0 mx-0"
                style={{ backgroundColor: '#EBEBEB', height: '140px' }}
            >
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-25">
                    <path d="M50 15L75 55H25L50 15Z" fill="#707070" />
                    <rect x="52" y="48" width="24" height="24" rx="4" fill="#707070" />
                    <path d="M36 68C36 74.6274 30.6274 80 24 80C17.3726 80 12 74.6274 12 68C12 61.3726 17.3726 56 24 56C30.6274 56 36 61.3726 36 68Z" fill="#707070" />
                </svg>
            </div>

            <Card.Body className="p-3 d-flex flex-column">
                <Card.Title className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                    {project.title || ""}
                </Card.Title>

                <Card.Subtitle className="text-muted mb-2 fw-medium text-truncate" style={{ fontSize: '0.7rem' }}>
                    {project.subtitle || ""}
                </Card.Subtitle>

                {editMode ?
                    <form>
                        <label>
                            <input type="text" value={description || ""} onChange={e => setDescription(e.target.value)} className="form-control form-control-sm" />
                        </label>
                    </form>
                    :
                    <Card.Text className="text-muted mb-3 text-wrap text-start" style={{ fontSize: '0.75rem', lineHeight: '1.3', height: '50px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {description || ""}
                    </Card.Text>
                }

                <div className="d-flex justify-content-end gap-2 mt-auto pt-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="rounded-pill px-3 border text-muted fw-medium"
                        style={{ fontSize: '0.7rem', borderColor: '#D3D3D3' }}
                        onClick={onToggleEdit}
                    >
                        {editMode ? "Сохранить" : "Изменить"}
                    </Button>

                    <Button
                        variant="dark"
                        size="sm"
                        className="rounded-pill px-3 border-0 text-white fw-medium"
                        style={{ backgroundColor: '#5E17EB', fontSize: '0.7rem' }}
                        onClick={onChoose}
                    >
                        Перейти
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

export default ProjectCard;