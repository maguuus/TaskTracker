import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Navigate, useParams } from 'react-router-dom';
import { useState, useTransition } from 'react'
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
const columns = [
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

}

function FetchColumns(projectId) {
    const [currentProject, setCurrentProject] = useProject();
    if (currentProject != projectId)
        setCurrentProject(FetchProjectMeta(projectId));

    if (projectId == 0 || projectId == 1)
        return columns;

    return
}

function Board() {

    const { projectId } = useParams();
    const [currentProject, setCurrentProject] = useProject();

    if (!currentProject && !projectId)
        return <Navigate to="/" replace />;
    if (!projectId)
        return <Navigate to={`/${currentProject.id}/board/`} replace />;

    const name = currentProject ? currentProject.name : "unknown";





    return <ProjectBoard name={name} columns={columns} />;
}

export default Board;

/* 
const project: Project = {
    id: 1,
    name: "" ///
    owner: {user}
    createdAt: {time}
    columns: List<Column>: [] ///
    }

const column: Column = {
    id: 1,
    title: "", ///
    tasks: List<Task>: [] ///
    }

const task: Task = {
    id: = 1,
    title: "", ///
    description: "", ///
    }
*/