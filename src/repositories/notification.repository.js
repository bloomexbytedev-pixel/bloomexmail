import prisma from "../config/prisma.js";

export const createNotification = async (data) => {
  return prisma.notification.create({
    data,
  });
};

export const getNotificationById = async (id) => {
  return prisma.notification.findUnique({
    where: { id },
  });
};

export const getNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const deleteNotification = async (id) => {
  return prisma.notification.delete({
    where: { id },
  });
};

export const updateNotifciationStatus = async (id, status) => {
  return prisma.notification.update({
    where: { id },
    data: { status },
  });
};
