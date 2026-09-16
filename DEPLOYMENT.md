# Deployment

1. Copy `server/.env.example` values into your deployment secret store. Set a long, unique `JWT_SECRET`; add MongoDB, Groq, and optional Adzuna credentials.
2. Set `VITE_API_URL` to the public HTTPS URL of the backend API (without `/api`).
3. Build and run locally with `docker compose up --build`.
4. Open `http://localhost:8080`; the API is exposed at `http://localhost:5000`.

For hosted deployment, deploy the `server` container with persistent storage mounted at `/app/uploads`, provision MongoDB, and build the `client` container with `VITE_API_URL` set to the server's public URL. Set `CLIENT_URL` on the server to the client’s public URL.
