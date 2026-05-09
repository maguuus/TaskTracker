import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';


export function Board() {

    let id = 0;

    function makeTask() {
        id++;

        return { id: id, title: `Задача ${id}`, description: `Описание задачи ${id}` };
    }

    // Данные для колонок и карточек
    const columns = [
        {
            id: 1,
            title: "To Do",
            tasks: [
                makeTask(),
                makeTask(),
            ]
        },
        {
            id: 2,
            title: "In Progress",
            tasks: [
                    makeTask(),
                    makeTask(),
                    makeTask(),
                    makeTask(),
                    makeTask(),
                    makeTask(),
                ]

        },
        {
            id: 3,
            title: "On Review",
            tasks: [
                makeTask(),
            ]
        }
    ];

    function PaintTask(task) {
        return (
            <Card key={task.id} className="mb-3 shadow-sm">
                <Card.Body>
                    <Card.Title className="h6">{task.title}</Card.Title>
                    <Card.Text className="small text-muted">
                        {task.description}
                    </Card.Text>

                    {/* Кнопки */}
                    <div className="d-flex gap-2 mt-2">
                        <Button variant="outline-primary" size="sm">
                            Редактировать
                        </Button>
                        <Button variant="outline-danger" size="sm">
                            Удалить
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                            Детали
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        )
    }

    function PaintColumn(column) {
        return (
            <Col
                key={column.id}
                style={{ minWidth: '350px', width: '350px' }}
                className="me-3"
            >
                {/* Колонка*/}
                <Card style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
                    <Card.Header className="bg-light">
                        <h5 className="mb-0">
                            {column.title}
                            <Badge bg="secondary" className="ms-2">
                                {column.tasks.length}
                            </Badge>
                        </h5>
                    </Card.Header>

                    {/* область с карточками (тело)*/}
                    <Card.Body style={{ overflowY: 'auto', padding: '0.75rem' }}>
                        {column.tasks.map((task) => PaintTask(task))}  {/* Отрисовка каждой отдельной карточки*/}
                    </Card.Body>
                </Card>
            </Col>

        )
    }

    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4">Проект {name}:</h2>

            {/* Горизонтальный скролл для поддержки многих колонок */}
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }}>
                    {columns.map((column) => PaintColumn(column))} {/* Отрисовка каждой отдельной колонки*/}
                </Row>
            </div>
        </Container>
    );
}