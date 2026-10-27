
import { useEffect, useState } from "react";
import { Alert, Button, ListGroup, Modal, Spinner } from "react-bootstrap";
import api from "../api/index";

function FriendRequestsModal({ show, onHide }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    async function loadRequests() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/Friendship/requests");
            setRequests(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось загрузить заявки."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (show) {
            loadRequests();
        }
    }, [show]);

    async function handleRequest(requestId, action) {
        setProcessingId(requestId);
        setError("");

        try {
            await api.post(
                `/api/Friendship/requests/${requestId}/${action}`
            );

            setRequests((prev) =>
                prev.filter((request) => request.id !== requestId)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Не удалось ${action === "accept" ? "принять" : "отклонить"} заявку.`
            );
        } finally {
            setProcessingId(null);
        }
    }

    function handleClose() {
        onHide();
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Заявки в друзья</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && (
                    <Alert variant="danger">{error}</Alert>
                )}

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" />
                        <span className="ms-2">Загружаем заявки...</span>
                    </div>
                ) : requests.length === 0 ? (
                    <p className="text-muted mb-0">
                        Входящих заявок пока нет.
                    </p>
                ) : (
                    <ListGroup variant="flush">
                        {requests.map((request) => (
                            <ListGroup.Item key={request.id}>
                                <div className="d-flex align-items-center justify-content-between gap-3">
                                    <span className="fw-medium">
                                        {request.name}
                                    </span>

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            disabled={processingId !== null}
                                            onClick={() =>
                                                handleRequest(request.id, "accept")
                                            }
                                        >
                                            {processingId === request.id
                                                ? "..."
                                                : "Принять"}
                                        </Button>

                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            disabled={processingId !== null}
                                            onClick={() =>
                                                handleRequest(request.id, "reject")
                                            }
                                        >
                                            Отклонить
                                        </Button>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FriendRequestsModal;
