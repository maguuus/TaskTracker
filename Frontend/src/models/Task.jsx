import { Card, Button } from 'react-bootstrap';
import { useBoard } from '../context/BoardContext';



function RenderTask({ task }) {

    const [columns, setColumns] = useBoard();

    function onDelete() {
        setColumns(prev => prev.map(col => (col.tasks.some(t => t.id === task.id))
            ? { ...col, tasks: col.tasks.filter(t => t.id !== task.id) }
            : col));
    }
    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Card.Title className="h6">{task.title}</Card.Title>
                <Card.Text className="small text-muted">
                    {task.description}
                </Card.Text>
                <div className="d-flex gap-2 mt-2">
                    <Button variant="outline-primary" size="sm">
                        Редактировать
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={onDelete}>
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

export default RenderTask;