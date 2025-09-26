import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import {
  findByEmail,
  createUser,
  updateUser,
  findUserById,
} from "../service/user.service";
import { createOtp, deleteOtp, findOtp } from "../service/otp.service";
import { EmailType, sendEmail } from "../utils/email.service";
import { IUser, IUserRole } from "../types/user.types";
import { generateOtp } from "../utils/generateOtp";
import { error } from "console";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken";
import { JwtPayload } from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/uploadToCloudinary";

// export class UserController{
//     static async registerUser(req: Request, res: Response){
//         try{
//             console.log(req.body);
//             const {email} = req.body;
//             const existingUser = await UserService.findByEmail(email)
//             if(existingUser){
//                 throw new Error("User already existing")
//             }
//             res.status(200).json({message: "Successfully registered the user"})
//         }catch(error){
//             res.status(401).json({message: "Failed to register the user"})
//         }
//     }
// }

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const existingUser = await findByEmail(email);
    if (existingUser) {
      throw new Error("User already existing");
    }
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
    await createOtp({ email, otp: otpCode, expiresAt });
    await sendEmail(email, EmailType.OTP, { otp: otpCode });
    res.status(200).json({ message: "Otp send successfully to your email" });
  } catch (error: any) {
    res
      .status(401)
      .json({ message: "Failed to register the user", error: error.message });
    console.log("error", error);
  }
};

const verifyOtpAndUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    console.log(req.body);
    const validOtp = await findOtp(email, otp);
    console.log("validOtp", validOtp);
    if (!validOtp) {
      throw new Error("User not found");
    }
    if (otp !== validOtp.otp || email !== validOtp.email) {
      throw new Error("Invalid Otp");
    }

    const currentTime = new Date();
    if (otp.expiresAt < currentTime) {
      throw new Error("OTP has expired");
    }

    const user = {
      email,
      role: IUserRole.USER,
      isValidate: true,
    };
    await createUser(user);
    await deleteOtp(email);
    res.status(200).json({ message: "OTP verifyed successfully", email });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Failed to verify the OTP",
      error: error.message,
    });
    console.log("error", error);
  }
};

const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
    await createOtp({ email, otp: otpCode, expiresAt });
    await sendEmail(email, EmailType.OTP, { otp: otpCode });
    res.status(200).json({ message: "Otp send successfully to your email" });
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Failed to resend OTP" });
  }
};

const registerVerifiedUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("req body of registerVerified user", req.body);
  try {
    const { firstName, secondName, email, password, cpassword } = req.body;
    const existingUser = await findByEmail(email);
    if (existingUser && existingUser.isRegComplet) {
      throw new Error("User already existing");
    }
    if (!existingUser || !existingUser.isValidate) {
      throw new Error("User is not verified OTP verification required");
    }
    if (password !== cpassword) {
      throw new Error("Password dosen't match");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const registerNewUser: Partial<IUser> = {
      firstName,
      secondName,
      password: hashPassword,
      isRegComplet: true,
    };
    const newUser = await updateUser(email, registerNewUser);
    console.log("user details after registred the new user", newUser);
    if (!newUser) {
      throw new Error("Failed to get th new user details");
    }
    if (
      !newUser._id ||
      !newUser.role ||
      !newUser.firstName ||
      !newUser.secondName ||
      !newUser.email
    ) {
      throw new Error("User detail missing required fields");
    }
    const accessToken = generateAccessToken(
      newUser._id,
      newUser.role,
      newUser.firstName,
      newUser.secondName,
      newUser.email
    );
    const refreshToken = generateRefreshToken(
      newUser._id,
      newUser.role,
      newUser.firstName,
      newUser.secondName,
      newUser.email
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.status(200).json({
      user: newUser,
      accessToken,
      mesage: "User registered successfully",
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Failed to register the user",
      error: error.mesage,
    });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const userData = await findByEmail(email);
    if (!userData) {
      throw new Error("User not fount");
    }
    if (!userData.isValidate) {
      throw new Error(
        "User is not verified. Please complete OTP verification."
      );
    }
    if (!userData.isRegComplet) {
      throw new Error("User registration is incomplete");
    }
    const matchPassword = await bcrypt.compare(password, userData.password!);
    if (!matchPassword) {
      throw new Error("Invalid credentials");
    }
    console.log("after successfull login userData", userData);
    if (
      !userData._id ||
      !userData.role ||
      !userData.firstName ||
      !userData.secondName ||
      !userData.email
    ) {
      throw new Error("User detail missing required fields");
    }
    const accessToken = generateAccessToken(
      userData._id,
      userData.role,
      userData.firstName,
      userData.secondName,
      userData.email
    );
    const refreshToken = generateRefreshToken(
      userData._id,
      userData.role,
      userData.firstName,
      userData.secondName,
      userData.email
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res
      .status(200)
      .json({ user: userData, accessToken, message: "Login successfully" });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Failed to login",
      error: error.message,
    });
  }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("refrreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successfully" });
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Failed to logout" });
  }
};

const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    // console.log("user form the req.user", user)
    const { firstName, secondName, bio } = req.body;
    const existingUser = await findUserById(user._id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    console.log("Uploaded files:", req.files);
    const updateData: Partial<IUser> = {};

    if (req.files && (req.files as any).avatar) {
      const avatarFile = (req.files as any).avatar[0];
      if (existingUser?.avatar) {
        await deleteFromCloudinary(existingUser.avatar);
      }
      const avatarUrl = await uploadToCloudinary(avatarFile, {
        folder: "techword/avatars",
        resource_type: "image",
        quality: "90",
        crop: "scale",
      });
      console.log("updated user avatar", avatarUrl)
      updateData.avatar = avatarUrl;
    }

    if (firstName) updateData.firstName = firstName;
    if (secondName) updateData.secondName = secondName;
    if (bio) updateData.bio = bio;

    const updateProfile = await updateUser(user.email, updateData);

    res.status(200).json({
      message: "Successfully update the user profile",
      user: updateProfile,
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Failed to update the user profile",
      error: error.message,
    });
  }
};

const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
  try{
    const userId = req.user._id;
    const user = await findUserById(userId)
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    if(!user?.avatar){
      throw new Error("User dose't have avatar")
    }
    console.log("user avatar", user.avatar)
    await deleteFromCloudinary(user.avatar)
    const updatedUser = await updateUser(user.email, { avatar: "" })
     res.status(200).json({ message: "Avatar removed successfully", user: updatedUser });
  }catch(error: any){
     res.status(500).json({ message: error.message || "Failed to remove avatar" });
  }
}

const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = verifyRefreshToken(token) as JwtPayload;
    const newAccessToken = generateAccessToken(
      decoded._id,
      decoded.role,
      decoded.firstName,
      decoded.secondName,
      decoded.email
    );
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error: any) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

export {
  registerUser,
  verifyOtpAndUser,
  resendOtp,
  registerVerifiedUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  deleteAvatar,
  refreshAccessToken,
};
