import { db } from "./server/db.js";
import { users } from "./shared/schema.js";

async function checkUsers() {
  try {
    console.log("🔍 Checking Neon database for users...\n");
    
    // Get all users from database
    const allUsers = await db.select().from(users);
    
    console.log(`📊 Total users found: ${allUsers.length}\n`);
    
    if (allUsers.length === 0) {
      console.log("❌ No users found in database!");
      console.log("\n✅ This is normal - it's a fresh database.");
      console.log("\n📝 To login, you need to:");
      console.log("1. Go to: https://sfgmboston.com/register");
      console.log("2. Create a new account");
      console.log("3. Then login with your new credentials");
    } else {
      console.log("✅ Users found in database:\n");
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email || user.username || user.id}`);
        console.log(`   Username: ${user.username || "N/A"}`);
        console.log(`   Has password: ${user.password ? "Yes" : "No"}`);
        console.log(`   Role: ${user.role || "student"}`);
        console.log("");
      });
    }
    
    console.log("\n✅ Database check complete!");
    
  } catch (error: any) {
    console.error("❌ Error checking database:", error.message);
    console.error("\nThis might mean:");
    console.error("1. Database connection issue");
    console.error("2. Database schema not set up");
    console.error("3. Environment variable not set");
  } finally {
    process.exit(0);
  }
}

checkUsers();

