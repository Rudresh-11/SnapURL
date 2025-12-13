import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const generateTokens = (user) => {
  try {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
};

// User registration
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await UserModel.getUserByEmail(email);
  const existingUsername = await UserModel.getUserByUsername(username);
  if (existingUsername) {
    throw new ApiError(409, "Username already in use");
  }
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await UserModel.createUser(username, email, passwordHash);

  const tokens = generateTokens(newUser);
  await UserModel.updateTokens(
    newUser.id,
    tokens.accessToken,
    tokens.refreshToken
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", tokens.refreshToken, options)
    .cookie("accessToken", tokens.accessToken, options)
    .json(new ApiResponse(200, tokens, "Registration successful"));
};

export const loginUserWithGoogle = async (req, res) => {
  const { provider, idToken } = req.body;
  // ---------------------------
  // 1️⃣ GOOGLE LOGIN FLOW
  // ---------------------------
  if (!provider) throw new ApiError(401, "provider is not provided");
  if (provider != "google") throw new ApiError(401, "provider is not google");

  if (!idToken) {
    throw new ApiError(400, "Google ID token is required");
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    throw new ApiError(401, "Invalid Google token");
  }

  const googlePayload = ticket.getPayload();
  const googleId = googlePayload.sub;
  const googleEmail = googlePayload.email;
  const googleName = googlePayload.name;

  // 1. Check if user already exists with google_id
  let user = await UserModel.getUserByEmail(googleEmail);

  if (user) {
    if (user.provider === "local") {
      throw new ApiError(
        400,
        "Email already registered with password login. Use normal login."
      );
    }

    // Existing Google user → proceed to login
    const tokens = generateTokens(user);
    await UserModel.updateTokens(
      user.id,
      tokens.accessToken,
      tokens.refreshToken
    );

    return res
      .status(200)
      .cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: true,
      })
      .json(new ApiResponse(200, tokens, "Google login successful"));
  }

  // 2. NO EXISTING USER → CREATE ONE
  const newUser = await UserModel.createGoogleUser({
    username: googleName.replace(/\s+/g, "").toLowerCase(),
    email: googleEmail,
    googleId,
    provider: "google",
  });

  const tokens = generateTokens(newUser);
  await UserModel.updateTokens(
    newUser.id,
    tokens.accessToken,
    tokens.refreshToken
  );

  return res
    .status(201)
    .cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    })
    .cookie("accessToken", tokens.accessToken, { httpOnly: true, secure: true })
    .json(new ApiResponse(200, tokens, "Google Registration successful"));
};

// User local login
export const loginUser = async (req, res) => {
  const { email, password, provider, idToken } = req.body;

  const user = await UserModel.getUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid email or password");
  if (!(user.provider === "local"))
    throw new ApiError(401, `Login with ${user.provider} to continue`);

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const tokens = generateTokens(user);
  await UserModel.updateTokens(
    user.id,
    tokens.accessToken,
    tokens.refreshToken
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", tokens.refreshToken, options)
    .cookie("accessToken", tokens.accessToken, options)
    .json(new ApiResponse(200, tokens, "Login successful"));
};

export const getCurrentUser = async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await UserModel.clearTokens(userId);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, null, "Logout successful"));
  } catch (error) {
    throw new ApiError(500, "Logout failed", [error]);
  }
};

export const getUserUrlStats = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { from, to, urlId } = req.query;

  const hasTime = (s) => typeof s === "string" && s.includes("T");

  const now = new Date();

  const toDate = to ? new Date(to) : now;
  if (!hasTime(to)) toDate.setUTCHours(23, 59, 59, 999);

  const fromDate = from
    ? new Date(from)
    : new Date(toDate.getTime() - 6 * 24 * 60 * 60 * 1000); // default last 7 days
  if (!hasTime(from)) fromDate.setUTCHours(0, 0, 0, 0);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new ApiError(
      400,
      "Invalid from/to date. Use YYYY-MM-DD or ISO string."
    );
  }
  if (fromDate > toDate) throw new ApiError(400, "`from` must be <= `to`");

  const stats = await UserModel.getUserUrlStats({
    userId,
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    urlId,
  });

  const data = {
    range: { from: fromDate.toISOString(), to: toDate.toISOString() },
    ...stats,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, data, "User URL stats fetched successfully"));
};
