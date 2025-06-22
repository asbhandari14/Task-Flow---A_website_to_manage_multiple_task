import mongoose, { Schema, Document } from "mongoose";





const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER"],
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      enum: ["CREATE_WORKSPACE", "DELETE_WORKSPACE", "EDIT_WORKSPACE", "MANAGE_WORKSPACE_SETTINGS", "ADD_MEMBER", "CHANGE_MEMBER_ROLE", "REMOVE_MEMBER", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "CREATE_TASK", "EDIT_TASK", "DELETE_TASK", "VIEW_ONLY"],
      required: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);





const RoleModel = mongoose.model("Role", roleSchema);
export default RoleModel;
