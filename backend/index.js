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

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, // should be: https://task-flow-a-website-to-manage-multi-phi.vercel.app
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin); // Add this for debugging
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is working!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workspace", workspaceRoutes);

app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${PORT}`);
});
