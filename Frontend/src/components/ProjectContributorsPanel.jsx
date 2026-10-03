import { useEffect, useState } from 'react';
import { Badge, Button, Form, InputGroup, ListGroup, Modal } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import useProject from '../context/ProjectContext';
import useUser from "../context/UserContext.jsx";
import { useProjectMembers } from '../hooks/ProjectMemberHook';

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

    useEffect(() => {
        async function fetchMembers() {
            try {
                const data = await getProjectMembers(currentProject);
                setContributors(data);
            } catch (error) {
                console.error("Ошибка при загрузке участников проекта:", error);
            }
        }

        if (currentProject?.id) {
            fetchMembers();
        }

    }, [currentProject, trigger]);


    const handleRemove = async (member) => {
        const isSelf = member.userId === currentUser.id || member.id === currentUser.id;
        const confirmText = isSelf ? "Вы уверены, что хотите покинуть проект?" : `Исключить ${member.name}?`;

        if (window.confirm(confirmText)) {
            try {
                await removeProjectMember(currentProject, member);
                if (isSelf) {
                    setCurrentProject(null);
                    setShowSettings(false);
                    navigate("/");
                } else {
                    setTrigger(p => p + 1);
                }
            } catch (error) {
                alert(error.response?.data || "Не удалось удалить участника");
            }
        }
    };

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
        <InputGroup>
            <Form.Control
                placeholder="Почта пользователя:"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#212121',
                    color: '#212121',
                    borderRadius: '0.6rem 0 0 0.6rem'
                }} />
            <Form.Select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={{ maxWidth: '140px' }}
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
        {errorMessage && <div className="text-danger small mt-1">{errorMessage}</div>}
    </Form>;
}

function ContributorsList({ contributors, currentUser, handleRemove }) {
    return <div>
        <div className="small text-secondary fw-semibold mb-2">Контрибьюторы</div>
        <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {contributors.map((c, i) => {
                const isSelf = c.userId === currentUser?.id || c.id === currentUser?.id;
                // const badge = getRoleBadgeColor ? getRoleBadgeColor(c.role) : null;
                return (
                    <ListGroup.Item
                        key={c.userId || c.id || i}
                        className="d-flex justify-content-between align-items-center bg-transparent border-light-subtle px-0 py-2 text-dark small"
                    >
                        <div className="text-truncate me-2 fw-semibold">{c.name}</div>
                        <div className="text-secondary me-2">{c.email}</div>

                        <div className="d-flex align-items-center gap-2">
                            <Badge bg="dark" className="fw-normal">
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
        case 'Owner': styles = { bg: '#c1f0c4', text: '#196f3d', label: 'Владелец' };
        case 'Member': styles = { bg: '#d0e1fd', text: '#1a56db', label: 'Участник' };
        default: styles = { bg: '#e5e7eb', text: '#374151', label: 'Наблюдатель' };
    }
    return (
        <span className="badge fw-semibold ms-2" style={{ backgroundColor: styles.bg, color: styles.text }}>
            {styles.label}
        </span>
    )
}

export default ProjectContributors;