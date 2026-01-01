# Pastebin Application

A pastebin service that allows users to create text pastes with optional time-based expiry (TTL) and view count limits. Built with Next.js, TypeScript, SQLite (local), and Vercel KV (production).

## Features

- Create pastes with arbitrary text content
- Share pastes via unique URLs
- Optional time-based expiry (TTL)
- Optional view count limits
- Safe HTML rendering (XSS protection)
- Deterministic time support for testing
- RESTful API endpoints

## Project Description

This is a full-stack pastebin application built with Next.js 14 (App Router) and TypeScript. It provides both a web UI and REST API for creating and viewing text pastes. Pastes can be configured with optional constraints:

- **TTL (Time To Live)**: Pastes expire after a specified number of seconds
- **Max Views**: Pastes become unavailable after being viewed a certain number of times

When either constraint is triggered, the paste becomes unavailable and returns a 404 error.

## Persistence Layer

The application automatically selects the appropriate storage backend based on environment variables:

**Local Development**: SQLite database using `better-sqlite3`

- Used when Postgres environment variables are not set
- Database file stored in the `data/` directory
- Automatically initialized on first run

**Production Deployment (Vercel/Serverless)**: Vercel Postgres (Neon)

- Automatically used when `POSTGRES_URL` (or `POSTGRES_PRISMA_URL` or `POSTGRES_URL_NON_POOLING`) environment variable is set
- No code changes needed - the database layer automatically switches to Postgres
- Perfect for serverless environments like Vercel
- Uses Neon Postgres through Vercel Marketplace

The implementation in `lib/db.ts` supports both backends seamlessly, so the same code works in both local development and production.

## Running Locally

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd paste
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically create the SQLite database in the `data/` directory on first run.

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

```
GET /api/healthz
```

Returns the health status of the application.

**Response:**
```json
{ "ok": true }
```

### Create Paste

```
POST /api/pastes
```

**Request Body:**
```json
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```

- `content` (required): Non-empty string
- `ttl_seconds` (optional): Integer >= 1
- `max_views` (optional): Integer >= 1

**Response:**
```json
{
  "id": "string",
  "url": "https://your-app.vercel.app/p/<id>"
}
```

### Get Paste (API)

```
GET /api/pastes/:id
```

**Response:**
```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

- `remaining_views` may be `null` if unlimited
- `expires_at` may be `null` if no TTL
- Each successful API fetch counts as a view

### View Paste (HTML)

```
GET /p/:id
```

Returns HTML page containing the paste content. Returns 404 if paste is unavailable.

## Testing Mode

For deterministic time-based testing, set the environment variable:

```
TEST_MODE=1
```

When enabled, the application will use the `x-test-now-ms` request header as the current time for expiry logic:

```
x-test-now-ms: 1704067200000
```

If the header is absent, real system time is used.

## Error Handling

- Invalid input returns 4xx status with JSON error body
- Unavailable pastes (expired, view limit exceeded, or not found) return 404
- All API responses return valid JSON with correct Content-Type

## Notable Decisions

1. **Dual Storage Backend**: The application automatically uses SQLite for local development and Vercel KV for production, with no code changes needed. The database layer detects which backend to use based on environment variables.

2. **View Counting**: Both API and HTML route accesses count toward view limits to prevent bypassing constraints.

3. **HTML Escaping**: All paste content is properly escaped to prevent XSS attacks.

4. **Type Safety**: Full TypeScript implementation for better code quality and maintainability.

5. **Next.js App Router**: Uses the modern Next.js 14 App Router for better performance and developer experience.

6. **No Hardcoded URLs**: All URLs are dynamically generated from request headers, making the app work seamlessly across different domains.

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts          # Health check endpoint
│   │   └── pastes/
│   │       ├── route.ts           # POST /api/pastes
│   │       └── [id]/
│   │           └── route.ts       # GET /api/pastes/:id
│   ├── p/
│   │   └── [id]/
│   │       ├── page.tsx           # GET /p/:id (HTML view)
│   │       └── not-found.tsx     # 404 page
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page (create paste UI)
├── lib/
│   └── db.ts                      # Database layer
├── data/                           # SQLite database (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Deployment

### Vercel

1. **Set up Vercel Postgres (Neon)**:
   - Go to your Vercel dashboard
   - Navigate to Storage → Create Database → Browse Marketplace
   - Select "Neon" (Serverless Postgres)
   - Create a new Postgres database
   - Vercel will automatically add the `POSTGRES_URL` environment variable to your project

2. **Deploy to Vercel**:
   - Push your code to GitHub
   - Import the project in Vercel (or use Vercel CLI: `vercel`)
   - The `POSTGRES_URL` environment variable will be automatically set when you connect Neon
   - Optionally add: `TEST_MODE=1` if you need testing mode
   - Deploy

The application will automatically use Postgres when the `POSTGRES_URL` environment variable is present. No code changes needed!

## License

MIT

