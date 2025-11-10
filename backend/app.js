import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/user.routes.js";
import { ApiResponse } from "./src/utils/ApiResponse.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

app.get("/api/v1/test", (req, res) => {
  res.json(new ApiResponse(200, {data:"Test Data"} , { message: "API is working!" }));
});

export default app;