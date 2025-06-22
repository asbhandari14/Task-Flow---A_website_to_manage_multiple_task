import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  deleteWorkspaceByIdController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMembersController,
  updateWorkspaceByIdController,
} from "../controllers/workspace.controller.js";
import authentication from "../middlewares/authentication.js";

const workspaceRoutes = Router();

workspaceRoutes.post("/create/new", authentication, createWorkspaceController);
workspaceRoutes.put("/update/:id", authentication, updateWorkspaceByIdController);

workspaceRoutes.put("/change/member/role/:id", authentication, changeWorkspaceMemberRoleController);

workspaceRoutes.delete("/delete/:id", authentication, deleteWorkspaceByIdController);

workspaceRoutes.get("/all", authentication, getAllWorkspacesUserIsMemberController);

workspaceRoutes.get("/members/:id", authentication, getWorkspaceMembersController);
workspaceRoutes.get("/analytics/:id", authentication, getWorkspaceAnalyticsController);

workspaceRoutes.get("/:id", authentication, getWorkspaceByIdController);

export default workspaceRoutes;