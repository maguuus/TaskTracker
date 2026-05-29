import React from 'react';
import { Card, Button } from 'react-bootstrap';

function ProjectCard({ project, onChoose, onDelete, onUpdate }) {
    const headerText = project.header || "Header";
    const subheadText = project.subhead || "Subhead";
    const titleText = project.name || "Title";
    const subtitleText = project.subtitle || "Subtitle";
    const bodyText = project.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.";
    const avatarLetter = titleText.charAt(0).toUpperCase() || "A";
    const handleEdit = (e) => {
        e.stopPropagation();
        const newName = prompt("Введите новое название проекта:", project.name);
        if (!newName) return;
        const newDesc = prompt("Введите новое описание проекта:", project.description);
        
        onUpdate({
            ...project,
            name: newName,
            description: newDesc || project.description
        });
    };

    return (
        <Card 
            className="border-0 shadow-sm w-100 rounded-4 overflow-hidden position-relative" 
            style={{ backgroundColor: '#FFFFFF', maxWidth: '280px' }}
        >
            {/* Кнопка удаления карточки*/}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Удалить этот проект?")) onDelete();
                }}
                className="btn-close position-absolute top-0 end-0 m-3" 
                style={{ fontSize: '0.65rem', zIndex: 10 }} 
                aria-label="Delete project"
            ></button>

            {/* 1. Шапка карточки*/}
            <div className="d-flex align-items-center p-3 pb-2">
                <div 
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold me-2 flex-shrink-0"
                    style={{ backgroundColor: '#EBE4FA', color: '#5E17EB', width: '32px', height: '32px', fontSize: '0.8rem' }}
                >
                    {avatarLetter}
                </div>
                <div className="lh-sm overflow-hidden">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.75rem' }}>{headerText}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: '0.65rem' }}>{subheadText}</div>
                </div>
            </div>

            
            <div 
                className="d-flex align-items-center justify-content-center border-0 mx-0"
                style={{ backgroundColor: '#EBEBEB', height: '140px' }}
            >
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://w3.org" className="opacity-25">
                    <path d="M50 15L75 55H25L50 15Z" fill="#707070" />
                    <rect x="52" y="48" width="24" height="24" rx="4" fill="#707070" />
                    <path d="M36 68C36 74.6274 30.6274 80 24 80C17.3726 80 12 74.6274 12 68C12 61.3726 17.3726 56 24 56C30.6274 56 36 61.3726 36 68Z" fill="#707070" />
                </svg>
            </div>

            {/* 3. блок описания проекта */}
            <Card.Body className="p-3 d-flex flex-column">
                <Card.Title className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                    {titleText}
                </Card.Title>
                <div className="text-muted mb-2 fw-medium text-truncate" style={{ fontSize: '0.7rem' }}>
                    {subtitleText}
                </div>
                <Card.Text className="text-muted mb-3 text-wrap text-start" style={{ fontSize: '0.75rem', lineHeight: '1.3', height: '50px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {bodyText}
                </Card.Text>

                {/* 4. Кнопки управления */}
                <div className="d-flex justify-content-end gap-2 mt-auto pt-2">
                    {/* Кнопка Редактировать  */}
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        className="rounded-pill px-3 border text-muted fw-medium"
                        style={{ fontSize: '0.7rem', borderColor: '#D3D3D3' }}
                        onClick={handleEdit}
                    >
                        Редактировать
                    </Button>
                    
                    {/* Кнопка открытия доски*/}
                    <Button 
                        variant="dark" 
                        size="sm"
                        className="rounded-pill px-3 border-0 text-white fw-medium"
                        style={{ backgroundColor: '#5E17EB', fontSize: '0.7rem' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChoose();
                        }}
                    >
                        Посмотреть доску
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}

export default ProjectCard;
