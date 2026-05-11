import { Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ProjectCard({ project, onClick }) {

    const { icon, header, subhead, imageAlt, title, subtitle, bodyText } = project;

    return (
        <Col md={4} className="mb-4">
            <Card style={{ height: '100%' }}>

                <Card.Header>
                    <div className="d-flex align-items-center mb-2">
                        <span style={{ fontSize: '1.8rem', marginRight: '0.8rem' }}>
                            {icon}
                        </span>
                        <h4 className="mb-0">{header}</h4>
                    </div>

                    <h6 className="text-muted mb-3">{subhead}</h6>

                </Card.Header>

                <Card.Img
                    variant="top"
                    src=""
                    alt={imageAlt}
                    style={{ marginBottom: '1rem' }}
                />

                <Card.Body>
                    <Card.Title>{title}</Card.Title>

                    <Card.Subtitle className="mb-2 text-muted">
                        {subtitle}
                    </Card.Subtitle>

                    <Card.Text>{bodyText}</Card.Text>

                    <div className="d-flex justify-content-between mt-3">

                    </div>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-end gap-3">
                    <Button variant="light border">Вторичная</Button>
                    <Button variant="primary"
                        onClick={onClick}>
                        Изначальная
                    </Button>
                </Card.Footer>

            </Card>
        </Col >
    )
}

export default ProjectCard;