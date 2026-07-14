import { Queue } from "bullmq";
import redis from "../config/redis.js";

let emailQueue = null;
let initializationError = null;

export const getEmailQueue = async () => {
  if (emailQueue) {
    return emailQueue;
  }

  if (initializationError) {
    return null;
  }

  try {
    emailQueue = new Queue("emailQueue", {
      connection: redis,
    });

    await emailQueue.waitUntilReady();
    return emailQueue;
  } catch (error) {
    initializationError = error;
    console.warn("Email queue initialization skipped:", error.message);
    return null;
  }
};

export default getEmailQueue;
