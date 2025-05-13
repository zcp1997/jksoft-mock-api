# JKSoft Mock API

A flexible and powerful mock API platform that allows you to create, manage, and test API endpoints without writing backend code.

## Features

- **Create Mock APIs**: Define custom endpoints with various HTTP methods
- **Project Organization**: Group related mock APIs into projects
- **URL Routing**: Each project has a unique URL suffix
- **Request Logging**: Monitor incoming requests to your mock APIs
- **Custom Responses**: Define JSON responses with custom status codes

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, Supabase

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account (for database)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/zcp1997/jksoft-mock-api.git
cd jksoft-mock-api
```

2. Install dependencies:

```bash
pnpm install
```

1. Create `.env` file in the directory with the following:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### Development

Run the development server:

```bash
pnpm dev
```

This will start both the frontend (port 8008) and backend (port 3001) in development mode.

### Production

Build and start the application:

```bash
pnpm build
pnpm start
```

## Project Structure

- `/frontend` - Next.js application
- `/backend` - Express API server

## License

MIT 