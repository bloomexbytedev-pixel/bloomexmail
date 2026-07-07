import * as notificationRepo from "../repositories/notification.repository.js";

export const createNotification = async (data) => {
  return notificationRepo.createNotification(data);
};

export const getNotificationById = async (id) => {
  return notificationRepo.getNotificationById(id);
};

export const getNotifications = async () => {
  return notificationRepo.getNotifications();
};

export const updateNotificationStatus = async (id, status) => {
  return notificationRepo.updateNotifciationStatus(id, status);
};
export const deleteNotification = async (id) => {
  return notificationRepo.deleteNotification(id);
};
