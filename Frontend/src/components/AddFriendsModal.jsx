
import { useEffect, useState } from "react";
import { Alert, Button, Form, ListGroup, Modal } from "react-bootstrap";
import api from "../api/index";

function AddFriendsModal({ show, onHide }) {
    const [friendQuery, setFriendQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [sendingUserId, setSendingUserId] = useState(null);
    const [addResults, setAddResults] = useState({});

    async function handleAddFriend(user) {
        setSendingUserId(user.id);
        setAddResults((prev) => ({
            ...prev,
            [user.id]: null,
        }));

        try {
            const response = await api.post(
                `/api/Friendship/favorites/${user.id}`
            );

            setAddResults((prev) => ({
                ...prev,
                [user.id]: {
                    success: true,
                    message:
                        response.data?.message ||
                        "Пользователь добавлен в избранное.",
                },
            }));
        } catch (error) {
            setAddResults((prev) => ({
                ...prev,
                [user.id]: {
                    success: false,
                    message:
                        error.response?.data?.message ||
                        "Не удалось добавить пользователя в избранное.",
                },
            }));
        } finally {
            setSendingUserId(null);
        }
    }

    useEffect(() => {
        const query = friendQuery.trim();

        if (!show || !query) {
            setFoundUsers([]);
            setSearching(false);
            setSearchError("");
            return;
        }

        let cancelled = false;

        const timer = setTimeout(async () => {
            setSearchError("");

            try {
                const response = await api.get("/api/User/search", {
                    params: { query },
                });

                if (!cancelled) {
                    setFoundUsers(response.data);
                }
            } catch {
                if (!cancelled) {
                    setFoundUsers([]);
                    setSearchError(
                        "Не удалось загрузить пользователей. Проверь подключение к серверу."
                    );
                }
            } finally {
                if (!cancelled) {
                    setSearching(false);
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [friendQuery, show]);

    function handleClose() {
        setFriendQuery("");
        setFoundUsers([]);
        setSearchError("");
        setAddResults({});
        onHide();
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить в избранное</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Control
                    type="search"
                    placeholder="Найти пользователя по имени..."
                    value={friendQuery}
                    onChange={(e) => setFriendQuery(e.target.value)}
                    className="rounded-3 mb-3"
                />

                <div className="friends-list-scroll">
                    {!friendQuery.trim() && (
                        <p className="text-muted mb-0">
                            Введи имя, чтобы найти пользователей.
                        </p>
                    )}

                    {searching && (
                        <p className="text-muted mb-2">
                            Ищем пользователей...
                        </p>
                    )}

                    {searchError && (
                        <Alert variant="danger" className="mb-0">
                            {searchError}
                        </Alert>
                    )}

                    {!searching &&
                        !searchError &&
                        friendQuery.trim() &&
                        foundUsers.length === 0 && (
                            <p className="text-muted mb-0">
                                Пользователи не найдены.
                            </p>
                        )}

                    <ListGroup variant="flush">
                        {foundUsers.map((user) => (
                            <ListGroup.Item key={user.id}>
                                <div className="d-flex align-items-center justify-content-between gap-3">
                                    <span>{user.name}</span>

                                    <Button
                                        variant="dark"
                                        className="rounded-pill px-3 flex-shrink-0"
                                        disabled={
                                            sendingUserId === user.id ||
                                            addResults[user.id]?.success
                                        }
                                        onClick={() => handleAddFriend(user)}
                                    >
                                        {sendingUserId === user.id
                                            ? "Добавление..."
                                            : addResults[user.id]?.success
                                                ? "В избранном"
                                                : "Добавить"}
                                    </Button>
                                </div>

                                {addResults[user.id] && (
                                    <p
                                        className={`small mt-2 mb-0 ${
                                            addResults[user.id].success
                                                ? "text-success"
                                                : "text-danger"
                                        }`}
                                    >
                                        {addResults[user.id].message}
                                    </p>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddFriendsModal;
