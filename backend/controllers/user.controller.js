import { getCurrentUserService } from "../services/user.service.js";





export const getCurrentUserController = async (req, res) => {
    const userId = req.user?.id;

    const { user } = await getCurrentUserService(userId);

    return res.status(200).json({
      message: "User fetch successfully",
      user,
    });
  }
