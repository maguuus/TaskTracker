
import { useEffect, useState } from "react";
import { Alert, Button, Form, ListGroup, Modal } from "react-bootstrap";
import api from "../api/index";
import "./FriendsModal.css";

function FriendsModal({ show, onHide }) {
    const [friendQuery, setFriendQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

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
            setSearching(true);
            setSearchError("");

            try {
                const response = await api.get("/api/User/search", {
                    params: { query },
                });

                if (!cancelled) {
                    setFoundUsers(response.data);
                }
            } catch (error) {
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
        onHide();
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
            scrollable={false}
            dialogClassName="friends-modal-dialog"
        >
            <Modal.Header closeButton>
                <Modal.Title>Мои друзья</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="friends-layout">
                    <section className="friends-section">
                        <h5 className="friends-section-title">
                            Мои друзья
                        </h5>

                        <div className="friends-list-scroll">
                            <p className="text-muted mb-0">
                                Список друзей пока не подключён.
                            </p>
                        </div>
                    </section>

                    <section className="friends-section">
                        <h5 className="friends-section-title">
                            Другие пользователи
                        </h5>

                        <Form.Control
                            type="search"
                            placeholder="Найти пользователя по имени..."
                            value={friendQuery}
                            onChange={(e) =>
                                setFriendQuery(e.target.value)
                            }
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
                                <Alert
                                    variant="danger"
                                    className="mb-0"
                                >
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
                                    <ListGroup.Item
                                        key={user.id}
                                        className="d-flex align-items-center justify-content-between gap-3"
                                    >
                                        <span>{user.name}</span>

                                        <Button
                                            variant="dark"
                                            className="rounded-pill px-3 flex-shrink-0"
                                            style={{
                                                backgroundColor: "#212121",
                                                border: "none",
                                            }}
                                            onClick={() => {
                                                // Отправку заявки добавим после реализации backend endpoint.
                                            }}
                                        >
                                            Добавить
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    </section>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FriendsModal;
