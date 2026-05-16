import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext.jsx';
import ProjectBoard from '../models/ProjectBoard.jsx';
import { BoardProvider } from '../context/BoardContext.jsx';

import api from '../api/index.js'

// const [responseMsg, setResponseMsg] = useState('');
// async function LoadProject(id) {
//     try {
//         const response = await api.get(`/projects/${id}`);
//         return reponse.data;
//     }
//     catch (error) {
//         return {}
//     }
// }

function FetchProjectMeta(projectId) {
    return ({
        id: projectId,
        name: `Project ${projectId}`,
        icon: '📁',
        header: 'Head1',
        subhead: 'Субголова',
        imageAlt: 'Портрет  проекта',
        title: 'Титул',
        subtitle: 'Субтитул',
        bodyText: 'Лорем ипсум долор сит амет, консектетур адиписцинг элит, сед ду элисмод темпор.',
    });
}



function Board() {

    const { projectId } = useParams();
    const [currentProject, setCurrentProject] = useProject();

    if (!projectId)
        return <Navigate to="/" replace />;

    useEffect(() => {
        if (currentProject?.id !== projectId)
            setCurrentProject(FetchProjectMeta(projectId))
    }, []);

    if (currentProject?.id !== projectId)
        return <h1>Loading Project Meta...</h1>

    return (
        <BoardProvider>
            <ProjectBoard
                name={currentProject ? currentProject.name : "unknown"}
                id={projectId} />
        </BoardProvider>
    );
}

export default Board;
