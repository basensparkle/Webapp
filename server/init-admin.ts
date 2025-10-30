import "dotenv/config";
import { createLocalUser, getAllUsers } from "./db";
import { hashPassword } from "./_core/localAuth";
import { nanoid } from "nanoid";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function initAdmin() {
  console.log("🔐 Initialize Admin User for ICT Eerbeek\n");

  try {
    // Check if any users exist
    const users = await getAllUsers();
    if (users.length > 0) {
      console.log("❌ Users already exist in the database.");
      console.log("   Use the admin panel to manage users or delete the database to start fresh.");
      process.exit(1);
    }

    // Get admin details
    const name = await question("Admin Name: ");
    const email = await question("Admin Email: ");
    const password = await question("Admin Password (min 8 characters): ");

    if (!name || !email || !password) {
      console.log("❌ All fields are required!");
      process.exit(1);
    }

    if (password.length < 8) {
      console.log("❌ Password must be at least 8 characters!");
      process.exit(1);
    }

    // Hash password
    const { hash, salt } = hashPassword(password);

    // Generate unique openId for local users
    const openId = `local_${nanoid(32)}`;

    // Create admin user
    const user = await createLocalUser({
      openId,
      email,
      name,
      passwordHash: hash,
      passwordSalt: salt,
      loginMethod: "local",
      role: "admin",
      lastSignedIn: new Date(),
    });

    console.log("\n✅ Admin user created successfully!");
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);
    console.log("\n🎉 You can now login at your application URL with these credentials.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

initAdmin();
