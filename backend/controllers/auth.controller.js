import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import AccountModel from "../models/account.model.js";
import { ProviderEnum } from "../enums/account-provider.enum.js";
import { Roles } from "../enums/role.enum.js";
import MemberModel from "../models/member.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import RoleModel from "../models/roles-permission.model.js";





// // Function to handle Google login callback
// export const googleLoginCallback = asyncHandler(
//   async (req, res) => {
//     const currentWorkspace = req.user?.currentWorkspace;

//     if (!currentWorkspace) {
//       return res.redirect(
//         `${process.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
//       );
//     }

//     return res.redirect(
//       `${process.config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
//     );
//   }
// );





// Function to register a new user
export const registerUserController = async (req, res) => {

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "All fields are required"
      })
    }


    const isEmailExist = await UserModel.findOne({ email: email });


    if (isEmailExist) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "User is already exist"
      })
    }


    const hashedPassword = await hashValue(password, 10);
    if (!hashedPassword) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Error coming in hashing password"
      })
    }

    const newUser = await new UserModel({
      name: name,
      email: email,
      password: hashedPassword
    });

    await newUser.save();

    // console.log("This is the value of the newUser", newUser)


    if (!newUser) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Error coming in registering user"
      })
    }


    // Step - 2   Create a new account for the user
    const account = new AccountModel({
      userId: newUser._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    })

    await account.save();

    // console.log("This is the value of the account", account)


    // Step - 3   Create a new workspace for the new user
    const workspace = new WorkspaceModel({
      name: "My Workspace",
      description: `Workspace created for ${newUser.name}`,
      owner: newUser._id
    })

    await workspace.save();
    console.log("This is the value of the workspace", workspace);

    
    const ownerRole = await RoleModel.findOne({
      name: Roles.OWNER
    })
    console.log("This is the value of the ownerRole", ownerRole);

    if(!ownerRole){
      // res.status(400).json({
      //   success: false,
      //   error:true,
      //   message: "Owner role not found"
      // })
      console.log("Owner role not found")
    }


    // Step - 4   Create a new member for the user in the workspace and assign the owner role

    const member = new MemberModel({
      userId: newUser._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date()
    })

    await member.save();
    console.log("This is the value of the member", member)

    newUser.currentWorkspace = workspace._id;
    await newUser.save();

    console.log("This is the final value of the user", newUser)

    const token = await generateToken(newUser._id);
    console.log("This is the value of the token", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Error coming in generating token"
      })
    }

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Set to true in production
      sameSite: "strict"
    };


    return res.cookie("token", token, cookieOptions).status(201).json({
      success: true,
      error: false,
      message: "User created successfully",
      // userId: user._id,
      // workspaceId: workspace._id
    })

  } catch (error) {
    console.log("Error coming in the registerUserController", error);
    return res.status(401).json({
      success: false,
      error: true,
      message: error.message || error || "Error coming"
    })
  }

}





// Function to login a user
export const loginController = async (req, res, next) => {

  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "All fields are required"
      })
    }


    const isUserExist = await UserModel.findOne({ email: email });
    console.log("User found:", isUserExist);

    if (!isUserExist) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid Credentials"
      })
    }

    const verifiedPassword = await compareValue(password, isUserExist.password);
    console.log("Password verification result:", verifiedPassword);

    if (!verifiedPassword) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid Credentials"
      })
    }

    const token = await generateToken(isUserExist?._id);
    console.log("Generated token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Error coming in generating token"
      })
    }

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Set to true in production
      sameSite: "strict"
    };

    
    // console.log()

    return res.cookie("token", token, cookieOptions).status(200).json({
      success: true,
      error: false,
      user: isUserExist
    })

  } catch (error) {
    console.log("Error coming in the loginController", error);
    return res.status(401).json({
      success: false,
      error: true,
      message: error.message || error || "Error coming"
    })
  }
}





// Function to logout a user
export const logoutController = (req, res) => {
  try {
    console.log("logout controller is called");
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Set to true in production
      sameSite: "strict"
    });

    return res.status(200).json({
      success: true,
      error: false,
      message: "User logged out successfully"
    });
  } catch (error) {
    console.log("Error coming in the logOutController", error);
    return res.status(400).json({
      success: false,
      error: true,
      message: error.message || error || "Error coming"
    })
  }
}
