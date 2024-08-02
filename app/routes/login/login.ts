import { db } from "~/utils/db.server";

export async function validateUser(username: string, password: string) {
  const user = await db.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    return false;
  }

  const bcrypt = await import("bcrypt");

  const match = (await bcrypt.compare(password, user.password)) as boolean;

  return match;
}
