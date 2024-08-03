import { db } from "~/utils/db.server";

export async function createUser(username: string, password: string) {
  const saltRounds = 10;
  const bcrypt = await import("bcrypt");

  try {
    await db.user.create({
      data: {
        username: username,
        password: await bcrypt.hash(password, saltRounds),
      },
    });
  } catch (error) {
    return false;
  }

  return true;
}
