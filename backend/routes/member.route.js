import { Router } from "express";
import { joinWorkspaceController } from "../controllers/member.controller.js";
import authentication from "../middlewares/authentication.js";
// import authentication from "../middlewares/authentication.js";





const memberRoutes = Router();





memberRoutes.post("/workspace/:inviteCode/join", authentication, joinWorkspaceController);






export default memberRoutes;
