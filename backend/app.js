import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/user.routes.js";
import urlRoutes from "./src/routes/url.routes.js";
import { ApiResponse } from "./src/utils/ApiResponse.js";
import redirectRouter from "./src/routes/redirect.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes

app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);


app.get("/api/test", (req, res) => {
  res.json(new ApiResponse(200, {data:"Test Data"} , { message: "API is working!" }));
});

app.use("/", redirectRouter);

export default app;