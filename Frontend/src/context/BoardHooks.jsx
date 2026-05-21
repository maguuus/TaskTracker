import { useColumns } from './BoardContext';

export function useBoard() {
    const [columns, setColumns] = useColumns();

    function addColumn(newColumn) {
        setColumns(prev => [...prev, newColumn]
        );
    }

    function updateColumn(updatingColumn) {
        setColumns(prev => prev.map(c => c.id === updatingColumn.id ? updatingColumn : c)
        );
    }

    function removeColumn(removingColumn) {
        setColumns(prev => prev.filter(c => c.id !== removingColumn.id)
        );
    }

    return [addColumn, updateColumn, removeColumn];
}

export function useColumn(columnId) {
    const [columns, setColumns] = useColumns();
    const updateColumn = useBoard()[1];
    const columnToUpdate = () => columns.find(c => c.id === columnId);

    function addTask(newTask) {
        const column = columnToUpdate();
        updateColumn({ ...column, tasks: [...column.tasks, newTask] });
    }

    function updateTask(updatingTask) {
        const column = columnToUpdate();
        updateColumn(
            { ...column, tasks: column.tasks.map(t => t.id === updatingTask.id ? updatingTask : t) }
        );
    }

    function removeTask(removingTask) {
        const column = columnToUpdate();
        updateColumn(
            { ...column, tasks: column.tasks.filter(t => t.id !== removingTask.id) }
        );
    }

    return [addTask, updateTask, removeTask];
}

