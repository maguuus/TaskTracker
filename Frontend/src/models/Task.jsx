import {Card, Button, Modal, Form, Badge, Col, Row} from 'react-bootstrap';
import { useState, useEffect } from 'react';

function Task({ task, onTaskUpdate, onTaskDelete }) {
    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState(task.title || '');
    const [description, setDescription] = useState(task.description || '');
    const [icon, setIcon] = useState(task.icon || '');
    // const [tags, setTags] = useState(task.tags || []);
    // const [tagInput, setTagInput] = useState('');

    const [priority, setPriority] = useState(task.priority || '');
    const [urgency, setUrgency] = useState(task.urgency || '');

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };
    const [dueDate, setDueDate] = useState(formatDateForInput(task.dueDate));
    
    useEffect(() => {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setIcon(task.icon || '');
        // setTags(task.tags || []);
        setPriority(task.priority || '');
        setUrgency(task.urgency || '');
        setDueDate(formatDateForInput(task.dueDate));
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
            // tags: tags,
            priority: priority,
            urgency: urgency,
            dueDate: formattedDate
        });
        setShowModal(false);
    }

    const getBorderColor = () => {
        switch(task.priority) {
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
            <Card className={`border border-${getBorderColor()} shadow-sm p-3 mb-3 bg-white`} style={{ borderLeftWidth: '5px !important', borderRadius: '12px' }}>
                <Card.Body className="p-0 position-relative">

                    <button
                        className="btn-close position-absolute"
                        aria-label="Close"
                        onClick={onTaskDelete}
                        style={{ top: '12px', right: '12px', width: '0.5rem', height: '0.5rem' }}
                    ></button>

                    <div className="d-flex align-items-center mb-2 pe-4">
                        {task.icon && <span className="fs-5 me-2">{task.icon}</span>}
                        <h6 className="mb-0 fw-bold m-0">{task.title}</h6>
                    </div>

                    <div className="text-muted small mb-3 text-truncate">
                        {task.description || "Нет описания"}
                    </div>

                    {/* <div className="d-flex flex-wrap gap-1 mb-3">
                        {task.tags && task.tags.length > 0 ? (
                            task.tags.map((tag, idx) => (
                                <Badge bg="success" key={idx} className="fw-normal rounded-pill">
                                    #{tag}
                                </Badge>
                            ))
                        ) : (
                            <Badge bg="success" className="fw-normal rounded-pill">#работа</Badge>
                        )}
                    </div> */}

                    {(task.priority || task.dueDate) && (
                        <div className="d-flex justify-content-between text-muted small mb-3 fw-bold">
                            {task.priority && <span>⚡ {task.priority}</span>}
                            {displayDate && (
                                <span className={isOverdue ? 'text-danger' : 'text-primary'}>
                                    📅 {displayDate}
                                </span>
                            )}
                        </div>
                    )}                    
                    
                    <div className="d-flex justify-content-end">
                        <Button
                            variant="secondary d-inline-flex focus-ring focus-ring-secondary py-1 px-2 text-decoration-none border rounded-2"
                            size="sm"
                            onClick={() => setShowModal(true)}
                        >
                            Детали
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <div className="d-flex w-100 gap-2 align-items-center">
                            <Form.Control
                                type="text"
                                maxLength="2"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="🚀"
                                style={{ width: '60px', fontSize: '1.5rem', textAlign: 'center' }}
                                title="Эмодзи"
                            />
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="fs-4 fw-bold border-0 shadow-none px-0"
                                placeholder="Название задачи"
                                required
                            />
                        </div>
                    </Modal.Header>
                    
                    <Modal.Body>
                        <Row className="mb-4 bg-light p-3 rounded mx-0">
                            <Col md={4}>
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
                            <Col md={4}>
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
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-bold text-muted small text-uppercase mb-1">Дедлайн</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="border-0 shadow-sm"
                                    />
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
                                className="bg-light border-0"
                            />
                        </Form.Group>

                        {/* <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Теги</Form.Label>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                {tags.map((tag, index) => (
                                    <Badge
                                        bg="primary"
                                        key={index}
                                        style={{ cursor: 'pointer', padding: '8px 12px' }}
                                        onClick={() => removeTag(tag)}
                                        title="Нажмите, чтобы удалить"
                                    >
                                        #{tag} &times;
                                    </Badge>
                                ))}
                            </div>
                            <Form.Control
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Введите тег и нажмите Enter..."
                            />
                        </Form.Group> */}
                    </Modal.Body>

                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={() => setShowModal(false)}>Отмена</Button>
                        <Button variant="primary" type="submit">Сохранить</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default Task;