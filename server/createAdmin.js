import readline from "readline";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (!hidden) {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    process.stdout.write(question);

    let password = "";

    function onData(char) {
      char = char.toString();

      if (char === "\n" || char === "\r") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        rl.close();
        resolve(password);
        return;
      }

      if (char === "\u0003") {
        process.exit();
      }

      if (char === "\u007f") {
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
        return;
      }

      password += char;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function createAdmin() {
  try {
    console.log("\n🔐 MGJ Admin Account Setup\n");

    const username = await ask("Admin username: ");
    const password = await ask("Admin password: ", true);

    if (!username || !password) {
      console.log("❌ Username and password are required.");
      process.exit(1);
    }

    if (password.length < 8) {
      console.log("❌ Password must be at least 8 characters.");
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const existing = await pool.query(
      "SELECT id FROM admin_users WHERE username = $1",
      [username]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `
        UPDATE admin_users
        SET password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE username = $2
        `,
        [passwordHash, username]
      );

      console.log(`\n✅ Admin password updated for "${username}".`);
    } else {
      await pool.query(
        `
        INSERT INTO admin_users (username, password_hash)
        VALUES ($1, $2)
        `,
        [username, passwordHash]
      );

      console.log(`\n✅ Admin account "${username}" created.`);
    }

    console.log("🔒 Password stored as a bcrypt hash.");
  } catch (error) {
    console.error("\n❌ Admin setup failed:", error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();