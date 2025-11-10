import {UserModel} from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const generateTokens = (user) => {
    try {
        const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );    
        const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed", [error]);
    }
}

// User registration
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);

    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserModel.createUser(username, email, passwordHash);
    
    return res.status(201).json(
        new ApiResponse(200, newUser, "User registered Successfully")
    )
  } catch (error) {
    throw new ApiError(500, "Registration failed", [error]);
  }
};

// User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.getUserByEmail(email);
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }
    console.log(user);
    const tokens = generateTokens(user);
    await UserModel.updateTokens(user.id, tokens.accessToken, tokens.refreshToken);
    return res.status(200).json(
        new ApiResponse(200, { data:tokens }, "Login successful")
    )
  } catch (error) {
    console.error("Login error:", error);
    throw new ApiError(500, "Login failed", error);
  }};


export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await UserModel.clearTokens(userId);
    return res.status(200).json(
        new ApiResponse(200, null, "Logout successful")
    )
  } catch (error) {
    console.error("Logout error:", error);
    throw new ApiError(500, "Logout failed", [error.message]);
  }};
