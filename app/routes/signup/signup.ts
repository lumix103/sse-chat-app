import { db } from "~/utils/db.server";

export async function createUser(username: string, password: string) {
  const saltRounds = 10;
  const bcrypt = await import("bcrypt");
  await db.user.create({
    data: {
      username: username,
      password: await bcrypt.hash(password, saltRounds),
    },
  });
}
