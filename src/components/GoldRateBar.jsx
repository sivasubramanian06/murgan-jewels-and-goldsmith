import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

export default function GoldRateBar({ rates }) {
  const [currentRates, setCurrentRates] = useState(rates);

  useEffect(() => {
    let cancelled = false;

    const loadGoldRates = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/gold-rates`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load gold rates"
          );
        }

        if (!cancelled && data.data) {
          setCurrentRates({
            gold22k: Number(data.data.gold_22k_rate) || 0,
            gold18k: Number(data.data.gold_18k_rate) || 0,
            silver: Number(data.data.silver_rate) || 0,
          });
        }
      } catch (error) {
        console.error(
          "❌ Gold rate loading error:",
          error.message
        );

        // Keep the existing rates if API is unavailable
        if (!cancelled) {
          setCurrentRates(rates);
        }
      }
    };

    loadGoldRates();

    return () => {
      cancelled = true;
    };
  }, [rates]);

  return (
    <div
      className="gold-rate-bar"
      style={{
        background: "#FBF8F3",
        borderBottom: "1px solid #E7DFD2",
        color: "#6B5E4C",
      }}
    >
      <span>
        Today's Rate ·{" "}
        {new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>

      <strong style={{ color: "#241F1A" }}>
        22K Gold: ₹
        {Number(
          currentRates?.gold22k || 0
        ).toLocaleString("en-IN")}
        /g
      </strong>

      <span>
        Silver: ₹
        {Number(
          currentRates?.silver || 0
        ).toLocaleString("en-IN")}
        /g
      </span>

      <span className="manual-badge">
        Manual
      </span>
    </div>
  );
}