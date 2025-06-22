// import { asyncHandler } from "../middlewares/asyncHandler.middleware";
// import {
//   changeRoleSchema,
//   createWorkspaceSchema,
//   workspaceIdSchema,
// } from "../validation/workspace.validation";
// import { HTTPSTATUS } from "../config/http.config";
// import {
//   changeMemberRoleService,
//   createWorkspaceService,
//   deleteWorkspaceService,
//   getAllWorkspacesUserIsMemberService,
//   getWorkspaceAnalyticsService,
//   getWorkspaceByIdService,
//   getWorkspaceMembersService,
//   updateWorkspaceByIdService,
// } from "../services/workspace.service";
// import { getMemberRoleInWorkspace } from "../services/member.service";
// import { Permissions } from "../enums/role.enum";
// import { roleGuard } from "../utils/roleGuard";
// import { updateWorkspaceSchema } from "../validation/workspace.validation";

import { Permissions } from "../enums/role.enum.js";
import { getMemberRoleInWorkspace } from "../services/member.service.js";
import { changeMemberRoleService, createWorkspaceService, deleteWorkspaceService, getAllWorkspacesUserIsMemberService, getWorkspaceAnalyticsService, getWorkspaceByIdService, getWorkspaceMembersService, updateWorkspaceByIdService } from "../services/workspace.service.js";
import { roleGuard } from "../utils/roleGuard.js";




// Controller to create workspace
export const createWorkspaceController = async (req, res) => {
    const body = req.body;

    const userId = req.user?.id;
    const { workspace } = await createWorkspaceService(userId, body);

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  };





// Controller: Get all workspaces the user is part of
export const getAllWorkspacesUserIsMemberController = async (req, res) => {
    const userId = req.user?.id;

    const { workspaces } = await getAllWorkspacesUserIsMemberService(userId);

    return res.status(200).json({
      message: "User workspaces fetched successfully",
      workspaces,
    });
  }




// Controller to get workspace By ID
export const getWorkspaceByIdController = async (req, res) => {
    const workspaceId = req.params.id;
    const userId = req.user?.id;

    await getMemberRoleInWorkspace(userId, workspaceId);

    const { workspace } = await getWorkspaceByIdService(workspaceId);

    return res.status(200).json({
      message: "Workspace fetched successfully",
      workspace,
    });
  }




// Controller to get workspace
export const getWorkspaceMembersController = async (req, res) => {
    const workspaceId = req.params.id;
    const userId = req.user?.id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { members, roles } = await getWorkspaceMembersService(workspaceId);

    return res.status(200).json({
      message: "Workspace members retrieved successfully",
      members,
      roles,
    });
  }





// Controller to get the workspace analytics
export const getWorkspaceAnalyticsController = async (req, res) => {
    const workspaceId = req.params.id;
    const userId = req.user?.id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

    return res.status(200).json({
      message: "Workspace analytics retrieved successfully",
      analytics,
    });
  }




// Controller to change workpace member role
export const changeWorkspaceMemberRoleController = async (req, res) => {
  console.log("Welcome to the change workspace member role controller");
    const workspaceId = req.params.id;
    const { memberId, roleId } = req.body;
    console.log("This is the value of the workspaceId", workspaceId, req.params.id);
    console.log("This is the value of the memberId, roleId", req.body, memberId, roleId);

    const userId = req.user?.id;
    console.log("This is the value of the userId", userId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);
    console.log("This is the value of the role", role)

    const { member } = await changeMemberRoleService(
      workspaceId,
      memberId,
      roleId
    );
    console.log("This is the value of the member", member)

    return res.status(200).json({
      message: "Member Role changed successfully",
      member,
    });
  }





// Controller to update workspace by Id
export const updateWorkspaceByIdController = async (req, res) => {
    const workspaceId = req.params.id;
    const { name, description } = req.body;


    const userId = req.user?.id;
    

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_WORKSPACE]);

    const { workspace } = await updateWorkspaceByIdService(
      workspaceId,
      name,
      description
    );

    return res.status(200).json({
      message: "Workspace updated successfully",
      workspace,
    });
  }





// Controller to delete workspace
export const deleteWorkspaceByIdController = async (req, res) => {
    const workspaceId = req.params.id;

    const userId = req.user?.id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_WORKSPACE]);

    const { currentWorkspace } = await deleteWorkspaceService(
      workspaceId,
      userId
    );

    return res.status(200).json({
      message: "Workspace deleted successfully",
      currentWorkspace,
    });
  }
