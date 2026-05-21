import { Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDBProjectMeta } from '../DataBaseHook';

function ProjectCard({ project, onChoose, onDelete, onUpdate, disabled }) {

    const [getMetas, post, patch, remove] = useDBProjectMeta();

    const [editMode, setEditMode] = useState(false);

    const [header, setHeader] = useState(project.header);
    const [bodyText, setBodyText] = useState(project.bodyText);

    const toggleEditOn = () => setEditMode(true);
    const toggleEditOff = async () => {
        const newPorject = { ...project, header: header, bodyText: bodyText };
        await onUpdate(newProject);
        setEditMode(false);
    }

    return (
        <Col md={4} className="mb-4">
            <Card style={{ height: '100%' }}>
                <Card.Header>
                    <div className="d-flex align-items-center mb-2">
                        <span style={{ fontSize: '1.8rem', marginRight: '0.8rem' }}>
                            {icon}
                        </span>
                        {editMode ?
                            <form>
                                <label>
                                    <input type="text" value={header} onChange={e => setHeader(e.target.value)} />
                                </label>
                            </form>
                            :
                            <h4>{header}</h4>
                        }
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
                        {editMode ?
                            <form>
                                <label>
                                    <input type="text" value={bodyText || ""} onChange={e => setBodyText(e.target.value)} />
                                </label>
                            </form>
                            : bodyText || ""
                        }
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
        </Col >
    )
}

export default ProjectCard;