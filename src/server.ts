import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import todoRoutes from "./routes/todos";

// Load environment variables
dotenv.config();

console.log('Starting server with environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || "*",
    "https://todo-railway-fe-production.up.railway.app",
    "https://todo-railway-be-production.up.railway.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (NODE_ENV !== "test") {
  app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  try {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      port: PORT
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Health check failed"
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Todo Railway Backend API 🚀",
    version: process.env.npm_package_version || "1.0.0",
    environment: NODE_ENV,
    endpoints: {
      auth: "/api/auth",
      todos: "/api/todos",
      health: "/health"
    }
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: NODE_ENV === "production" ? "Internal Server Error" : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`  - Auth: http://0.0.0.0:${PORT}/api/auth`);
  console.log(`  - Todos: http://0.0.0.0:${PORT}/api/todos`);
});

server.on('error', (error: any) => {
  console.error('Server error:', error);
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;
