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

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  })
);

// ✅ Allow preflight globally
app.options("*", cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




app.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    error: false,
    data: "Welcome to the backend server"
  })
})


app.use("/api/auth", authRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workspace", workspaceRoutes);




app.listen(process.env.PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${PORT}`);
})