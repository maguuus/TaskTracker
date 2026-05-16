import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Task({ title, description, ...rest }) {
    return (

        <Card className="border-primary shadow-sm p-3 mb-5 bg-white rounded ">
            <Card.Body>
                <h5> {description} </h5>
                <button 
                    className="btn btn-success rounded-pill position-absolute top-2 start-2"
                    style={{
                        top: '8px',
                        left: '8px',
                        fontSize: '0.65rem',
                        padding: '2px 8px'}}
                >
                    {"#работа"}
                </button>
                {/* Кнопки */}
                <div className="d-flex gap-3 mt-4 justify-content-end">
                    <button 
                        className="btn-close position-absolute top-0 end-0 mt-3 me-4"
                        aria-label="Close"
                    ></button>
                    <Button variant="info d-inline-flex focus-ring focus-ring-info py-1 px-2 text-decoration-none border rounded-2" size="sm">
                        Редактировать
                    </Button>
                    <Button variant="secondary  d-inline-flex focus-ring focus-ring-secondary py-1 px-2 text-decoration-none border rounded-2" size="sm">
                        Детали
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Task;