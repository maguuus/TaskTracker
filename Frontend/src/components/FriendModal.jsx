
import { Button, ListGroup, Modal } from "react-bootstrap";
import "./FriendsModal.css";

function FriendsModal({ show, onHide }) {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            dialogClassName="friends-modal-dialog"
        >
            <Modal.Header closeButton>
                <Modal.Title>Мои друзья</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="friends-list-scroll">
                    <ListGroup variant="flush">
                        <ListGroup.Item className="text-muted">
                            Список друзей пока не подключён.
                        </ListGroup.Item>
                    </ListGroup>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FriendsModal;
