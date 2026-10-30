import { Card, Button, Modal, Form, Badge, Col, Row } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import {avatarsDictionary, defaultAvatar} from "../hooks/Avatar.jsx";
import api from "../api/index.js";

const getTagColor = (text) => {
    const colors = [
        { bg: '#FEE2E2', text: '#991B1B' }, // Красный
        { bg: '#FEF3C7', text: '#92400E' }, // Янтарный
        { bg: '#D1FAE5', text: '#065F46' }, // Зеленый
        { bg: '#DBEAFE', text: '#1E40AF' }, // Синий
        { bg: '#EDE9FE', text: '#5B21B6' }, // Фиолетовый
        { bg: '#FCE7F3', text: '#9D174D' }, // Розовый
        { bg: '#E0E7FF', text: '#3730A3' }, // Индиго
        { bg: '#CCFBF1', text: '#115E59' }, // Бирюзовый
    ];

    let hash = 0;
    const str = (text || '').toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

/**
 * @param {Object} props
 * @param {Task} props.task
 */

function Task({ task, projectId, onTaskUpdate, onTaskDelete, compact = false }) {
    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState(task.title || '');
    const [description, setDescription] = useState(task.description || '');
    const [icon, setIcon] = useState(task.icon || '');
    const [tags, setTags] = useState(task.tags || []);
    const [tagInput, setTagInput] = useState('');

    const [priority, setPriority] = useState(task.priority || '');
    const [urgency, setUrgency] = useState(task.urgency || '');
    const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
    
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };
    const [dueDate, setDueDate] = useState(formatDateForInput(task.dueDate));

    useEffect(() => {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setIcon(task.icon || '');
        setTags(task.tags || []);
        setPriority(task.priority || '');
        setUrgency(task.urgency || '');
        setDueDate(formatDateForInput(task.dueDate));
        setAssigneeId(task.assigneeId || '');
    }, [task]);

    // function handleTagKeyDown(e) {
    //     if (e.key === 'Enter') {
    //         e.preventDefault();
    //         const newTag = tagInput.trim();
    //         if (newTag && !tags.includes(newTag)) {
    //             setTags([...tags, newTag]);
    //         }
    //         setTagInput('');
    //     }
    // }

    // function removeTag(tagToRemove) {
    //     setTags(tags.filter(t => t !== tagToRemove));
    // }

    function handleSave(e) {
        e.preventDefault();
        const formattedDate = dueDate ? new Date(dueDate).toISOString() : null;

        onTaskUpdate({
            ...task,
            title: title,
            description: description,
            icon: icon,
            tags: tags,
            priority: priority,
            urgency: urgency,
            dueDate: formattedDate,
            assigneeId: assigneeId || null
        });
        setShowModal(false);
    }

    const getBorderColor = () => {
        switch (task.priority) {
            case 'Критический': return 'danger';
            case 'Высокий': return 'warning';
            case 'Средний': return 'primary';
            case 'Низкий': return 'info';
            default: return 'light';
        }
    };

    const displayDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : null;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <>
            <Card
                id={`task-${task.id}`}
                className={`task-card border border-${getBorderColor()} shadow-sm ${compact ? 'p-2 mb-0' : 'p-3 mb-3'}`}                style={{
                    borderLeftWidth: '5px',
                    borderRadius: '12px',
                    cursor: 'move',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                draggable="true"
                onDragStart={(e) => {
                    window.__draggedTaskInstance = task;
                    const cardRect = e.currentTarget.getBoundingClientRect();
                    window.__dragOffsetX = e.clientX - cardRect.left;
                    e.dataTransfer.setData("text/plain", task.id);
                    e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                    e.currentTarget.style.opacity = '1';
                    window.__draggedTaskInstance = null;
                    window.__dragOffsetX = null;
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)'; // Тень становится глубже
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'; // Возвращается на место
                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)'; // Тень становится обычной
                }}
            >
                <Card.Body className="p-0 position-relative">

                    <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center text-truncate me-2" title={task.title}>
                            {task.icon && <span className="fs-5 me-2">{task.icon}</span>}
                            <h6 className="mb-0 fw-bold m-0 text-truncate" title={task.title}>{task.title}</h6>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            <Button
                                variant="secondary d-inline-flex focus-ring focus-ring-secondary px-2 text-decoration-none border rounded-2"
                                style={{ paddingTop: '3px', paddingBottom: '3px' }}
                                size="sm"
                                onClick={() => setShowModal(true)}
                            >
                                Детали
                            </Button>
                            <button
                                className="btn-close"
                                aria-label="Close"
                                onClick={onTaskDelete}
                                style={{ width: '0.5rem', height: '0.5rem' }}
                            ></button>
                        </div>
                    </div>

                    <div
                        className="text-muted small mb-1 text-truncate"
                        style={compact ? { maxHeight: '20px', overflow: 'hidden' } : undefined}
                        title={task.description}
                    >
                        {task.description || "Нет описания"}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-2" style={{ maxWidth: '100%' }}>
                            {(compact ? task.tags.slice(0, 2) : task.tags).map((tag, idx) => {
                                const color = getTagColor(tag);
                                return (
                                    <span
                                        key={idx}
                                        title={`#${tag} (Нажмите для фильтрации)`}
                                        className="badge rounded-pill fw-medium"
                                        style={{
                                            backgroundColor: color.bg,
                                            color: color.text,
                                            fontSize: '0.68rem',
                                            padding: '4px 10px',
                                            maxWidth: compact ? '90px' : '160px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            display: 'inline-block',
                                            verticalAlign: 'middle',
                                            lineHeight: 1.2,
                                            cursor: 'pointer'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.dispatchEvent(new CustomEvent('filter-by-tag', { detail: tag }));
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                );
                            })}
                            {compact && task.tags.length > 2 && (
                                <span className="badge rounded-pill bg-light text-muted border" style={{ fontSize: '0.68rem' }} title={task.tags.slice(2).map(t => `#${t}`).join(', ')}>
                                    +{task.tags.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {(task.priority || task.dueDate) && (
                        <div className="d-flex justify-content-between text-muted small mb-1 fw-bold">
                            {task.priority && <span>⚡ {task.priority}</span>}
                            {displayDate && (
                                <span className={isOverdue ? 'text-danger' : 'text-primary'}>
                                    📅 {displayDate}
                                </span>
                            )}
                        </div>
                    )}

                    {task.assigneeName && (
                        <div className="d-flex align-items-center gap-1 mt-2 pt-1 border-top" title={`Исполнитель: ${task.assigneeName}`}>
                            <img
                                src={avatarsDictionary[String(task.assigneeAvatar)] || defaultAvatar}
                                alt={task.assigneeName}
                                className="rounded-circle flex-shrink-0"
                                style={{ width: 20, height: 20, objectFit: "cover" }}
                            />
                            <span className="small text-muted text-truncate fw-medium" style={{ fontSize: '0.75rem' }}>
                                {task.assigneeName}
                            </span>
                        </div>
                    )}                    
                    {/* <div className="d-flex justify-content-end">
                        <Button
                            variant="secondary d-inline-flex focus-ring focus-ring-secondary py-1 px-2 text-decoration-none border rounded-2"
                            size="sm"
                            onClick={() => setShowModal(true)}
                        >
                            Детали
                        </Button>
                    </div> */}
                </Card.Body>
            </Card>

            <TaskModal
                showModal={showModal}
                setShowModal={setShowModal}
                handleSave={handleSave}
                projectId={projectId}
                assigneeId={assigneeId}
                setAssigneeId={setAssigneeId}
                icon={icon}
                setIcon={setIcon}
                title={title}
                setTitle={setTitle}
                priority={priority}
                setPriority={setPriority}
                urgency={urgency}
                setUrgency={setUrgency}
                dueDate={dueDate}
                setDueDate={setDueDate}
                description={description}
                setDescription={setDescription}
                tags={tags}
                setTags={setTags}
                tagInput={tagInput}
                setTagInput={setTagInput}
            />
        </>
    );
}

export default Task;

function TaskModal({ showModal,
    setShowModal,
    handleSave,
    projectId,
    assigneeId,
    setAssigneeId,    
    icon,
    setIcon,
    title, // перенести внутрь TaskModal
    setTitle,
    priority,
    setPriority,
    urgency,
    setUrgency,
    dueDate,
    setDueDate,
    description,
    setDescription,
    tags,
    setTags,
    tagInput,
    setTagInput    
}) {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        if (!showModal || !projectId) return;

        api.get(`/api/projects/${projectId}/members`)
            .then(res => setMembers(res.data || []))
            .catch(err => console.error("Ошибка загрузки участников:", err));
    }, [showModal, projectId]);
    
    return <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Form onSubmit={handleSave}>
            <Modal.Header closeButton className="border-0 pb-0">
                <div className="d-flex w-100 gap-2 align-items-center">
                    <Form.Control
                        type="text"
                        maxLength={2}
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="🚀"
                        style={{ width: '60px', fontSize: '1.5rem', textAlign: 'center' }}
                        title="Эмодзи" />
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="fs-4 fw-bold border-0 shadow-none px-0"
                        placeholder="Название задачи"
                        title={title}
                        required />
                </div>
            </Modal.Header>

            <Modal.Body>
                <Row className="mb-4 bg-light p-3 rounded mx-0">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-bold text-muted small text-uppercase mb-1">Приоритет</Form.Label>
                            <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)} className="border-0 shadow-sm">
                                <option value="">Не задан</option>
                                <option value="Низкий">Низкий</option>
                                <option value="Средний">Средний</option>
                                <option value="Высокий">Высокий</option>
                                <option value="Критический">Критический 🚨</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-bold text-muted small text-uppercase mb-1">Срочность</Form.Label>
                            <Form.Select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="border-0 shadow-sm">
                                <option value="">Не задана</option>
                                <option value="Несрочно">Несрочно</option>
                                <option value="Срочно">Срочно</option>
                                <option value="Очень срочно">Очень срочно ⏳</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-bold text-muted small text-uppercase mb-1">Дедлайн</Form.Label>
                            <Form.Control
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="border-0 shadow-sm" />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-bold text-muted small text-uppercase mb-1">Исполнитель</Form.Label>
                            <Form.Select
                                value={assigneeId || ''}
                                onChange={(e) => setAssigneeId(e.target.value || null)}
                                className="border-0 shadow-sm"
                            >
                                <option value="">Не назначен</option>
                                {members.map(member => (
                                    <option key={member.userId || member.id} value={member.userId || member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-muted small text-uppercase">Описание</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Добавьте подробное описание..."
                        className="bg-light border-0" />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-muted small text-uppercase">Теги задачи</Form.Label>
                    <div className="d-flex flex-wrap gap-1 mb-2" style={{ maxWidth: '100%' }}>
                        {tags.map((tag, index) => {
                            const color = getTagColor(tag);
                            return (
                                <span
                                    key={index}
                                    className="badge rounded-pill fw-medium d-inline-flex align-items-center"
                                    style={{
                                        backgroundColor: color.bg,
                                        color: color.text,
                                        cursor: 'pointer',
                                        padding: '4px 10px',
                                        fontSize: '0.8rem',
                                        maxWidth: '220px',
                                        gap: '4px'
                                    }}
                                    onClick={() => setTags(tags.filter(t => t !== tag))}
                                    title={`#${tag}`}
                                >
                                    <span
                                        style={{
                                            maxWidth: '170px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            display: 'inline-block',
                                            lineHeight: 1.2
                                        }}
                                    >
                                            #{tag}
                                        </span>
                                    <span style={{ fontSize: '14px', lineHeight: '1', flexShrink: 0 }}>
                                        &times;
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                    <Form.Control
                        type="text"
                        maxLength={25}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const cleanTag = tagInput.trim().replace(/^#+/, '').slice(0, 25);
                                if (cleanTag && !tags.includes(cleanTag) && tags.length < 8) {
                                    setTags([...tags, cleanTag]);
                                }
                                setTagInput('');
                            }
                        }}
                        placeholder="Введите тег и нажмите Enter (до 25 символов)..."
                        className="bg-light border-0 shadow-none"
                    />
                    <Form.Text className="text-muted small">
                        Нажмите Enter для добавления. До 8 тегов (макс. 25 симв.). Кликните для удаления.
                    </Form.Text>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
                <Button variant="light" onClick={() => setShowModal(false)}>Отмена</Button>
                <Button variant="primary" type="submit">Сохранить</Button>
            </Modal.Footer>
        </Form>
    </Modal>;
}
