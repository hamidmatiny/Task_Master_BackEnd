# Task Master

A production-ready FastAPI REST API with PostgreSQL, Docker, and GitHub Actions. This project includes:

- Task management endpoint CRUD operations
- Analytics summary endpoint
- ETL pipeline endpoints for sample data loading and payload import
- Docker Compose development and PostgreSQL service
- GitHub Actions CI pipeline for tests and Docker build

## Quick start

1. Copy environment example:

   ```bash
   cp .env.example .env
   ```

2. Start services with Docker Compose:

   ```bash
   docker compose up --build
   ```

3. Open API docs:

   - http://localhost:8000/docs

## API Endpoints

- `GET /health/`
- `GET /tasks/`
- `POST /tasks/`
- `GET /tasks/{task_id}`
- `PATCH /tasks/{task_id}`
- `DELETE /tasks/{task_id}`
- `GET /analytics/summary`
- `POST /etl/load-sample`
- `POST /etl/import`

## Development

Install backend dependencies locally:

```bash
python -m pip install -r requirements.txt
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Run backend locally:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run frontend locally:

```bash
cd frontend
npm run dev
```

## Docker

The `docker-compose.yml` service definitions include:

- `db` — PostgreSQL 15
- `web` — FastAPI app with integrated frontend UI

Start the app stack with:

```bash
docker compose up --build
```

Open the application at:

- Full app: http://localhost:8000
- API docs: http://localhost:8000/docs

## CI/CD

GitHub Actions are configured in `.github/workflows/ci.yml` to:

- install dependencies
- spin up PostgreSQL
- run tests
- build the Docker image
