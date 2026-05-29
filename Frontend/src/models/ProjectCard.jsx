import { Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDBProjectMeta } from '../DataBaseHook';

function ProjectCard({ project, onChoose, onDelete, onUpdate, disabled }) {

    const [getMetas, post, patch, remove] = useDBProjectMeta();

    const [editMode, setEditMode] = useState(false);

    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);

    async function onToggleEdit() {
        if (editMode) {
            const newProject = { ...project, name: name, description: description };
            await onUpdate(newProject);
            setEditMode(false);
            return;
        }

        setEditMode(true)
    }

    return (
        <Col md={4} className="mb-4">
            <Card style={{ height: '100%' }}>
                <Card.Header>
                    <div className="d-flex align-items-center mb-2">
                        <span style={{ fontSize: '1.8rem', marginRight: '0.8rem' }}>
                            {project.icon || "noIcon"}
                        </span>
                        {editMode ?
                            <form>
                                <label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                                </label>
                            </form>
                            :
                            <h4>{name}</h4>
                        }
                    </div>

                    <h6 className="text-muted mb-3">{project.subhead || ""}</h6>

                </Card.Header>

                <Card.Img
                    variant="top"
                    src={null}
                    alt={project.imageAlt || null}
                    style={{ marginBottom: '1rem' }}
                />

                <Card.Body>
                    <Card.Title>{project.title || ""}</Card.Title>

                    <Card.Subtitle className="mb-2 text-muted">
                        {project.subtitle || ""}
                    </Card.Subtitle>

                    <Card.Text as="div">
                        {editMode ?
                            <form>
                                <label>
                                    <input type="text" value={description || ""} onChange={e => setDescription(e.target.value)} />
                                </label>
                            </form>
                            : description || ""
                        }
                    </Card.Text>

                    <div className="d-flex justify-content-between mt-3">

                    </div>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-end gap-3">
                    <Button variant="danger" onClick={onDelete}>Удалить</Button>
                    <Button variant="light" onClick={onToggleEdit}>Изменить</Button>
                    <Button variant="primary" onClick={onChoose}>Перейти</Button>
                </Card.Footer>

            </Card>
        </Col >
    )
}

export default ProjectCard;