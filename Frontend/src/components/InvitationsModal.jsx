import { Modal, Button, ListGroup, Spinner } from 'react-bootstrap';

export default function InvitationsModal({ show, onHide, invites, loading, onRespond }) {
    return (
        <Modal show={show} onHide={onHide} centered size="sm">
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title className="fs-6 fw-bold">Приглашения в проекты</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
                {loading ? (
                    <div className="text-center py-3">
                        <Spinner animation="border" size="sm" variant="secondary" />
                    </div>
                ) : invites.length === 0 ? (
                    <div className="text-center text-muted py-3 small">
                        У вас нет новых приглашений
                    </div>
                ) : (
                    <ListGroup variant="flush">
                        {invites.map((invite) => (
                            <ListGroup.Item
                                key={invite.id}
                                className="d-flex justify-content-between align-items-center px-0 py-2 border-bottom"
                            >
                                <div className="me-2 text-truncate">
                                    <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                                        {invite.projectName}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        от {invite.inviterName}
                                    </div>
                                </div>
                                <div className="d-flex gap-1 flex-shrink-0">
                                    <Button
                                        size="sm"
                                        variant="success"
                                        className="py-0 px-2 fw-bold"
                                        title="Принять"
                                        onClick={() => onRespond(invite.id, true)}
                                    >
                                        ✓
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        className="py-0 px-2"
                                        title="Отклонить"
                                        onClick={() => onRespond(invite.id, false)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
}