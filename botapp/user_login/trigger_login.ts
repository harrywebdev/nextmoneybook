import { v4 as uuidv4 } from "uuid";
import prisma from "../db";
import getAppDomain from "../utils/get_app_domain";
import bcrypt from "bcryptjs";

export default async function triggerLogin(
  sendMessage: (message: string) => void
) {
  // create a login token and send it to the user

  const password = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.findUnique({
    where: { email: "admin@remix.run" },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // delete any previous tokens
  await prisma.password.deleteMany({
    where: {
      userId: user.id,
    },
  });

  // create new one
  await prisma.password.create({
    data: {
      hash: hashedPassword,
      expiresAt: new Date(Date.now() + 60 * 1000),
      userId: user.id,
    },
  });

  const urlToken = btoa(JSON.stringify({ user: user.id, password }));
  const loginUrl = `${getAppDomain()}/login?token=${urlToken}`;

  sendMessage(loginUrl);
}
