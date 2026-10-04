import { useState } from "react";
import {
  LockKeyhole,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

// Local development uses localhost.
// Production/Render uses VITE_API_URL.
const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://murgan-jewels-and-goldsmith.onrender.com";

export default function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Invalid username or password."
        );
        return;
      }

      // Store the real JWT token returned by the backend.
      sessionStorage.setItem(
        "mgj-admin-token",
        data.token
      );

      // Keep the existing App.jsx login state working.
      sessionStorage.setItem(
        "mgj-admin-auth",
        "true"
      );

      onLogin();
    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        "Unable to connect to the server. Please make sure the MGJ backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 16px",
        background:
          "linear-gradient(135deg, #fbf8f3 0%, #f4ead8 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          border: "1px solid rgba(180,140,70,0.18)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            margin: "0 auto 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#241f1a",
            color: "#d8b36a",
          }}
        >
          <ShieldCheck size={32} />
        </div>

        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#241f1a",
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#766d63",
              lineHeight: 1.6,
            }}
          >
            Murugan Goldsmith and Jewels
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ marginTop: "28px" }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              color: "#241f1a",
            }}
          >
            Username
          </label>

          <div
            style={{
              position: "relative",
              marginBottom: "18px",
            }}
          >
            <LockKeyhole
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8a8177",
              }}
            />

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter admin username"
              autoComplete="username"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px 13px 44px",
                borderRadius: "12px",
                border: "1px solid #ddd3c7",
                outline: "none",
                fontSize: "15px",
              }}
            />
          </div>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              color: "#241f1a",
            }}
          >
            Password
          </label>

          <div style={{ position: "relative" }}>
            <LockKeyhole
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8a8177",
              }}
            />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              autoComplete="current-password"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 48px 13px 44px",
                borderRadius: "12px",
                border: "1px solid #ddd3c7",
                outline: "none",
                fontSize: "15px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              disabled={loading}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "#766d63",
                padding: "6px",
              }}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "14px",
                padding: "11px 13px",
                borderRadius: "10px",
                background: "#fff1f1",
                color: "#a52a2a",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "22px",
              padding: "14px",
              border: 0,
              borderRadius: "12px",
              background: loading
                ? "#766d63"
                : "#241f1a",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
            }}
          >
            <LogIn size={19} />
            {loading ? "Checking..." : "Login to Admin"}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              border: "1px solid #ddd3c7",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#5d554d",
              fontSize: "14px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            Back to Website
          </button>
        </form>

        <p
          style={{
            marginTop: "22px",
            marginBottom: 0,
            textAlign: "center",
            fontSize: "12px",
            color: "#9a9187",
          }}
        >
          <ShieldCheck
            size={13}
            style={{
              verticalAlign: "middle",
              marginRight: "4px",
            }}
          />
          Admin access only
        </p>
      </section>
    </main>
  );
}