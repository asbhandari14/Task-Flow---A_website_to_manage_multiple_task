import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller.js";
import authentication from "../middlewares/authentication.js";

const userRoutes = Router();

userRoutes.get("/current", authentication, getCurrentUserController);

export default userRoutes;
