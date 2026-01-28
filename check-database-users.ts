import { storage } from "./server/storage.js";

async function checkUsers() {
  try {
    console.log("Checking database for users...");
    
    // Try to get all users (if there's a method for this)
    // Otherwise, try to query directly
    
    // Check if we can connect to database
    const testUser = await storage.getUserByEmail("test@test.com");
    console.log("Database connection:", testUser ? "Connected" : "Connected (no test user found)");
    
    // Try to find any user
    console.log("\nChecking for existing users...");
    
    // Since we don't have a getAllUsers method, let's try common emails/usernames
    const commonEmails = [
      "pastor_rocky@sfgmboston.com",
      "pastor.rocky@sfgmboston.com",
      "rocky@sfgmboston.com",
    ];
    
    for (const email of commonEmails) {
      const user = await storage.getUserByEmail(email);
      if (user) {
        console.log(`✓ Found user: ${email}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Has password: ${user.password ? "Yes" : "No"}`);
      }
    }
    
    console.log("\n✅ Database check complete!");
    console.log("\nIf no users found, you need to:");
    console.log("1. Go to https://sfgmboston.com/register");
    console.log("2. Create a new account");
    console.log("3. Then you can login");
    
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    process.exit(0);
  }
}

checkUsers();







