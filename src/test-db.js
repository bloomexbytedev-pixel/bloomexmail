// src/test-db.js

import prisma from "./config/prisma.js";
async function main() {
  const notification = await prisma.notification.create({
    data: {
      channel: "EMAIL",
      recipient: "test@gmail.com",
      subject: "Welcome",
      message: "Hello World",
    },
  });

  console.log(notification);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
