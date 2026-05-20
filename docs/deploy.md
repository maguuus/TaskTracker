# Развёртывание

Все сервисы (БД, бэкенд, фронтенд) собираются единым `docker-compose up`. При необходимости каждый сервис можно вынести в отдельное окружение — для этого достаточно указать нужные адреса в `.env`.

---

## Docker Compose

```bash
cp .env.example .env
# заполнить .env своими значениями
docker-compose up -d
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5124`
- Swagger: `http://localhost:5124/swagger`

---

## Раздельное развёртывание

Если сервисы работают на разных хостах или портах, укажите в `.env` нужные значения — конфиг сборки подставит их в адреса для связи между сервисами.

Пример — все три компонента на разных серверах:

```env
POSTGRES_HOST=db.example.com
BACKEND_HOST=api.example.com
FRONTEND_HOST=app.example.com
```

Запуск одного модуля:

```bash
docker-compose up -d postgres-db
docker-compose up -d backend
docker-compose up -d frontend
```

---

## Локальная разработка

Удобно при работе с конкретным сервисом без пересборки образов.

**База данных**

```bash
docker-compose up -d postgres-db
```

**Бэкенд**

```bash
cd Backend
dotnet run
# http://localhost:5124
```

**Фронтенд**

```bash
cd Frontend
npm install
npm run dev
# http://localhost:5173
```

---

## Переменные окружения

Файл `.env` создаётся из `.env.example`.

### Обязательные

| Переменная | Описание |
|---|---|
| `POSTGRES_USER` | Пользователь БД |
| `POSTGRES_PASSWORD` | Пароль БД |
| `POSTGRES_DB` | Название базы данных |

### Дополнительные

Задаются только при необходимости переопределить значения из конфига сборки.

| Переменная | Описание |
|---|---|
| `POSTGRES_HOST` | Хост PostgreSQL |
| `POSTGRES_PORT` | Порт PostgreSQL |
| `BACKEND_HOST` | Хост бэкенда (используется фронтендом для запросов к API) |
| `BACKEND_PORT` | Порт бэкенда |
| `FRONTEND_HOST` | Хост фронтенда (используется бэкендом для CORS) |
| `FRONTEND_PORT` | Порт фронтенда |
