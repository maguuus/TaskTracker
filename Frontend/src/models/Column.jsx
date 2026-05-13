import { Col, Card, Badge } from 'react-bootstrap';
import RenderTask from './Task';

function Column({ column }) {
    return (
        <Card style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <Card.Header className="bg-light">
                <h5 className="mb-0">
                    {column.title}
                    <Badge bg="secondary" className="ms-2">
                        {column.tasks.length}
                    </Badge>
                </h5>
            </Card.Header>

            <Card.Body style={{ overflowY: 'auto', padding: '0.75rem' }}>
                {column.tasks.map((task) => (
                    <RenderTask key={task.id} task={task} />
                ))}
            </Card.Body>
        </Card>
    )
}

export default Column;