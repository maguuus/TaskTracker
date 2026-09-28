import { Col, Card, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDBProjectMeta } from '../hooks/DataBaseHook';
import useUser from "../context/UserContext.jsx";

function ProjectCard({ project, onChoose, onDelete, onUpdate, disabled }) {
    const [currentUser] = useUser();
    const isOwner = project.role === "Owner" || project.ownerId === currentUser?.id;
    
    const [editMode, setEditMode] = useState(false);

    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);

    useEffect(() => {
        setName(project.name);
        setDescription(project.description);
    }, [project]);

    async function onToggleEdit() {
        if (!isOwner) return;

        if (editMode) {
            const updated = { ...project, name: name.trim(), description: description.trim() };
            await onUpdate(updated);
            setEditMode(false);
            return;
        }
        setEditMode(true);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            onToggleEdit();
        } else if (e.key === "Escape") {
            setName(project.name);
            setDescription(project.description);
            setEditMode(false);
        }
    }

    function handleDeleteClick() {
        if (window.confirm(`Вы уверены, что хотите удалить проект "${project.name}"?`)) {
            onDelete();
        }
    }

    const getRoleBadge = (roleName) => {
        switch (roleName) {
            case 'Owner':
                return { bg: '#E8F5E9', color: '#2E7D32', text: 'Владелец' };
            case 'Member':
                return { bg: '#E3F2FD', color: '#1565C0', text: 'Участник' };
            case 'Viewer':
            default:
                return { bg: '#F5F5F5', color: '#616161', text: 'Наблюдатель' };
        }
    };

    const role = project.role || (isOwner ? "Owner" : "Member");
    const roleBadge = getRoleBadge(role);
    const avatarLetter = (name || "A").charAt(0).toUpperCase();

    return (
        <Card
            className="border-0 shadow-sm w-100 rounded-4 overflow-hidden position-relative"
            style={{ backgroundColor: '#FFFFFF', maxWidth: '280px', height: '100%' }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
        >
            {isOwner && (
                <button
                    onClick={handleDeleteClick}
                    className="btn-close position-absolute top-0 end-0 m-3"
                    style={{ fontSize: '0.65rem', zIndex: 10 }}
                    aria-label="Удалить проект"
                    title="Удалить проект"
                ></button>
            )}

            <div className="d-flex align-items-center p-3 pb-2">
                <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold me-2 flex-shrink-0"
                    style={{ backgroundColor: '#EBE4FA', color: '#5E17EB', width: '32px', height: '32px', fontSize: project.icon ? '1rem' : '0.8rem' }}
                >
                    {avatarLetter}
                </div>
                <div className="lh-sm overflow-hidden">
                    {editMode ? (
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="form-control form-control-sm"
                            autoFocus
                        />
                    ) : (
                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{name}</div>
                    )}
                    <span
                        className="badge fw-medium px-2 py-1 mt-1"
                        style={{
                            backgroundColor: roleBadge.bg,
                            color: roleBadge.color,
                            fontSize: '0.65rem',
                            borderRadius: '6px'
                        }}
                    >
                        {roleBadge.text}
                    </span>
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

                {editMode ? (
                    <input
                        type="text"
                        value={description || ""}
                        onChange={e => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="form-control form-control-sm mt-2"
                        placeholder="Краткое описание проекта..."
                    />
                ) :
                    <Card.Text className="text-muted mb-3 text-wrap text-start" style={{ fontSize: '0.75rem', lineHeight: '1.3', height: '50px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {description || "Описание отсутствует."}
                    </Card.Text>
                }

                <div className="d-flex justify-content-end gap-2 mt-auto pt-2">
                    {isOwner && (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-pill px-3 border text-muted fw-medium"
                            style={{ fontSize: '0.7rem', borderColor: '#D3D3D3' }}
                            onClick={onToggleEdit}
                        >
                        {editMode ? "Сохранить" : "Изменить"}
                    </Button>
                    )}
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
        </Card >
    )
}

export default ProjectCard;