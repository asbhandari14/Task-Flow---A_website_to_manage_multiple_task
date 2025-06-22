import { joinWorkspaceByInviteService } from "../services/member.service.js";




// Controller to join Workspace
export const joinWorkspaceController = (
  async (req, res) => {
    const inviteCode = req.params.inviteCode;
    const userId = req.user?.id;
    console.log(req.user);
    console.log(req.user?.id);
    console.log("This is the value of the userId", userId);
    console.log("This is the value of the inviteCOde", inviteCode);
    console.log("This is the value of the req body", req.body);

    const {workspaceId, role} = await joinWorkspaceByInviteService(userId, inviteCode);
    

    return res.status(200).json({
      message: "Successfully joined the workspace",
      workspaceId: workspaceId,
      role: role,
    });
  }
);
