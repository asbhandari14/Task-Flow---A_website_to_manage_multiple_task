import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from './database/db.config.js';
import cookieParser from 'cookie-parser';

dotenv.config();

import authRoutes from './routes/auth.route.js';
import memberRoutes from './routes/member.route.js';
import projectRoutes from './routes/project.route.js';
import taskRoutes from './routes/task.route.js';
import userRoutes from './routes/user.route.js';
import workspaceRoutes from './routes/workspace.route.js';

const PORT = process.env.PORT || 5000;
const app = express();

// ✅ Define allowed origins
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173"
];

// ✅ CORS middleware (must be BEFORE routes & body parser)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

// ✅ Handle preflight requests
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workspace", workspaceRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    error: false,
    data: "Welcome to the backend server"
  });
});

// ✅ Start server
app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${PORT}`);
  console.log("Allowed frontend origin:", process.env.FRONTEND_ORIGIN);
});
