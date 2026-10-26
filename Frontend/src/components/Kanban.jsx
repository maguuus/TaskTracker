import { Col, Row } from 'react-bootstrap';
import Column from '../models/Column';

function Kanban({ columns, onColumnUpdate, onColumnDelete }) {
    return (
        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem', marginTop: '1rem' }}>
            <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }} className="justify-content-start align-items-stretch">
                {columns.map(column => (
                    <Col key={column.id} style={{ minWidth: '410px', width: '410px', flexGrow: 0 }} className="me-2 h-100">
                        <Column
                            column={column}
                            onColumnUpdate={onColumnUpdate}
                            onColumnDelete={() => onColumnDelete(column)}
                        />
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default Kanban;
