import { useEffect, useState } from "react";
import { Alert, Button, ListGroup, Modal, Spinner } from "react-bootstrap";
import api from "../api/index";

function FriendRequestsModal({ show, onHide }) {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    async function loadInvitations() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/Projects/invitations");
            setInvitations(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось загрузить приглашения."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (show) {
            loadInvitations();
        }
    }, [show]);

    async function handleInvitation(invitationId, accept) {
        setProcessingId(invitationId);
        setError("");

        try {
            await api.post(
                `/api/Projects/invitations/${invitationId}/respond`,
                { accept }
            );

            setInvitations(prev =>
                prev.filter(invitation => invitation.id !== invitationId)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Не удалось ${accept ? "принять" : "отклонить"} приглашение.`
            );
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Приглашения в проекты</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" />
                        <span className="ms-2">
                            Загружаем приглашения...
                        </span>
                    </div>
                ) : invitations.length === 0 ? (
                    <p className="text-muted mb-0">
                        Входящих приглашений пока нет.
                    </p>
                ) : (
                    <ListGroup variant="flush">
                        {invitations.map(invitation => (
                            <ListGroup.Item key={invitation.id}>
                                <div className="fw-semibold">
                                    {invitation.projectName}
                                </div>

                                <div className="small text-muted mb-3">
                                    Приглашение от: {invitation.inviterName}
                                    <br />
                                    Роль: {invitation.role === "Viewer"
                                        ? "Наблюдатель"
                                        : "Участник"}
                                </div>

                                <div className="d-flex gap-2">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        disabled={processingId !== null}
                                        onClick={() =>
                                            handleInvitation(invitation.id, true)
                                        }
                                    >
                                        {processingId === invitation.id
                                            ? "Обработка..."
                                            : "Принять"}
                                    </Button>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        disabled={processingId !== null}
                                        onClick={() =>
                                            handleInvitation(invitation.id, false)
                                        }
                                    >
                                        Отклонить
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FriendRequestsModal;
