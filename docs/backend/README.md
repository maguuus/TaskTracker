# Бэкенд — Техническая документация

## Стек

| Компонент | Версия |
|---|---|
| Платформа | .NET 10|
| Язык | C# |
| Фреймворк | ASP.NET Core (Minimal API) |
| База данных | PostgreSQL 15 |
| Документация API | Swagger / OpenAPI (Swashbuckle) |

---

## Структура проекта

```
Backend/
├── Program.cs                    # Точка входа, регистрация сервисов и маршрутов
├── Backend.csproj                # Описание проекта и зависимости
├── appsettings.json              # Конфигурация (production)
├── appsettings.Development.json  # Конфигурация (development)
├── Backend.http                  # Примеры HTTP-запросов для ручного тестирования
├── Data/
│   └── AppDbContext.cs           # EF Core контекст БД
├── Models/
│   ├── User.cs
│   ├── Project.cs
│   ├── Column.cs
│   └── TaskItem.cs
├── Migrations/                   # Миграции EF Core (автогенерация)
└── Properties/
    └── launchSettings.json       # Профили запуска (порты, окружение)
```

---

## Конфигурация

### Переменные окружения (`.env`)

Используются контейнером PostgreSQL через `docker-compose`. Создаются копированием `.env.example`:

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=TaskTrackerDb
```

### Порты (локальная разработка)

| Профиль | URL |
|---|---|
| HTTP | `http://localhost:5124` |
| HTTPS | `https://localhost:7258` |

---

## Запуск

### База данных через Docker

```bash
cp .env.example .env
# заполнить .env своими значениями
docker-compose up -d
```

### Бэкенд

```bash
cd Backend
dotnet run
```

Swagger UI доступен по адресу: `http://localhost:5124/swagger`

---

## API

Текущее состояние: заготовка. Единственный маршрут:

```
GET /   → "API is running"
```

Swagger UI автоматически отражает все зарегистрированные эндпоинты.

---

## Зависимости (NuGet)

| Пакет | Назначение |
|---|---|
| `Microsoft.AspNetCore.OpenApi` | Генерация OpenAPI-схемы |
| `Swashbuckle.AspNetCore` | Swagger UI |
| `Microsoft.EntityFrameworkCore` | ORM |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | Провайдер PostgreSQL для EF Core |
| `DotNetEnv` | Загрузка переменных окружения из `.env` |

---

## База данных

Структура БД, описание таблиц и ER-диаграмма: [er-model.md](./er-model.md)
