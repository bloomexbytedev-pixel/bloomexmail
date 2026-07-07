import "dotenv/config";
import { Worker } from "bullmq";
import redis from "../config/redis.js";
import prisma from "../config/prisma.js";
import { sendEmail } from "../services/email.services.js";
import { compileTemplate } from "../services/template.service.js";

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { notificationId } = job.data;

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: "PROCESSING",
      },
    });

    const variables =
      notification.variables &&
      typeof notification.variables === "object" &&
      !Array.isArray(notification.variables)
        ? notification.variables
        : {};

    console.log("Processing notification:", notification.id);

    const recipient = notification.recipient?.trim();

    if (!recipient) {
      throw new Error("Notification recipient is required");
    }

    const html =
      notification.message ||
      compileTemplate({
        ...variables,
        name: variables.name || "User",
        otp: variables.otp || "",
        companyName: process.env.COMPANY_NAME || "Our Team",
      });

    const emailResult = await sendEmail({
      to: recipient,
      subject: notification.subject || "Notification",
      message: html,
    });

    console.log("Email accepted:", emailResult.accepted);
    console.log("Email rejected:", emailResult.rejected);
    console.log("Email messageId:", emailResult.messageId);

    console.log("Notification Sent");

    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: "SENT",
      },
    });

    console.log("Notification Sent");
  },
  {
    connection: redis,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  const { notificationId } = job.data;

  await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      status: "FAILED",
    },
  });

  console.log(`Job ${job?.id} failed`, err.message);
});
