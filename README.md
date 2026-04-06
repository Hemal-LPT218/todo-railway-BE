# Todo Railway Backend

A production-ready Node.js/Express backend built with TypeScript for the Todo application.

## Features

- ✅ TypeScript support
- ✅ Production-ready Express server
- ✅ Environment variable configuration
- ✅ Security middleware (Helmet, CORS)
- ✅ Compression middleware
- ✅ Request logging (Morgan)
- ✅ Health check endpoint
- ✅ Docker support
- ✅ Graceful shutdown
- ✅ Error handling

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=production
# Add other environment variables as needed
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run start:prod` - Start production server with NODE_ENV=production
- `npm run clean` - Remove dist folder
- `npm run railway:build` - Build for Railway deployment
- `npm run railway:start` - Start command for Railway

## Railway Deployment

This project is configured for Railway deployment without Docker.

### Prerequisites

1. Push your code to a GitHub repository
2. Connect your GitHub account to Railway
3. Create a new project from your repository

### Environment Variables in Railway

Set these environment variables in your Railway project settings:

```env
NODE_ENV=production
PORT=3000
```

### Deployment Process

Railway will automatically:
1. Install dependencies using `npm ci`
2. Build the TypeScript project using `npm run build`
3. Start the application using `npm start`
4. Monitor health at `/health` endpoint

### Railway Configuration Files

- `railway.toml` - Railway deployment configuration
- `nixpacks.toml` - Build configuration for Railway

## Docker Deployment (Local Development Only)

The Docker configuration is provided for local development testing only.

### Using Docker Compose

```bash
docker-compose up -d
```

### Using Docker directly

```bash
# Build image
docker build -t todo-railway-be .

# Run container
docker run -p 3000:3000 todo-railway-be
```

## API Endpoints

- `GET /` - Root endpoint with API info
- `GET /health` - Health check endpoint

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

## Project Structure

```
todo-railway-BE/
├── src/
│   ├── index.ts        # Entry point
│   ├── server.ts       # Express server setup
│   └── healthcheck.ts  # Health check utility
├── dist/               # Compiled JavaScript
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore file
├── .dockerignore       # Docker ignore file (for local dev)
├── Dockerfile          # Docker configuration (for local dev)
├── docker-compose.yml  # Docker Compose (for local dev)
├── railway.toml        # Railway deployment configuration
├── nixpacks.toml       # Railway build configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Request body size limits
- Input sanitization
- Error handling (detailed in development, generic in production)

## Performance Features

- Response compression
- Request logging
- Health checks
- Graceful shutdown
- Non-root Docker user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License
