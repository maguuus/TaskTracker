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

    
    const [cover, setCover] = useState(project.cover || "abstract");

    const coverOptions = [
        { id: "abstract", label: "Абстракция" },
        { id: "stripes", label: "Полоски" },
        { id: "waves", label: "Волны" },
        { id: "circles", label: "Круги" },
        { id: "geometry", label: "Геометрия" },
        { id: "dots", label: "Точки" },
    ];


    useEffect(() => {
        setName(project.name);
        setDescription(project.description);
        setCover(project.cover || "abstract");
    }, [project]);

    async function onToggleEdit() {
        if (!isOwner) return;

        if (editMode) {
            const updated = {
                ...project,
                name: name.trim(),
                description: description.trim(),
                cover: cover,
            };
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
            setCover(project.cover || "abstract");
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
            className="project-card w-100 rounded-4 overflow-hidden position-relative"
            onMouseEnter={(e) => {
                e.currentTarget.classList.add('project-card-hover');
            }}
            onMouseLeave={(e) => {
                e.currentTarget.classList.remove('project-card-hover');
            }}
            style={{ maxWidth: '280px', height: '100%' }}
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
                    className="project-card-avatar d-flex align-items-center justify-content-center rounded-circle fw-bold me-2 flex-shrink-0"
                    style={{
                        width: '32px',
                        height: '32px',
                        fontSize: '0.8rem'
                    }}
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
                        <div className="project-card-name fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>
                            {name}
                        </div>
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

            <div className={`project-card-cover cover-${cover}`}>
                <div className="project-card-cover-pattern" />

                <div className="project-card-cover-shape project-card-shape-one" />
                <div className="project-card-cover-shape project-card-shape-two" />
                <div className="project-card-cover-shape project-card-shape-three" />

                <div className="project-card-cover-icon">
                    <svg
                        width="52"
                        height="52"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                </div>
            </div>

            {editMode && (
                <div className="px-3 pt-3">
                    <div className="small fw-semibold mb-2">
                        Обложка проекта
                    </div>

                    <div className="cover-picker">
                        {coverOptions.map(option => (
                            <button
                                key={option.id}
                                type="button"
                                className={`cover-option cover-${option.id} ${
                                    cover === option.id ? "selected" : ""
                                }`}
                                title={option.label}
                                aria-label={option.label}
                                aria-pressed={cover === option.id}
                                onClick={() => setCover(option.id)}
                            >
                                <span className="cover-option-pattern" />
                                {cover === option.id && <span className="cover-check">✓</span>}
                            </button>
                        ))}
                    </div>

                    <div className="small text-muted mt-1">
                        Выбрано: {coverOptions.find(option => option.id === cover)?.label}
                    </div>
                </div>
            )}

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
                        className="project-card-open rounded-pill px-3 border-0 fw-medium"
                        style={{ fontSize: '0.7rem' }}
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