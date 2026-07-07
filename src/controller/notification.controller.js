import * as notificationService from "../services/notification.service.js";
import {
  createInquiryEmailSchema,
  createNotificationSchema,
  createOtpEmailSchema,
} from "../validation/notification.validation.js";
import emailQueue from "../queues/email.queue.js";

const enqueueEmailNotification = async (notificationId) => {
  return emailQueue.add(
    "send-email",
    {
      notificationId,
    },
    {
      attempts: 3,
      backoff: {
        type: "fixed",
        delay: 5000,
      },
    },
  );
};

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const getInquiryRecipients = () => {
  const recipients =
    process.env.INQUIRY_EMAIL_TO ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  return recipients
    ?.split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean)
    .join(", ");
};

const getInquiryAutoReplySubject = () => {
  return process.env.INQUIRY_AUTO_REPLY_SUBJECT || "We received your inquiry";
};

const getInquiryAutoReplyMessage = ({ name }) => {
  if (process.env.INQUIRY_AUTO_REPLY_MESSAGE) {
    return process.env.INQUIRY_AUTO_REPLY_MESSAGE.replaceAll(
      "{{name}}",
      escapeHtml(name),
    );
  }

  return `
    <p>Dear ${escapeHtml(name)},</p>
    <p>Thank you for contacting us. We truly appreciate your interest in our services and the opportunity to assist you.</p>
    <p>We have received your inquiry, and our team is currently reviewing it. One of our representatives will get back to you within <strong>2 hours</strong>.</p>
    <p>We kindly ask for your patience while we prepare the best possible response. If your request is urgent, please mention it in your reply, and we'll do our best to prioritize it.</p>
    <p>Thank you for choosing us. We look forward to speaking with you soon.</p>
    <br />
    <p>Best regards,<br />Bloomexbyte Team</p>
  `;
};

export const createNotification = async (req, res) => {
  try {
    const validatedData = createNotificationSchema.parse(req.body);

    const notification =
      await notificationService.createNotification(validatedData);
    // alternatively, you can directly use the repository here if you want to skip the service layer for this simple operation
    //   await prisma.notification.create({
    //     data: validatedData,
    //   });
    await enqueueEmailNotification(notification.id);
    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createOtpEmailNotification = async (req, res) => {
  try {
    const validatedData = createOtpEmailSchema.parse(req.body);

    const notification = await notificationService.createNotification({
      channel: "EMAIL",
      recipient: validatedData.recipient,
      subject: validatedData.subject || "Your OTP Code",
      template: "otp",
      variables: {
        name: validatedData.name || "User",
        otp: validatedData.otp,
      },
    });

    await enqueueEmailNotification(notification.id);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createInquiryEmailNotification = async (req, res) => {
  try {
    const validatedData = createInquiryEmailSchema.parse(req.body);
    const recipient = getInquiryRecipients();
    const email = validatedData.email || validatedData.recipient;

    if (!recipient) {
      throw new Error("INQUIRY_EMAIL_TO, SMTP_FROM, or SMTP_USER is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    const subject =
      validatedData.subject || `New inquiry from ${validatedData.name}`;

    const message = `
      <h2>New Inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(validatedData.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(validatedData.phone || "N/A")}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(validatedData.message).replaceAll("\n", "<br />")}</p>
    `;

    const notification = await notificationService.createNotification({
      channel: "EMAIL",
      recipient,
      subject,
      message,
      template: "inquiry",
      variables: validatedData,
    });
    // console.log("Inquiry notification created:", notification.id);
    await enqueueEmailNotification(notification.id);

    const autoReplyNotification = await notificationService.createNotification({
      channel: "EMAIL",
      recipient: email,
      subject: getInquiryAutoReplySubject(),
      message: getInquiryAutoReplyMessage({
        name: validatedData.name,
      }),
      template: "inquiry_auto_reply",
      variables: {
        ...validatedData,
        email,
      },
    });
    console.log(
      "Auto-reply notification created:",
      autoReplyNotification.recipient,
    );

    await enqueueEmailNotification(autoReplyNotification.id);

    res.status(201).json({
      success: true,
      data: {
        inquiryNotification: notification,
        autoReplyNotification,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications();

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await notificationService.getNotificationById(
      req.params.id,
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    // const notification = await prisma.notification.update({
    //   where: {
    //     id,
    //   },
    //   data: {
    //     status,
    //   },
    // });
    const notification = await notificationService.updateNotificationStatus(
      id,
      status,
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await notificationService.deleteNotification(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
