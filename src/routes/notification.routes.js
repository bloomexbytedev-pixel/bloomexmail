import express from "express";

import {
  createInquiryEmailNotification,
  createNotification,
  createOtpEmailNotification,
  getNotifications,
  getNotificationById,
  updateNotificationStatus,
  deleteNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

router.post("/", createNotification);

router.post("/email/otp", createOtpEmailNotification);

router.post("/email/inquiry", createInquiryEmailNotification);

router.get("/", getNotifications);

router.get("/:id", getNotificationById);

router.patch("/:id/status", updateNotificationStatus);

router.delete("/:id", deleteNotification);

export default router;
