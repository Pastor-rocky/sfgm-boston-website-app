import { storage } from "../server/storage";
import { db } from "../server/db";
import { passwordResetTokens, users } from "../shared/schema";
import { desc, eq, ilike, or } from "drizzle-orm";

const email = process.argv[2]?.toLowerCase().trim();

async function main() {
  if (email) {
    const user = await storage.getUserByEmail(email);
    console.log(
      JSON.stringify(
        {
          lookupEmail: email,
          accountFound: Boolean(user),
          hasPassword: user ? Boolean(user.password) : null,
          username: user?.username ?? null,
          storedEmail: user?.email ?? null,
        },
        null,
        2,
      ),
    );

    if (user) {
      const [latestToken] = await db
        .select({
          createdAt: passwordResetTokens.createdAt,
          expiresAt: passwordResetTokens.expiresAt,
          usedAt: passwordResetTokens.usedAt,
        })
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id))
        .orderBy(desc(passwordResetTokens.createdAt))
        .limit(1);

      console.log("latestResetToken:", latestToken ?? null);
    }
    return;
  }

  const pastorAccounts = await db
    .select({
      username: users.username,
      email: users.email,
      role: users.role,
      hasPassword: users.password,
    })
    .from(users)
    .where(or(ilike(users.username, "pastorrocky%"), ilike(users.username, "pastor rocky%")));

  console.log(
    JSON.stringify(
      pastorAccounts.map((account) => ({
        username: account.username,
        email: account.email,
        role: account.role,
        hasPassword: Boolean(account.hasPassword),
      })),
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
