import { Container, Row, Col, Button } from 'react-bootstrap';
import Column from './Column';
import { useColumns } from '../context/BoardContext';
import { useBoard } from '../context/BoardHooks';
import { useEffect } from 'react';
import { useDBColumn } from '../DataBaseHook';
import { useState } from 'react';
import { Modal, Form, Badge, InputGroup, ListGroup } from 'react-bootstrap';


function ProjectBoard({ name, id, ...rest }) {

    const [getColumns, getTasks, post, patch, remove] = useDBColumn();

    const [columns, setColumns] = useColumns();
    const [addColumn, updateColumn, removeColumn] = useBoard();

    const newColumn = () => ({
        orderIndex: (columns[columns.length - 1]?.orderIndex ?? -1) + 1,
        title: `New Column`,
        projectId: id
    });

    useEffect(() => {
        let cancelled = false;

        async function fetchColumns() {
            setColumns([]);
            const fetched = await getColumns(id);

            const promises = fetched.map(async (column) => {
                const tasks = await getTasks(column.id);
                return { ...column, tasks: tasks };
            });

            const columnsWithTasks = await Promise.all(promises);
            if (!cancelled) {
                columnsWithTasks.sort((a, b) => a.orderIndex - b.orderIndex);
                setColumns(columnsWithTasks);
            }
        }

        fetchColumns();

        return () => { cancelled = true; };
    }, [id]);

    if (!columns)
        return <h1>Loading Columns for {name}...</h1>


    const [showSettings, setShowSettings] = useState(false);

    return (
        <Container fluid className="py-5 position-relative" style={{ backgroundColor: '#C1F0C4', minHeight: '100vh' }}>
            <div className="text-center mb-5">
                <h1 className="fw-bold mb-3" style={{ color: '#212121' }}>Проект <mark>{name}</mark></h1>

                <Button
                    variant="dark"
                    className="rounded-pill px-4 shadow-sm"
                    style={{ backgroundColor: '#212121' }}
                    onClick={async () => { let c = await post(newColumn()); addColumn({ ...c, tasks: [] }); }}
                >
                    + Добавить колонку
                </Button>
            </div>

            <Button
                variant="dark"
                className="position-absolute d-flex align-items-center justify-content-center shadow-sm"
                style={{
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#212121',
                    borderRadius: '0.5rem',
                    zIndex: 10,
                }}
                onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
                aria-label="Настройки"
            >
                ⚙️
            </Button>

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }} className="justify-content-start align-items-stretch">
                    {columns.map((column) =>
                        <Col key={column.id} style={{ minWidth: '350px', width: '350px', flexGrow: 0 }} className="me-3 h-100">
                            <Column
                                column={column}
                                onColumnUpdate={async (c) => { await patch(c); updateColumn(c); }}
                                onColumnDelete={async () => { await remove(column); removeColumn(column); }}
                            />
                        </Col>
                    )}
                </Row>
            </div>

            <ProjectContributors showSettings={showSettings} setShowSettings={setShowSettings} />
        </Container>
    );
}

// TODO: Correct all colors
function ProjectContributors({ showSettings, setShowSettings }) {
    const [inviteValue, setInviteValue] = useState("");
    const handleInviteChange = () => { };
    const handleInviteClick = () => { };
    const contributors = null;
    return (
        <Modal show={showSettings} onHide={() => setShowSettings(false)} centered data-bs-theme="light">
            <Modal.Body className="p-4 text-white" style={{ backgroundColor: '#57fd7bb2', borderRadius: '0.8rem' }}>
                {/* Шапка с кнопкой закрытия */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="m-0">Настройки проекта</h5>
                    <Button
                        variant="dark"
                        className="d-flex align-items-center justify-content-center p-0"
                        style={{ width: '36px', height: '36px', backgroundColor: '#212121', borderRadius: '0.5rem' }}
                        onClick={() => setShowSettings(false)}
                        aria-label="Закрыть"
                    >
                        ✕
                    </Button>
                </div>

                {/* Роль текущего пользователя */}
                <p className="mb-4 text-white">
                    Вы в этом проекте: <strong className="text-white">Владелец</strong>
                </p>

                {/* Форма приглашения */}
                <Form onSubmit={(e) => e.preventDefault()} className="mb-4">
                    <Form.Label className="small text-white">Пригласить участника</Form.Label>
                    <InputGroup>
                        <Form.Control
                            placeholder="Почта пользователя:"
                            value={inviteValue}
                            onChange={handleInviteChange}
                            style={{ backgroundColor: '#0a0b0d', borderColor: '#333', color: '#fff' }}
                        />
                        <Button variant="light" onClick={handleInviteClick}>
                            Пригласить
                        </Button>
                    </InputGroup>
                </Form>

                {/* Список контрибьюторов */}
                <div>
                    <div className="small text-white mb-2">Контрибьюторы</div>
                    <ListGroup style={{ maxVertHeight: '200px', overflowY: 'auto' }}>
                        {contributors?.map((c, i) => (
                            <ListGroup.Item
                                key={i}
                                className="d-flex justify-content-between align-items-center bg-transparent border-secondary px-0 py-2 text-white small"
                            >
                                <div className="text-truncate me-2">{c.address}</div>
                                <Badge bg="white" pill>{c.role}</Badge>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ProjectBoard