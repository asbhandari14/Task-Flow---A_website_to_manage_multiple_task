import { Permissions } from "../enums/role.enum.js";
import { getMemberRoleInWorkspace } from "../services/member.service.js";
import { createTaskService, deleteTaskService, getAllTasksService, getTaskByIdService, updateTaskService } from "../services/task.service.js";
import { roleGuard } from "../utils/roleGuard.js";





// Controller to createTask
export const createTaskController = async (req, res) => {
  const userId = req.user?.id;

  const body = req.body;
  const projectId = req.params.projectId;
  const workspaceId = req.params.workspaceId;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.CREATE_TASK]);

  const { task } = await createTaskService(
    workspaceId,
    projectId,
    userId,
    body
  );

  return res.status(200).json({
    message: "Task created successfully",
    task,
  });
}




// Controller to deleteTask
export const deleteTaskController = async (req, res) => {
  const userId = req.user?.id;

  const taskId = req.params.id;
  const workspaceId = req.params.workspaceId;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.DELETE_TASK]);

  await deleteTaskService(workspaceId, taskId);

  return res.status(200).json({
    message: "Task deleted successfully",
  });
}




// controller to update Task
export const updateTaskController = async (req, res) => {
  const userId = req.user?.id;

  const body = req.body;

  const taskId = req.params.id;
  const projectId = req.params.projectId
  const workspaceId = req.params.workspaceId;


  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.EDIT_TASK]);


  const { updatedTask } = await updateTaskService(
    workspaceId,
    projectId,
    taskId,
    body
  );


  return res.status(200).json({
    message: "Task updated successfully",
    task: updatedTask,
  });
}





// Controller to get All Task
export const getAllTasksController = async (req, res) => {
  const userId = req.user?.id;

  const workspaceId = req.params.workspaceId;

  const filters = {
    projectId: req.query.projectId,
    status: req.query.status
      ? (req.query.status)?.split(",")
      : undefined,
    priority: req.query.priority
      ? (req.query.priority)?.split(",")
      : undefined,
    assignedTo: req.query.assignedTo
      ? (req.query.assignedTo)?.split(",")
      : undefined,
    keyword: req.query.keyword,
    dueDate: req.query.dueDate,
  };

  const pagination = {
    pageSize: parseInt(req.query.pageSize) || 10,
    pageNumber: parseInt(req.query.pageNumber) || 1,
  };

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const result = await getAllTasksService(workspaceId, filters, pagination);

  return res.status(200).json({
    message: "All tasks fetched successfully",
    ...result,
  });
}





// Controller to get Task By Id
export const getTaskByIdController = async (req, res) => {
  const userId = req.user?.id;

  const taskId = req.params.id;
  const projectId = req.params.projectId;
  const workspaceId = req.params.workspaceId;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const task = await getTaskByIdService(workspaceId, projectId, taskId);

  return res.status(200).json({
    message: "Task fetched successfully",
    task,
  });
}
