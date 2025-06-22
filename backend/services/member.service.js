import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { Roles } from "../enums/role.enum.js";
import MemberModel from "../models/member.model.js";
import RoleModel from "../models/roles-permission.model.js";
import WorkspaceModel from "../models/workspace.model.js";





// Controller to getMemberRoleInWorkspace
export const getMemberRoleInWorkspace = async (userId, workspaceId) => {


    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        //   throw new NotFoundException("Workspace not found");
        console.log("Workspace not found");
    }


    const member = await MemberModel.findOne({
        userId,
        workspaceId,
    }).populate("role");

    if (!member) {
        //   throw new UnauthorizedException("You are not a member of this workspace",ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        console.log("You are not a member of this workspace", ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }
    

    const roleName = member.role?.name;
    return { role: roleName };
};





// Controller to joinWorkspaceBy InviteCode
export const joinWorkspaceByInviteService = async (userId, inviteCode) => {


    const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
    if (!workspace) {
        //   throw new NotFoundException("Invalid invite code or workspace not found");
        console.log("Invalid invite code or workspace not found");
    }


    const existingMember = await MemberModel.findOne({
        userId,
        workspaceId: workspace._id,
    }).exec();


    if (existingMember) {
        // throw new BadRequestException("You are already a member of this workspace");
        console.log("You are already a member of this workspace");
    }


    const role = await RoleModel.findOne({ name: Roles.MEMBER });
    if (!role) {
        // throw new NotFoundException("Role not found");
        console.log("Role not found");
    }


    const newMember = new MemberModel({
        userId,
        workspaceId: workspace._id,
        role: role._id,
    });
    await newMember.save();


    return { workspaceId: workspace._id, role: role.name };
};
