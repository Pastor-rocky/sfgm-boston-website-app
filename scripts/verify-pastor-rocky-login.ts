import { storage } from "../server/storage";
import bcrypt from "bcryptjs";

const candidates = [
  { label: "username PastorRocky", lookup: "PastorRocky" },
  { label: "email pastor_rocky@sfgmboston.com", lookup: "pastor_rocky@sfgmboston.com" },
];

async function main() {
  for (const candidate of candidates) {
    const user = candidate.lookup.includes("@")
      ? await storage.getUserByEmail(candidate.lookup)
      : await storage.getUserByUsername(candidate.lookup);

    console.log(candidate.label, {
      found: Boolean(user),
      role: user?.role ?? null,
      hasPassword: user ? Boolean(user.password) : false,
      rocky123Matches: user?.password
        ? await bcrypt.compare("Rocky123", user.password)
        : false,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
