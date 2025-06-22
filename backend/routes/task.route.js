import { Router } from "express";
import { createTaskController, deleteTaskController, getAllTasksController, getTaskByIdController, updateTaskController } from "../controllers/task.controller.js";
import authentication from "../middlewares/authentication.js";





const taskRoutes = Router();





taskRoutes.post("/project/:projectId/workspace/:workspaceId/create", authentication, createTaskController);

taskRoutes.delete("/:id/workspace/:workspaceId/delete", authentication, deleteTaskController);

taskRoutes.put("/:id/project/:projectId/workspace/:workspaceId/update", authentication, updateTaskController);

taskRoutes.get("/workspace/:workspaceId/all", authentication, getAllTasksController);

taskRoutes.get("/:id/project/:projectId/workspace/:workspaceId", authentication, getTaskByIdController);

export default taskRoutes;
