import { Router } from "express";
import { loginController, logoutController, registerUserController } from "../controllers/auth.controller.js";

// const failedUrl = `${process.env.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginController);
authRoutes.get("/logout", logoutController);
// authRoutes.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

// authRoutes.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: failedUrl,
//   }),
//   googleLoginCallback
// );

export default authRoutes;
