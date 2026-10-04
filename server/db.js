import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "mgj_database",
  user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,

ssl: {
  rejectUnauthorized: false,
},

// PostgreSQL connection settings
max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// PostgreSQL connection errors
pool.on("error", (error) => {
  console.error(
    "❌ Unexpected PostgreSQL error:",
    error.message
  );
});

// Test database connection when the server starts
export async function testDatabaseConnection() {
  try {
    const result = await pool.query(
      "SELECT NOW() AS time"
    );

    console.log(
      "✅ PostgreSQL connected successfully"
    );

    console.log(
      `📊 Database: ${process.env.DB_NAME}`
    );

    console.log(
      `🕒 Database time: ${result.rows[0].time}`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ PostgreSQL connection failed:",
      error.message
    );

    return false;
  }
}

export default pool;