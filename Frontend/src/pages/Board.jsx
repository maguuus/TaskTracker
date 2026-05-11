import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Navigate, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext.jsx';
import ProjectBoard from '../models/ProjectBoard.jsx';

export function Board() {

    const { projectName } = useParams();
    const { currentProject } = useProject();

    if (!currentProject && !projectName)
        return <Navigate to="/" replace />;
    if (!projectName)
        return <Navigate to={`/${currentProject.header}/board/`} replace />;


    let id = 0;
    function makeTask() { // testing only
        id++;

        return {
            id: id,
            title: `Текст оглавление ${id}`,
            description: `Тело текста ${id}`
        };
    }

    // Данные колонок и карточек (testing only)
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

    return <ProjectBoard name={projectName} columns={columns} />;
}

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