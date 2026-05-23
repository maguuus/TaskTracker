# TaskTracker

Веб-приложение для управления задачами в команде. Канбан-доски, колонки, карточки задач, совместный доступ.

## Документация

- [Описание продукта](docs/product.md)
- [Развёртывание](docs/deploy.md)
- [Бэкенд](docs/backend/README.md)
- [Фронтенд](docs/frontend/README.md)

## Быстрый старт

```bash
cp .env.example .env
# заполнить .env своими значениями
docker-compose up -d
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5124`
- Swagger: `http://localhost:5124/swagger`

Подробнее о способах запуска и дополнительных настройках окружения — в [документации по развёртыванию](docs/deploy.md).

## Стек

| Слой | Технологии |
|---|---|
| Фронтенд | React 19, Vite, Bootstrap 5, React Router v7 |
| Бэкенд | ASP.NET Core 10, C# |
| База данных | PostgreSQL 15 |
| Инфраструктура | Docker Compose |
