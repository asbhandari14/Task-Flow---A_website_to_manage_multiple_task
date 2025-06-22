import mongoose from "mongoose";
import ProjectModel from "../models/project.model.js";
import TaskModel from "../models/task.model.js";
// import { NotFoundException } from "../utils/appError.js";
import { TaskStatusEnum } from "../enums/task.enum.js";





// Controller to create Project
export const createProjectService = async ( userId, workspaceId, body ) => {

  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });


  await project.save();


  return { project };
};





// Controller to get All Projects in the Workspace
export const getProjectsInWorkspaceService = async ( workspaceId, pageSize, pageNumber ) => {
  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });

  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find({
    workspace: workspaceId,
  })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
};





// Controller to get Project By Id and Workspace Id
export const getProjectByIdAndWorkspaceIdService = async ( workspaceId, projectId ) => {

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project) {
    // throw new NotFoundException("Project not found or does not belong to the specified workspace");
    console.log("Project not found or does not belong to the specified workspace");
  }


  return { project };
};





// Controller to get Project Analytics Info
export const getProjectAnalyticsService = async ( workspaceId, projectId ) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    // throw new NotFoundException("Project not found or does not belong to this workspace");
    console.log("Project not found or does not belong to this workspace");
  }


  const currentDate = new Date();


  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);


  const _analytics = taskAnalytics[0];

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return {
    analytics,
  };
};





// Controller to update Project
export const updateProjectService = async ( workspaceId, projectId, body ) => {
  const { name, emoji, description } = body;

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    // throw new NotFoundException("Project not found or does not belong to the specified workspace");
    console.log("Project not found or does not belong to the specified workspace");
  }

  if (emoji) project.emoji = emoji;
  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();

  return { project };
};





// Controller to delete Project
export const deleteProjectService = async (workspaceId, projectId) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });
  

  if (!project) {
    // throw new NotFoundException("Project not found or does not belong to the specified workspace");
    console.log("Project not found or does not belong to the specified workspace");
  }

  await project.deleteOne();

  await TaskModel.deleteMany({
    project: project._id,
  });

  return project;
};
