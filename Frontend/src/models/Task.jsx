import { Card, Button } from 'react-bootstrap';

function Task({ title, description, ...rest }) {
    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Card.Title className="h6">{title}</Card.Title>
                <Card.Text className="small text-muted">
                    {description}
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

export default Task;