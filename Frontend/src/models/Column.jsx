import { Col, Card, Badge, Button } from 'react-bootstrap';
import RenderTask from './Task';

function Column({ column, onDelete }) {
    return (
        <Card style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <Card.Header className="bg-light">
                <h5 className="mb-0 d-flex align-items-center justify-content-between w-100">

                    {column.title}
                    <Badge bg="secondary" className="ms-2">
                        {column.tasks.length}
                    </Badge>
                    <Button
                        variant='secondary'
                        className="ms-auto py-0 px-2"
                        style={{ height: '24px', minWidth: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={onDelete ? () => onDelete() : null}
                    >
                        -
                    </Button>
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