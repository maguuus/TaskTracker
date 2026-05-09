import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';

export function Board() {
  // Данные для колонок и карточек
  const columns = [
    {
      id: 1,
      title: "Колонка 1",
      tasks: [
        { id: 1, title: "Задача 1", description: "Описание задачи 1" },
        { id: 2, title: "Задача 2", description: "Описание задачи 2" }
      ]
    },
    {
      id: 2,
      title: "Колонка 2",
      tasks: [
        { id: 3, title: "Задача 3", description: "Описание задачи 3" },
        { id: 4, title: "Задача 4", description: "Описание задачи 4" }
      ]
    },
    {
      id: 3,
      title: "Колонка 3",
      tasks: [
        { id: 5, title: "Задача 5", description: "Описание задачи 5" }
      ]
    }
  ];

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Проект: Kanban доска</h2>
      
      {/* Горизонтальный скролл для поддержки многих колонок */}
      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }}>
        <Row style={{ flexWrap: 'nowrap', minWidth: 'min-content' }}>
          {columns.map((column) => (
            <Col 
              key={column.id} 
              style={{ minWidth: '320px', width: '320px' }} 
              className="me-3"
            >
              {/* Колонка - занимает всю высоту */}
              <Card style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    {column.title}
                    <Badge bg="secondary" className="ms-2">
                      {column.tasks.length}
                    </Badge>
                  </h5>
                </Card.Header>
                
                {/* Область с карточками - вертикальный скролл внутри колонки */}
                <Card.Body style={{ overflowY: 'auto', padding: '0.75rem' }}>
                  {column.tasks.map((task) => (
                    <Card key={task.id} className="mb-3 shadow-sm">
                      <Card.Body>
                        <Card.Title className="h6">{task.title}</Card.Title>
                        <Card.Text className="small text-muted">
                          {task.description}
                        </Card.Text>
                        
                        {/* Кнопки с произвольными названиями */}
                        <div className="d-flex gap-2 mt-2">
                          <Button variant="outline-primary" size="sm">
                            Редактировать
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            Удалить
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            Детали
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          ))}
          
          {/* Заглушка для добавления новых колонок в будущем */}
          <Col style={{ minWidth: '320px', width: '320px' }} className="opacity-50">
            <Card style={{ height: 'calc(100vh - 150px)' }} className="border-dashed">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <Button variant="outline-secondary">+ Добавить колонку</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}