# TaskTracker

Веб-приложение для управления задачами в команде. Канбан-доски, колонки, карточки задач, совместный доступ.

## Документация

- [Описание продукта](docs/product.md)
- [Бэкенд](docs/backend/README.md)
- [Фронтенд](docs/frontend/README.md)

## Быстрый старт

**1. База данных**

```bash
cp .env.example .env
# заполнить .env своими значениями
docker-compose up -d
```

**2. Бэкенд**

```bash
cd Backend
dotnet run
# API: http://localhost:5124
# Swagger: http://localhost:5124/swagger
```

**3. Фронтенд**

```bash
cd Frontend
npm install
npm run dev
# http://localhost:5173
```

## Стек

| Слой | Технологии |
|---|---|
| Фронтенд | React 19, Vite, Bootstrap 5, React Router v7 |
| Бэкенд | ASP.NET Core 9, C# |
| База данных | PostgreSQL 15 |
| Инфраструктура | Docker Compose |
