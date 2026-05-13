import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext.jsx';
import ProjectBoard from '../models/ProjectBoard.jsx';

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

var id = 0;
function makeTask() { // testing only
    id++;

    return {
        id: id,
        title: `Текст оглавление ${id}`,
        description: `Тело текста ${id}`
    };
}

// (testing only)
const mockcolumns = [
    {
        id: 1,
        title: "To Do",
        tasks: [
            makeTask(),
            makeTask(),
        ]
    },
    {
        id: 2,
        title: "In Progress",
        tasks: Array(5).fill().map((_) => makeTask())
    },
    {
        id: 3,
        title: "On Review",
        tasks: [
            makeTask(),
        ]
    }
];

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

function FetchColumns(projectId, setCols) {
    if (projectId == 0 || projectId == 1)
        setCols(mockcolumns);
}

function Board() {

    const { projectId } = useParams();
    const [currentProject, setCurrentProject] = useProject();
    const [columns, setColumns] = useState(null);

    if (!projectId)
        return <Navigate to="/" replace />;

    useEffect(() => {
        if (!currentProject || currentProject.id != projectId)
            setCurrentProject(FetchProjectMeta(projectId))
    }, []);

    useEffect(() => FetchColumns(projectId, setColumns), [currentProject]);

    if (!columns)
        return <h1>Loading Project...</h1>
        
    return (
        <ProjectBoard
            name={currentProject ? currentProject.name : "unknown"}
            columns={columns} />

    );
}

export default Board;