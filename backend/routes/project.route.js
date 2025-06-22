import { Router } from "express";
import {
  createProjectController,
  deleteProjectController,
  getAllProjectsInWorkspaceController,
  getProjectAnalyticsController,
  getProjectByIdAndWorkspaceIdController,
  updateProjectController,
} from "../controllers/project.controller.js";
import authentication from "../middlewares/authentication.js";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create", authentication, createProjectController);

projectRoutes.put("/:id/workspace/:workspaceId/update", authentication, updateProjectController);

projectRoutes.delete("/:id/workspace/:workspaceId/delete",authentication, deleteProjectController);

projectRoutes.get("/workspace/:workspaceId/all", authentication, getAllProjectsInWorkspaceController);

projectRoutes.get("/:id/workspace/:workspaceId/analytics", authentication, getProjectAnalyticsController);

projectRoutes.get("/:id/workspace/:workspaceId", authentication, getProjectByIdAndWorkspaceIdController);

export default projectRoutes;
