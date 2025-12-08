import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/user.routes.js";
import urlRoutes from "./src/routes/url.routes.js";
import { ApiResponse } from "./src/utils/ApiResponse.js";
import redirectRouter from "./src/routes/redirect.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import { verifyJWT } from "./src/middlewares/auth.middleware.js";
import { errorHandler } from "./src/middlewares/errorhandler.middleware.js";
import { renderDelay } from "./src/middlewares/renderDelay.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(renderDelay);

// Routes
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use("/api/auth", authRoutes);
app.use("/api/url",verifyJWT, urlRoutes);
app.use("/api/analytics",verifyJWT, analyticsRoutes);


app.get("/api/test", (req, res) => {
  res.json(new ApiResponse(200, {data:"Test Data"} , { message: "API is working!" }));
});

app.use("/", redirectRouter);
app.use(renderDelay);
app.use(errorHandler);

export default app;