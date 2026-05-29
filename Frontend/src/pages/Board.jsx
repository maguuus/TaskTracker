import React, { useState } from 'react';
import { Container, Button, Card } from 'react-bootstrap';

function ProjectBoard({ name }) {

    const [columns, setColumns] = useState([
        {
            id: 'todo',
            title: 'To Do',
            bgColor: '#FFEFA6',
            textColor: '#C6A911',
            items: [
                { id: 1, title: 'Text Heading', body: 'Body text' },
                { id: 2, title: 'Text Heading', body: 'Body text' },
                { id: 3, title: 'Text Heading', body: 'Body text' },
            ]
        },
        {
            id: 'inProgress',
            title: 'In Progress',
            bgColor: '#ECD2FF',
            textColor: '#24B624',
            items: [
                { id: 4, title: 'Text Heading', body: 'Body text' },
                { id: 5, title: 'Text Heading', body: 'Body text' },
                { id: 6, title: 'Text Heading', body: 'Body text' },
            ]
        },
        {
            id: 'done',
            title: 'Done',
            bgColor: '#FFD3D3',
            textColor: '#D24141',
            items: [
                { id: 7, title: 'Text Heading', body: 'Body text' },
                { id: 8, title: 'Text Heading', body: 'Body text' },
                { id: 9, title: 'Text Heading', body: 'Body text' },
            ]
        }
    ]);

    const handleDeleteTask = (columnId, taskId) => {
        setColumns(prevColumns =>
            prevColumns.map(col => {
                if (col.id === columnId) {
                    return { ...col, items: col.items.filter(item => item.id !== taskId) };
                }
                return col;
            })
        );
    };

    const handleAddTask = (columnId) => {
        const taskTitle = prompt("Введите название задачи:", "Новая задача");
        if (!taskTitle) return;

        setColumns(prevColumns =>
            prevColumns.map(col => {
                if (col.id === columnId) {
                    const newId = Date.now();
                    return {
                        ...col,
                        items: [...col.items, { id: newId, title: taskTitle, body: 'Body text' }]
                    };
                }
                return col;
            })
        );
    };

    const handleAddColumn = () => {
        const colTitle = prompt("Введите название новой колонки:");
        if (!colTitle) return;

        const colors = [
            { bg: '#E3F2FD', text: '#0D47A1' },
            { bg: '#E8F5E9', text: '#1B5E20' },
            { bg: '#FFF3E0', text: '#E65100' }
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newColumn = {
            id: `col-${Date.now()}`,
            title: colTitle,
            bgColor: randomColor.bg,
            textColor: randomColor.text,
            items: []
        };

        setColumns(prev => [...prev, newColumn]);
    };

    const handleDeleteColumn = (columnId) => {
        if (window.confirm("Удалить эту колонку вместе с задачами?")) {
            setColumns(prev => prev.filter(col => col.id !== columnId));
        }
    };

    return (
        <Container fluid className="py-5" style={{ backgroundColor: '#C1F0C4', minHeight: '100vh' }}>
            {/* Шапка*/}
            <div className="text-center mb-5">
                <h1 className="fw-bold mb-3" style={{ color: '#212121' }}>{name || "Проекты"}</h1>
                <Button 
                    variant="dark" 
                    className="rounded-pill px-4 shadow-sm" 
                    onClick={handleAddColumn}
                    style={{ backgroundColor: '#212121' }}
                >
                    + Добавить колонку
                </Button>
            </div>
            
            {/* Контейнер колонок */}
            <div className="d-flex flex-nowrap overflow-auto pb-3 px-3 justify-content-start align-items-start gap-4" style={{ minHeight: '75vh' }}>
                {columns.map(column => (
                    <div 
                        key={column.id} 
                        className="p-4 rounded-5 position-relative flex-shrink-0 flex-grow-0 shadow-sm" 
                        style={{ 
                            backgroundColor: column.bgColor, 
                            width: '320px', 
                            minHeight: '65vh' 
                        }}
                    >
                        {/* Кнопка удаления колонки */}
                        <button 
                            onClick={() => handleDeleteColumn(column.id)}
                            className="btn-close position-absolute top-0 end-0 m-3" 
                            style={{ fontSize: '0.75rem' }} 
                            aria-label="Delete Column"
                        ></button>

                        {/* Заголовок колонки  */}
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
                            <h3 className="fw-bold m-0" style={{ color: column.textColor }}>
                                {column.title} <span className="opacity-75" style={{ fontSize: '1.1rem' }}>({column.items.length})</span>
                            </h3>
                            {/*  кнопка Плюc */}
                            <Button 
                                variant="light"
                                className="rounded-circle d-flex align-items-center justify-content-center p-0 border shadow-sm"
                                onClick={() => handleAddTask(column.id)}
                                style={{ 
                                    width: '28px', 
                                    height: '28px', 
                                    fontSize: '1rem', 
                                    lineHeight: '0',
                                    color: column.textColor,
                                    backgroundColor: '#FFFFFF',
                                    fontWeight: 'bold'
                                }}
                            >
                                +
                            </Button>
                        </div>

                        {/* Список карточек задач */}
                        {column.items.map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                onDelete={() => handleDeleteTask(column.id, task.id)} 
                            />
                        ))}
                    </div>
                ))}
            </div>
        </Container>
    );
}

// Карточка без нижних кнопок
function TaskCard({ task, onDelete }) {
    return (
        <Card className="border-0 shadow-sm mb-3 rounded-3 position-relative" style={{ backgroundColor: '#FFFFFF' }}>
            <button 
                onClick={onDelete}
                className="btn-close position-absolute top-0 end-0 m-2" 
                style={{ fontSize: '0.65rem' }} 
                aria-label="Close"
            ></button>
            
            <Card.Body className="pt-3 pb-3 px-3">
                <Card.Title className="fs-6 fw-bold mb-1">{task.title}</Card.Title>
                {/* Отступ mb-3 заменен на mb-0, так как под текстом больше ничего нет */}
                <Card.Text className="text-muted small mb-0">{task.body}</Card.Text>
            </Card.Body>
        </Card>
    );
}

export default ProjectBoard;
