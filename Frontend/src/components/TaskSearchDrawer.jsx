import { useState, useEffect } from 'react';
import { Offcanvas, Form, Button, Badge, Card, Spinner, Row, Col } from 'react-bootstrap';
import { useDBTaskSearch } from '../hooks/DataBaseHook';
import api from "../api/index.js";
import {avatarsDictionary, defaultAvatar} from "../hooks/Avatar.jsx";

const getTagColor = (text) => {
    const colors = [
        { bg: '#FEE2E2', text: '#991B1B' },
        { bg: '#FEF3C7', text: '#92400E' },
        { bg: '#D1FAE5', text: '#065F46' },
        { bg: '#DBEAFE', text: '#1E40AF' },
        { bg: '#EDE9FE', text: '#5B21B6' },
        { bg: '#FCE7F3', text: '#9D174D' },
    ];
    let hash = 0;
    const str = (text || '').toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function TaskSearchDrawer({ show, onHide, projectId, onTaskSelect }) {
    const [searchTasks, getRandomTask] = useDBTaskSearch();

    const [query, setQuery] = useState('');
    const [priority, setPriority] = useState('');
    const [urgency, setUrgency] = useState('');
    const [tag, setTag] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    
    const [members, setMembers] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [randomTask, setRandomTask] = useState(null);

    useEffect(() => {
        if (!show || !projectId) return;

        api.get(`/api/projects/${projectId}/members`)
            .then(res => setMembers(res.data || []))
            .catch(err => console.error("Ошибка загрузки участников:", err));
    }, [show, projectId]);
    
    useEffect(() => {
        const handleFilterByTag = (e) => {
            if (e.detail) setTag(e.detail);
        };
        window.addEventListener('filter-by-tag', handleFilterByTag);
        return () => window.removeEventListener('filter-by-tag', handleFilterByTag);
    }, []);
    
    
    useEffect(() => {
        if (!show || !projectId) return;

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const assigneesParam = selectedAssignees.join(',');
                const data = await searchTasks(projectId, { query, priority, urgency, tag, assignees: assigneesParam });
                setResults(data || []);
            } catch (err) {
                console.error("Ошибка поиска:", err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [show, projectId, query, priority, urgency, tag, selectedAssignees]);

    const toggleAssignee = (id) => {
        setSelectedAssignees(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };
    
    const handleRandom = async () => {
        try {
            setLoading(true);
            const task = await getRandomTask(projectId, { query, priority, urgency, tag });
            setRandomTask(task);
        } catch {
            alert("Нет свободных задач под выбранные критерии");
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setQuery('');
        setPriority('');
        setUrgency('');
        setTag('');
        setSelectedAssignees([]);
        setRandomTask(null);
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '420px' }}>
            <Offcanvas.Header closeButton className="border-bottom">
                <Offcanvas.Title className="fw-bold fs-5">🔍 Поиск и фильтры</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="p-3">
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="shadow-sm"
                        autoFocus
                    />
                </Form.Group>

                <div className="mb-3">
                    <Form.Label className="small text-muted fw-bold text-uppercase mb-2 d-block">
                        Исполнитель
                    </Form.Label>
                    <div className="d-flex flex-wrap gap-1">
                        <Button
                            variant={selectedAssignees.includes('unassigned') ? 'dark' : 'outline-secondary'}
                            size="sm"
                            className="rounded-pill py-1 px-2 d-flex align-items-center gap-1 border"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => toggleAssignee('unassigned')}
                        >
                            <span>👤</span> Без исполнителя
                        </Button>

                        {members.map(member => {
                            const memberId = member.userId || member.id;
                            const isSelected = selectedAssignees.includes(memberId);
                            return (
                                <Button
                                    key={memberId}
                                    variant={isSelected ? 'dark' : 'outline-secondary'}
                                    size="sm"
                                    className="rounded-pill py-1 px-2 d-flex align-items-center gap-1 border"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => toggleAssignee(memberId)}
                                >
                                    <img
                                        src={avatarsDictionary[String(member.avatar)] || defaultAvatar}
                                        alt=""
                                        className="rounded-circle"
                                        style={{ width: 16, height: 16, objectFit: 'cover' }}
                                    />
                                    <span>{member.name}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <Row className="g-2 mb-3">
                    <Col xs={6}>
                        <Form.Select
                            size="sm"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="shadow-none"
                        >
                            <option value="">Все приоритеты</option>
                            <option value="Критический">Критический 🚨</option>
                            <option value="Высокий">Высокий</option>
                            <option value="Средний">Средний</option>
                            <option value="Низкий">Низкий</option>
                        </Form.Select>
                    </Col>
                    <Col xs={6}>
                        <Form.Select
                            size="sm"
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value)}
                            className="shadow-none"
                        >
                            <option value="">Вся срочность</option>
                            <option value="Очень срочно">Очень срочно ⏳</option>
                            <option value="Срочно">Срочно</option>
                            <option value="Несрочно">Несрочно</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12}>
                        <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Фильтр по тегу (например: bug)..."
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className="shadow-none"
                        />
                    </Col>
                </Row>

                <div className="d-flex gap-2 mb-3">
                    <Button
                        variant="warning"
                        size="sm"
                        className="w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-1"
                        onClick={handleRandom}
                    >
                        <span>🎲</span> Что взять в работу?
                    </Button>
                    {(query || priority || urgency || tag || selectedAssignees.length > 0) && (
                        <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                            Сбросить
                        </Button>
                    )}
                </div>

                {randomTask && (
                    <Card className="mb-3 border-warning bg-warning bg-opacity-10 shadow-sm">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="badge bg-warning text-dark fw-bold">🎯 Свободная задача</span>
                                <small className="text-muted">{randomTask.columnTitle}</small>
                            </div>
                            <h6 className="fw-bold mb-1">{randomTask.icon} {randomTask.title}</h6>
                            <Button
                                variant="dark"
                                size="sm"
                                className="w-100 mt-2"
                                onClick={() => { onTaskSelect?.(randomTask); onHide(); }}
                            >
                                Перейти к задаче
                            </Button>
                        </Card.Body>
                    </Card>
                )}

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small text-uppercase fw-bold">Найдено задач</span>
                    <Badge bg="secondary">{results.length}</Badge>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" variant="secondary" />
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center text-muted py-4 small">
                        Ничего не найдено
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: 'calc(100vh - 310px)', overflowY: 'auto' }}>
                        {results.map((task) => (
                            <Card
                                key={task.id}
                                className="shadow-sm border-0 border-start border-4 border-primary p-2"
                                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                                onClick={() => { onTaskSelect?.(task); onHide(); }}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div className="fw-bold text-truncate" style={{ maxWidth: '240px' }}>
                                        {task.icon && <span className="me-1">{task.icon}</span>}
                                        {task.title}
                                    </div>
                                    <Badge bg="light" text="dark" className="border">
                                        {task.columnTitle}
                                    </Badge>
                                </div>

                                {task.description && (
                                    <div className="text-muted small text-truncate mb-1">
                                        {task.description}
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-1">
                                    <div className="d-flex gap-1 flex-wrap">
                                        {task.tags?.map((t, idx) => {
                                            const c = getTagColor(t);
                                            return (
                                                <span
                                                    key={idx}
                                                    className="badge rounded-pill"
                                                    style={{ backgroundColor: c.bg, color: c.text, fontSize: '0.65rem' }}
                                                >
                                                    #{t}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        {task.assigneeName ? (
                                            <span className="badge bg-light text-dark border d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                                <img
                                                    src={avatarsDictionary[String(task.assigneeAvatar)] || defaultAvatar}
                                                    alt=""
                                                    className="rounded-circle"
                                                    style={{ width: 14, height: 14, objectFit: 'cover' }}
                                                />
                                                {task.assigneeName}
                                            </span>
                                        ) : (
                                            <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                                                Свободна
                                            </span>
                                        )}
                                        {task.priority && (
                                            <small className="text-danger fw-bold" style={{ fontSize: '0.7rem' }}>
                                                ⚡ {task.priority}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
}