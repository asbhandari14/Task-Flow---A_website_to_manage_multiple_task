import { Permissions } from "../enums/role.enum.js";
import MemberModel from "../models/member.model.js";
import ProjectModel from "../models/project.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import { getMemberRoleInWorkspace } from "../services/member.service.js";
import { createProjectService, deleteProjectService, getProjectAnalyticsService, getProjectByIdAndWorkspaceIdService, getProjectsInWorkspaceService, updateProjectService } from "../services/project.service.js";
import { roleGuard } from "../utils/roleGuard.js";





// Controller to create Project
export const createProjectController =
  async (req, res) => {

    // Taking the emoji name and description from the user
    const body = req.body;


    // Validate whether all the emoji, name, and description is present and they are of type string
    if (typeof body?.emoji !== 'string' || typeof body?.name !== 'string' || typeof body?.description !== 'string') {
      if (!body?.emoji || !body?.name || !body?.description) {
        return res.status(400).json({
          message: "Emoji, name, and description are required",
        });
      }
    }


    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id;


    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_PROJECT]);


    const { project } = await createProjectService(userId, workspaceId, body);


    return res.status(201).json({
      success: true,
      error: false,
      message: "Project created successfully",
      project,
    });
  };




// Controller to update the Project
export const updateProjectController = async (req, res) => {
  const userId = req.user?.id;

  const projectId = req.params.id;
  const workspaceId = req.params.workspaceId;

  const body = req.body;


  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.EDIT_PROJECT]);


  const { project } = await updateProjectService(
    workspaceId,
    projectId,
    body
  );


  return res.status(200).json({
    message: "Project updated successfully",
    project,
  });
}




// Controller to delete Project
export const deleteProjectController = async (req, res) => {
  const userId = req.user?.id;


  const projectId = req.params.id;
  const workspaceId = req.params.workspaceId;


  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.DELETE_PROJECT]);


  await deleteProjectService(workspaceId, projectId);

  return res.status(200).json({
    message: "Project deleted successfully",
  });
}





// Controller to getAllProjects in Workspace
export const getAllProjectsInWorkspaceController =
  async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id;

    // const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Workspace not found"
      })
    }

    const member = await MemberModel.findOne({
      userId,
      workspaceId,
    }).populate("role");

    if (!member) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "You are not a member of this workspace"
      })
    }

    const roleName = member.role?.name;
    roleGuard(roleName, [Permissions.VIEW_ONLY]);

    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.pageNumber) || 1;

    const { projects, totalCount, totalPages, skip } =
      await getProjectsInWorkspaceService(workspaceId, pageSize, pageNumber);

    return res.status(200).json({
      message: "Project fetched successfully",
      projects,
      pagination: {
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        skip,
        limit: pageSize,
      },
    });
  };





// Controller to getProject by id and workspace id
export const getProjectByIdAndWorkspaceIdController = async (req, res) => {
  const projectId = req.params.id;
  const workspaceId = req.params.workspaceId;

  const userId = req.user?.id;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { project } = await getProjectByIdAndWorkspaceIdService(
    workspaceId,
    projectId
  );

  return res.status(200).json({
    message: "Project fetched successfully",
    project,
  });
}





export const getProjectAnalyticsController = async (req, res) => {
  const projectId = req.params.id;
  const workspaceId = req.params.workspaceId;

  const userId = req.user?.id;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { analytics } = await getProjectAnalyticsService(
    workspaceId,
    projectId
  );

  return res.status(200).json({
    message: "Project analytics retrieved successfully",
    analytics,
  });
}










