import { Container, Row, Col } from 'react-bootstrap';
import Column from './Column';

function ProjectBoard({ name, columns, ...rest }) {
    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4">Проект <mark>{name}</mark>:</h2>

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
                <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }}>
                    {columns.map((column) =>
                        <Col key={column.id} style={{ minWidth: '350px', width: '350px' }} className="me-3">
                            <Column column={column} />
                        </Col>)}
                </Row>
            </div>
        </Container >
    );
}

export default ProjectBoard