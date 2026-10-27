
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, ListGroup, Modal, Spinner } from "react-bootstrap";
import api from "../api/index";
import "./FriendsModal.css";

function FriendsModal({ show, onHide }) {
    const [friends, setFriends] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (!show) return;

        let cancelled = false;

        async function loadFriends() {
            setLoading(true);
            setError("");

            try {
                const response = await api.get("/api/Friendship/favorites");

                if (!cancelled) {
                    setFriends(response.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Не удалось загрузить избранное."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadFriends();

        return () => {
            cancelled = true;
        };
    }, [show]);

    const filteredFriends = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();

        return friends.filter((friend) =>
            (friend.name || "")
                .toLocaleLowerCase()
                .includes(normalizedQuery)
        );
    }, [friends, query]);

    async function handleRemoveFriend(friend) {
        if (!window.confirm(`Удалить ${friend.name} из избранного?`)) {
            return;
        }

        setDeletingId(friend.id);
        setError("");

        try {
            await api.delete(`/api/Friendship/favorites/${friend.id}`);

            setFriends((prev) =>
                prev.filter((item) => item.id !== friend.id)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось удалить пользователя из избранного."
            );
        } finally {
            setDeletingId(null);
        }
    }

    function handleClose() {
        setQuery("");
        setError("");
        onHide();
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            dialogClassName="friends-modal-dialog"
        >
            <Modal.Header closeButton>
                <Modal.Title>Избранное</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Control
                    type="search"
                    placeholder="Найти друга по имени..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="rounded-3 mb-3"
                />

                {error && (
                    <Alert variant="danger">{error}</Alert>
                )}

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" />
                        <span className="ms-2">
                            Загружаем избранное...
                        </span>
                    </div>
                ) : (
                    <div className="friends-list-scroll">
                        {friends.length === 0 ? (
                            <p className="text-muted mb-0">
                                Список избранного пока пуст.
                            </p>
                        ) : filteredFriends.length === 0 ? (
                            <p className="text-muted mb-0">
                                По запросу «{query}» ничего не найдено.
                            </p>
                        ) : (
                            <ListGroup variant="flush">
                                {filteredFriends.map((friend) => (
                                    <ListGroup.Item key={friend.id}>
                                        <div className="d-flex align-items-center justify-content-between gap-3">
                                            <span className="text-break">
                                                {friend.name}
                                            </span>

                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="rounded-pill flex-shrink-0"
                                                disabled={deletingId !== null}
                                                onClick={() =>
                                                    handleRemoveFriend(friend)
                                                }
                                            >
                                                {deletingId === friend.id
                                                    ? "Удаление..."
                                                    : "Удалить"}
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
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

export default FriendsModal;
