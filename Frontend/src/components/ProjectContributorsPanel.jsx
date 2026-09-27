import { Modal, Form, Badge, InputGroup, ListGroup, Button } from 'react-bootstrap';
import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useProjectMembers } from '../hooks/ProjectMemberHook';

function ProjectContributors({ showSettings, setShowSettings }) {
    const [currentProject, ] = useProject();
    const [getProjectMembers, addProjectMember, removeProjectMember] = useProjectMembers();
    const [inviteValue, setInviteValue] = useState("");
    /** @type {ProjectMember[]} */
    const contributors = [];
    return (
        <Modal show={showSettings} onHide={() => setShowSettings(false)} centered data-bs-theme="light">
            <Modal.Body className="p-4" style={{ backgroundColor: '#ffffff', borderRadius: '1.2rem', color: '#212121' }}>

                {/* Шапка с кнопкой закрытия */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="m-0 fw-bold" style={{ color: '#212121' }}>Настройки проекта</h5>
                    <Button
                        variant="dark"
                        className="d-flex align-items-center justify-content-center p-0"
                        style={{ width: '36px', height: '36px', backgroundColor: '#212121', borderRadius: '0.6rem' }}
                        onClick={() => setShowSettings(false)}
                        aria-label="Закрыть"
                    >
                        ✕
                    </Button>
                </div>

                {/* Роль текущего пользователя */}
                <p className="mb-4 text-secondary small">
                    Вы в этом проекте: <span className="badge fw-semibold ms-1" style={{ backgroundColor: '#c1f0c4', color: '#196f3d' }}>Владелец</span> {/* check role somehow idk*/}
                </p>

                {/* Форма приглашения */}
                <Form onSubmit={(e) => e.preventDefault()} className="mb-4">
                    <Form.Label className="small text-secondary fw-semibold mb-2">Пригласить участника</Form.Label>
                    <InputGroup>
                        <Form.Control
                            placeholder="Почта пользователя:"
                            value={inviteValue}
                            onChange={e => setInviteValue(e.target.value)}
                            style={{
                                backgroundColor: '#ffffff',
                                borderColor: '#212121',
                                color: '#212121',
                                borderRadius: '0.6rem 0 0 0.6rem'
                            }}
                        />
                        <Button
                            variant="dark"
                            onClick={() => addProjectMember(currentProject, {email: inviteValue})}
                            style={{
                                backgroundColor: '#212121',
                                borderColor: '#212121',
                                borderRadius: '0 0.6rem 0.6rem 0',
                                color: '#ffffff'
                            }}
                        >
                            Пригласить
                        </Button>
                    </InputGroup>
                </Form>

                {/* Список контрибьюторов */}
                <div>
                    <div className="small text-secondary fw-semibold mb-2">Контрибьюторы</div>
                    <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {contributors.map((c, i) => (
                            <ListGroup.Item
                                key={i}
                                className="d-flex justify-content-between align-items-center bg-transparent border-light-subtle px-0 py-2 text-dark small"
                            >
                                <div className="text-truncate me-2">{c.name}</div>
                                <div className="text-secondary me-2">{c.email}</div>
                                <Badge bg="dark" className="fw-normal">{c.role}</Badge>
                                <Button
                                    variant="dark"
                                    onClick={() => removeProjectMember(c)}
                                    style={{
                                        backgroundColor: '#d11515',
                                        borderColor: '#212121',
                                        borderRadius: '0 0.6rem 0.6rem 0',
                                        color: '#ffffff'
                                    }}
                                >
                                    X
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ProjectContributors