import { Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ImmutableProjectCard({ project, onDelete, onEdit, onChoose }) {
    const { icon, header, subhead, imageAlt, title, subtitle, bodyText } = project;
    return (
        <Card style={{ height: '100%' }}>

            <Card.Header>
                <div className="d-flex align-items-center mb-2">
                    <span style={{ fontSize: '1.8rem', marginRight: '0.8rem' }}>
                        {icon}
                    </span>
                    <h4>{header}</h4>
                </div>

                <h6 className="text-muted mb-3">{subhead || ""}</h6>

            </Card.Header>


            <Card.Img
                variant="top"
                src=""
                alt={imageAlt || ""}
                style={{ marginBottom: '1rem' }}
            />

            <Card.Body>
                <Card.Title>{title || ""}</Card.Title>

                <Card.Subtitle className="mb-2 text-muted">
                    {subtitle || ""}
                </Card.Subtitle>

                <Card.Text>{bodyText || ""}</Card.Text>

                <div className="d-flex justify-content-between mt-3">

                </div>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-end gap-3">
                <Button variant="danger" onClick={onDelete}>Удалить</Button>
                <Button variant="light" onClick={onEdit}>Изменить</Button>
                <Button variant="primary" onClick={onChoose}>Перейти</Button>
            </Card.Footer>
        </Card>
    );
}

function MutableProjectCard({ project, setters, onDelete, onEdit, onChoose }) {
    const { icon, header, subhead, imageAlt, title, subtitle, bodyText } = project;

    return (
        <Card style={{ height: '100%' }}>

            <Card.Header>
                <div className="d-flex align-items-center mb-2">
                    <span style={{ fontSize: '1.8rem', marginRight: '0.8rem' }}>
                        {icon}
                    </span>
                    <form>
                        <label>
                            <input type="text" value={header} onChange={e => setters.setHeader(e.target.value)} />
                        </label>
                    </form>
                </div>

                <h6 className="text-muted mb-3">{subhead || ""}</h6>

            </Card.Header>

            <Card.Img
                variant="top"
                src=""
                alt={imageAlt || ""}
                style={{ marginBottom: '1rem' }}
            />

            <Card.Body>
                <Card.Title>{title || ""}</Card.Title>

                <Card.Subtitle className="mb-2 text-muted">
                    {subtitle || ""}
                </Card.Subtitle>

                <Card.Text>
                    <form>
                        <label>
                            <input type="text" value={bodyText || ""} onChange={e => setters.setBodyText(e.target.value)} />
                        </label>
                    </form>
                </Card.Text>

                <div className="d-flex justify-content-between mt-3">

                </div>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-end gap-3">
                <Button variant="danger" onClick={onDelete}>Удалить</Button>
                <Button variant="light" onClick={onEdit}>Изменить</Button>
                <Button variant="primary" onClick={onChoose}>Перейти</Button>
            </Card.Footer>

        </Card>
    );
}

function ProjectCard({ project, onChoose, onDelete, onUpdate }) {

    const [editMode, setEditMode] = useState(false);

    const [header, setHeader] = useState(project.header);
    const [bodyText, setBodyText] = useState(project.bodyText);

    const toggleEditOn = () => setEditMode(true);
    const toggleEditOff = () => {
        onUpdate({ ...project, header: header, bodyText: bodyText });
        setEditMode(false);
    }


    return (
        <Col md={4} className="mb-4">
            {
                editMode
                    ? <MutableProjectCard project={{ ...project, header: header, bodyText: bodyText }} setters={{ setHeader, setBodyText }} onChoose={onChoose} onDelete={onDelete} onEdit={toggleEditOff} />
                    : <ImmutableProjectCard project={{ ...project, header: header, bodyText: bodyText }} onChoose={onChoose} onDelete={onDelete} onEdit={toggleEditOn} />
            }
        </Col >
    )
}

export default ProjectCard;