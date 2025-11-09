import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api/auth", authRoutes);

app.get("/api/v1/test", (req, res) => {
  res.json({ message: "Server is running properly" });
});

export default app;