import "server-only";
import { auth } from "@/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
  }
}

/** Use at the top of every admin Server Action / query. */
export async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user;
}

export async function requireAdmin() {
  const user = await requireStaff();
  if (user.role !== "ADMIN") throw new UnauthorizedError();
  return user;
}
