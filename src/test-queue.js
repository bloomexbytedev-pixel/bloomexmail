import emailQueue from "./queues/email.queue.js";

await emailQueue.add("welcome-email", {
  email: "test@gmail.com",
  subject: "Welcome",
});

console.log("Job Added Successfully");
