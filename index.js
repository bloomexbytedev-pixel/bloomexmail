import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import notificationRoutes from "./src/routes/notification.routes.js";
import "./src/workers/email.worker.js";
import { verifyEmailService } from "./src/services/email.services.js";

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
// running server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

// apit test
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.get("/verify-email", async (req, res) => {
  try {
    await verifyEmailService();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
  }
});
app.use("/api/v1/notifications", notificationRoutes);

export default app;
