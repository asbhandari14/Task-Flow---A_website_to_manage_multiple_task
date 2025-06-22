import mongoose from "mongoose";
import { Roles } from "../enums/role.enum.js";
import MemberModel from "../models/member.model.js";
import RoleModel from "../models/roles-permission.model.js";
import UserModel from "../models/user.model.js";
import WorkspaceModel from "../models/workspace.model.js";
// import { BadRequestException, NotFoundException } from "../utils/appError.js";
import TaskModel from "../models/task.model.js";
import { TaskStatusEnum } from "../enums/task.enum.js";
import ProjectModel from "../models/project.model.js";






// CREATE NEW WORKSPACE
export const createWorkspaceService = async (userId, body) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);
  if (!user) {
    // throw new NotFoundException("User not found");
    console.log("User not found");
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  if (!ownerRole) {
    // throw new NotFoundException("Owner role not found");
    console.log("Owner role not found")
  }

  const workspace = new WorkspaceModel({
    name,
    description,
    owner: user._id,
  });
  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });
  await member.save();

  user.currentWorkspace = workspace._id;
  await user.save();

  return { workspace };
};





// GET WORKSPACES USER IS A MEMBER
export const getAllWorkspacesUserIsMemberService = async (userId) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  const workspaces = memberships.map((membership) => membership.workspaceId);
  return { workspaces };
};





// GET WORKSPACE BY ID WITH MEMBERS
export const getWorkspaceByIdService = async (workspaceId) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    // throw new NotFoundException("Workspace not found");
    console.log("Workspace not found");
  }


  const members = await MemberModel.find({ workspaceId }).populate("role");
  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return { workspace: workspaceWithMembers };
};





// GET ALL MEMBERS IN WORKSPACE
export const getWorkspaceMembersService = async (workspaceId) => {
  const members = await MemberModel.find({ workspaceId })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();

  return { members, roles };
};





// GET WORKSPACE ANALYTICS
export const getWorkspaceAnalyticsService = async (workspaceId) => {


  const currentDate = new Date();


  const totalTasks = await TaskModel.countDocuments({ workspace: workspaceId });
  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });


  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });


  const analytics = { totalTasks, overdueTasks, completedTasks };
  return { analytics };
};





// CHANGE MEMBER ROLE IN WORKSPACE
export const changeMemberRoleService = async (workspaceId, memberId, roleId) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    // throw new NotFoundException("Workspace not found");
    console.log("Workspace not found");
  }
  console.log('This is the value of the workspace', workspace);


  const role = await RoleModel.findById(roleId);
  if (!role) {
    // throw new NotFoundException("Role not found");
    console.log("Role not found");
  }
  console.log("this is the value of the role", role);

  const member = await MemberModel.findOne({ userId: memberId, workspaceId });
  if (!member) {
    // throw new Error("Member not found in the workspace");
    console.log("Member not found in the workspace");
  }
  console.log("this is the value of the member", member);

  
  member.role = role;
  await member.save();

  return { member };
};





// UPDATE WORKSPACE
export const updateWorkspaceByIdService = async (workspaceId, name, description) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    // throw new NotFoundException("Workspace not found");
    console.log("Workspace not found");
  }


  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;
  await workspace.save();


  return { workspace };
};





// DELETE WORKSPACE
export const deleteWorkspaceService = async (workspaceId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await WorkspaceModel.findById(workspaceId).session(session);
    if (!workspace) {
      // throw new NotFoundException("Workspace not found");
      console.log("Workspace not found");
    }

    if (!workspace.owner.equals(new mongoose.Types.ObjectId(userId))) {
      // throw new BadRequestException("You are not authorized to delete this workspace");
      console.log("You are not authorized to delete this workspace");
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      // throw new NotFoundException("User not found");
      console.log("User not found");
    }

    await ProjectModel.deleteMany({ workspace: workspace._id }).session(session);
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session);
    await MemberModel.deleteMany({ workspaceId: workspace._id }).session(session);

    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({ userId }).session(session);
      user.currentWorkspace = memberWorkspace ? memberWorkspace.workspaceId : null;
      await user.save({ session });
    }

    await workspace.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();

    return { currentWorkspace: user.currentWorkspace };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
