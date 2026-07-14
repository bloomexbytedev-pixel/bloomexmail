import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/v1/notifications", notificationRoutes);

export default app;
