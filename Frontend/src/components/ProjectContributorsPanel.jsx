import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Form, InputGroup, ListGroup, Modal } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import useProject from '../context/ProjectContext';
import useUser from "../context/UserContext.jsx";
import { useProjectMembers } from '../hooks/ProjectMemberHook';
import { hub } from '../api/index.js';
import api from '../api/index.js';

function ProjectContributors({ showSettings, setShowSettings }) {
    const navigate = useNavigate();
    const [currentProject, setCurrentProject] = useProject();
    const [currentUser] = useUser();
    const [getProjectMembers, addProjectMember, removeProjectMember] = useProjectMembers();
    /** @type {ProjectMember[]} */
    const initialContributors = [];
    const [contributors, setContributors] = useState(initialContributors);

    const [trigger, setTrigger] = useState(0);

    const isOwner = currentProject?.role === "Owner" || currentProject?.ownerId === currentUser?.id;
    const myRole = currentProject?.role || (isOwner ? "Owner" : "Member");

    const refreshMembers = async () => {
        if (!currentProject?.id) return;

        try {
            const data = await getProjectMembers(currentProject);
            setContributors(data);
        } catch (error) {
            console.error("Ошибка при загрузке участников проекта:", error);
        }
    };

    useEffect(() => {
        if (currentProject?.id) {
            refreshMembers();
        }
    }, [currentProject, trigger]);

    useEffect(() => {
        if (!currentProject?.id) return;

        const handleStateChanged = async (message) => {
            if (!message || message.type !== 'stateChanged') return;

            const { entityType, action, payload } = message;
            if (entityType !== 'projectMember') return;

            const eventProjectId = payload?.projectId;
            if (eventProjectId !== currentProject.id) return;

            if (['created', 'updated', 'deleted'].includes(action)) {
                await refreshMembers();
            }
        };

        hub.on('stateChanged', handleStateChanged);

        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [currentProject?.id, refreshMembers]);


    const handleRemove = async (member) => {
        const isSelf = member.userId === currentUser.id || member.id === currentUser.id;
        const confirmText = isSelf ? "Вы уверены, что хотите покинуть проект?" : `Исключить ${member.name}?`;

        if (window.confirm(confirmText)) {
            try {
                await removeProjectMember(currentProject, member);
                if (isSelf) {
                    setShowSettings(false);
                    navigate("/");
                    setCurrentProject(null);
                } else {
                    setTrigger(p => p + 1);
                }
            } catch (error) {
                alert(error.response?.data || "Не удалось удалить участника");
            }
        }
    };

    return (
        <Modal show={showSettings} onHide={() => setShowSettings(false)} centered data-bs-theme="light" size="lg">
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

                <p className="mb-4 text-secondary small">
                    Ваша роль:
                    <MyRoleBadge role={myRole} />
                </p>

                <InviteForm
                    currentProject={currentProject}
                    addProjectMember={addProjectMember}
                    setContributors={setContributors}
                />

                <ContributorsList
                    contributors={contributors}
                    currentUser={currentUser}
                    handleRemove={handleRemove}
                />
            </Modal.Body>
        </Modal>
    );
}

function InviteForm({ currentProject, addProjectMember, setContributors }) {

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Member");
    const [errorMessage, setErrorMessage] = useState("");
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendsLoaded, setFriendsLoaded] = useState(false);
    const inviteRef = useRef(null);

    const searchQuery = inviteEmail.trim().toLowerCase();

    useEffect(() => {
        function handleClickOutside(event) {
            if (inviteRef.current && !inviteRef.current.contains(event.target)) {
                setShowFriends(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredFriends = friends.filter((friend) =>
        friend.name?.toLowerCase().includes(searchQuery) ||
        friend.email?.toLowerCase().includes(searchQuery)
    );

    async function loadFriends() {
        setLoadingFriends(true);

        try {
            const response = await api.get("/api/Friendship/friends");
            setFriends(response.data);
            setFriendsLoaded(true);
        } catch (error) {
            setErrorMessage("Не удалось загрузить список друзей.");
        } finally {
            setLoadingFriends(false);
        }
    }

    function handleSelectFriend(friend) {
        setSelectedFriend(friend);
        setInviteEmail(friend.email);
        setShowFriends(false);
        setErrorMessage("");
    }

    const handleInvite = async (e) => {
        if (e) e.preventDefault();
        if (!inviteEmail.trim()) return;
        setErrorMessage("");
        try {
            const newMember = await addProjectMember(currentProject, {
                email: inviteEmail.trim(),
                role: inviteRole
            });
            setContributors(prev => [...prev, newMember]);
            setInviteEmail("");
        } catch (error) {
            setErrorMessage(error.response?.data || "Ошибка при приглашении пользователя");
        }
    };

    return <Form onSubmit={(e) => { e.preventDefault(); handleInvite(); }} className="mb-4">
        <Form.Label className="small text-secondary fw-semibold mb-2">Пригласить участника</Form.Label>
        <div className="position-relative" ref={inviteRef}>
            <InputGroup className="d-flex w-100">
                <Form.Control
                    placeholder="Почта пользователя:"
                    value={inviteEmail}
                    autoComplete="off"
                    onFocus={() => {
                        if (!friendsLoaded) {
                            loadFriends();
                        }
                        setShowFriends(true);
                    }}
                    onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setSelectedFriend(null);
                        setShowFriends(true);
                    }}
                    style={{
                        backgroundColor: '#ffffff',
                        borderColor: '#212121',
                        color: '#212121',
                        borderRadius: '0.6rem 0 0 0.6rem',
                        minWidth: '180px'
                    }}
                    className="flex-grow-1" />
                <Form.Select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    style={{ minWidth: '160px' }}
                >
                    <option value="Member">Участник</option>
                    <option value="Viewer">Наблюдатель</option>
                </Form.Select>
                <Button
                    variant="dark"
                    type="submit"
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
            {showFriends && (
                <div
                    className="position-absolute top-100 start-0 bg-white border rounded-3 shadow-sm mt-1"
                    style={{
                        width: "calc((100% - 160px - 105px))",
                        zIndex: 1060,
                        maxHeight: "220px",
                        overflowY: "auto",
                        overflowX: "hidden"
                    }}
                >
                {loadingFriends ? (
                    <div className="p-3 text-muted small">
                        Загружаем друзей...
                    </div>
                ) : filteredFriends.length > 0 ? (
                    <ListGroup variant="flush">
                        {filteredFriends.map((friend) => (
                            <ListGroup.Item
                                key={friend.id}
                                action
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectFriend(friend)}
                            >
                                <div className="fw-semibold">{friend.name}</div>
                                <div className="small text-muted">{friend.email}</div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <div className="p-3 text-muted small">
                        {friends.length === 0
                            ? "У тебя пока нет друзей."
                            : "Друзья не найдены."}
                    </div>
                )}
            </div>
        )}
    </div>
        {errorMessage && <div className="text-danger small mt-1">{errorMessage}</div>}
    </Form>;
}

function ContributorsList({ contributors, currentUser, handleRemove }) {
    return <div>
        <div className="small text-secondary fw-semibold mb-2">Контрибьюторы</div>
        <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {contributors.map((c, i) => {
                const isSelf = c.userId === currentUser?.id || c.id === currentUser?.id;
                return (
                    <ListGroup.Item
                        key={c.userId || c.id || i}
                        className="d-flex justify-content-between align-items-center bg-transparent border-light-subtle px-0 py-2 text-dark small"
                    >
                        <div className="text-truncate me-2 fw-semibold">{c.name}</div>
                        <div className="text-secondary me-2">{c.email}</div>

                        <div className="d-flex align-items-center gap-2">
                            <Badge bg="dark" className="fw-normal"> { /*Можно использовать MyRoleBadge, вопрос дизайна*/ }
                                {c.role}
                            </Badge>

                            <Button
                                variant="dark"
                                size="sm"
                                onClick={() => handleRemove(c)}
                                style={{
                                    backgroundColor: '#d11515',
                                    borderColor: '#d11515',
                                    borderRadius: '0.5rem',
                                    color: '#ffffff'
                                }}
                            >
                                {isSelf ? "Выйти" : "✕"}
                            </Button>
                        </div>
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    </div>;
}

/** 
 * @param {{ role: string }} props
 */
function MyRoleBadge({ role }) {
    let styles;
    switch (role) {
        case 'Owner': styles = { bg: '#c1f0c4', text: '#196f3d', label: 'Владелец' }; break;
        case 'Member': styles = { bg: '#d0e1fd', text: '#1a56db', label: 'Участник' }; break;
        default: styles = { bg: '#e5e7eb', text: '#374151', label: 'Наблюдатель' }; break;
    }
    return (
        <span className="badge fw-semibold ms-2" style={{ backgroundColor: styles.bg, color: styles.text }}>
            {styles.label}
        </span>
    )
}

export default ProjectContributors;