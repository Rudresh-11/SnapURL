import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { UserModel } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        

        // console.log("Verifying token:", token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
        const user = await UserModel.getUserByEmail(decodedToken.email);
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
}