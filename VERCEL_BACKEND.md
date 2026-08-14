# Deploying the FastAPI backend on Vercel

The repository root is configured as a Vercel FastAPI project. `app.py` exposes
`backend/main.py` as the serverless entrypoint, while the React frontend remains
a separate project rooted at `frontend/`.

## Important platform constraints

- The TensorFlow runtime and bundled Keras models make this function larger than
  Vercel's standard 500 MB Python bundle. Enable Vercel Large Functions by
  setting `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` in the project environment.
- Vercel Functions have a read-only filesystem. Uploads and generated PDFs use
  `/tmp`, which is temporary and can disappear between requests. PostgreSQL and
  Redis remain persistent because they are external services. To retain uploaded
  images reliably, connect object storage such as Vercel Blob or S3.
- A function request or response is limited to 4.5 MB. Keep each complete batch
  upload below that limit or upload images directly to object storage first.
- TensorFlow cold starts can be slow. The function is configured for a maximum
  duration of 300 seconds and loads the shared crack model only once per warm
  function instance.

## Create the Vercel project

1. In Vercel, import this Git repository.
2. Set **Root Directory** to the repository root (`.`), not `backend/`.
3. Leave Framework Preset, Build Command, and Output Directory on automatic/default.
4. Add all variables from `backend/.env.example` under **Settings → Environment Variables**.
5. Deploy.

The essential variables are:

- `DATABASE_URL`: externally hosted PostgreSQL connection URL, with TLS enabled
  when required by the provider.
- `REDIS_URL`: externally hosted Redis URL (for example, an Upstash Redis URL).
- `SECRET_KEY`: generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"`.
- `ALGORITHM=HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES=60`
- `COOKIE_SECURE=true`
- `CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app`
- `FRONTEND_URL=https://YOUR-FRONTEND.vercel.app`
- `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`

Email verification additionally needs `BREVO_API_KEY` and `EMAIL_FROM`. Google
login needs `GOOGLE_CLIENT_ID`.

## Verify the deployment

Open these URLs after deployment:

- `https://YOUR-BACKEND.vercel.app/`
- `https://YOUR-BACKEND.vercel.app/docs`

The root endpoint should return:

```json
{"message":"Welcome to the Image Classification API!"}
```

Then set the frontend project's environment variable and redeploy it:

```text
VITE_API_URL=https://YOUR-BACKEND.vercel.app
```

## CLI alternative

With Vercel CLI 48.1.8 or newer:

```bash
vercel link
vercel env add DATABASE_URL
# Add the remaining variables from backend/.env.example in the same way.
vercel --prod
```

Do not commit `.env` or any production secret to Git.
