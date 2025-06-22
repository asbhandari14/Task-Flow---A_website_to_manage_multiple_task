import mongoose from "mongoose";
import { generateInviteCode } from "../utils/uuid.js"; // Assuming generateInviteCode is a utility function that generates a unique invite code





const workspaceSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: false 
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model (the workspace creator)
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: generateInviteCode,
    },
  },
  {
    timestamps: true,
  }
);





workspaceSchema.methods.resetInviteCode = function () {
  this.inviteCode = generateInviteCode();
};





const WorkspaceModel = mongoose.model(
  "Workspace",
  workspaceSchema
);

export default WorkspaceModel;
