import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import notificationRoutes from "./src/routes/notification.routes.js";

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
app.use("/api/v1/notifications", notificationRoutes);

export default app;
