// @ts-check
import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react'
import useProject from '../context/ProjectContext.jsx';
import ProjectBoard from '../models/ProjectBoard.jsx';

function Board() {

    const { projectId } = useParams();

    const [currentProject, ] = useProject();

    if (!projectId)
        return <Navigate to="/" replace />;

    useEffect(() => {
        if (currentProject?.id !== projectId)
            throw new Error("Should be same id's");
    }, []);

    if (currentProject?.id !== projectId)
        return <h1>Loading Project Meta...</h1>

    return (
        <ProjectBoard
            name={currentProject ? currentProject.name : "unknown"}
            id={projectId} />
    );
}

export default Board;
