import { useState } from "react";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Gem,
  Loader2,
  MessageCircle,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

const BUSINESS_WHATSAPP = "919384741246";

/* =========================================================
   STATUS
========================================================= */

const STATUSES = [
  "Order Received",
  "Gold Issued",
  "Making",
  "Polishing",
  "Quality Check",
  "Ready",
  "Delivered",
];

/* =========================================================
   DATE
========================================================= */

const formatDate = (date) => {
  if (!date) return "-";

  const raw = String(date).trim();

  if (!raw) return "-";

  const datePart = raw.includes("T")
    ? raw.split("T")[0]
    : raw.split(" ")[0];

  const parts = datePart.split("-");

  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const parsed = new Date(year, month - 1, day);

    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  const fallback = new Date(raw);

  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return "To be confirmed";
};

/* =========================================================
   MONEY
========================================================= */

const money = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TrackOrderPage() {
  const [trackCode, setTrackCode] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const searchOrder = async (event) => {
    event.preventDefault();

    const code = trackCode.trim().toUpperCase();

    if (!code) {
      setError("Please enter your tracking code.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(code)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order not found.");
      }

      setOrder(data.data);
    } catch (err) {
      console.error("Track order error:", err);

      setError(
        err.message || "Unable to find the order."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshOrder = async () => {
    if (!order?.track_code) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(
          order.track_code
        )}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to refresh order."
        );
      }

      setOrder(data.data);
    } catch (err) {
      console.error("Refresh error:", err);

      setError(
        err.message || "Unable to refresh order."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     COPY
  ======================================================= */

  const copyTrackingCode = async () => {
    if (!order?.track_code) return;

    try {
      await navigator.clipboard.writeText(
        order.track_code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setError("Unable to copy tracking code.");
    }
  };

  /* =======================================================
     WHATSAPP
  ======================================================= */

  const openWhatsApp = () => {
    if (!order) return;

    const customerPhone = String(
      order.customer_phone || ""
    ).replace(/\D/g, "");

    const whatsappPhone =
      customerPhone.length === 10
        ? `91${customerPhone}`
        : BUSINESS_WHATSAPP;

    const message = `
Hello Murugan Goldsmith and Jewels,

I would like to check my jewellery order.

Tracking Code: ${order.track_code}

Customer: ${order.customer_name}

Jewellery: ${order.jewellery}

Current Status: ${order.status}

Please provide any additional update.

Thank you.
`.trim();

    const url =
      `https://wa.me/${whatsappPhone}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =======================================================
     CURRENT STATUS
  ======================================================= */

  const currentStatusIndex = order
    ? STATUSES.indexOf(order.status)
    : -1;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .track-page {
          min-height: calc(100vh - 80px);
          padding: 42px 20px 90px;

          background:
            radial-gradient(
              circle at 5% 0%,
              rgba(187,145,60,.13),
              transparent 28%
            ),
            radial-gradient(
              circle at 100% 30%,
              rgba(187,145,60,.09),
              transparent 26%
            ),
            #f8f5ef;
        }

        .track-container {
          width: min(1050px, 100%);
          margin: 0 auto;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .track-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 34px;
          animation: trackDown .65s ease both;
        }

        .track-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 12px;

          color: #a67b2d;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .track-title {
          margin: 0;
          color: #29221b;
          font-size: clamp(38px,5vw,58px);
          line-height: 1.02;
        }

        .track-description {
          max-width: 620px;
          margin: 16px auto 0;

          color: #766c61;
          font-size: 15px;
          line-height: 1.75;
        }

        /* =====================================================
           SEARCH
        ===================================================== */

        .track-search-card {
          max-width: 720px;
          margin: 0 auto 26px;
          padding: 22px;

          border: 1px solid #e3d9cc;
          border-radius: 22px;

          background: rgba(255,255,255,.94);

          box-shadow:
            0 15px 40px
            rgba(48,37,24,.07);

          animation: trackUp .7s ease .08s both;
        }

        .track-search-label {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 10px;

          color: #423930;
          font-size: 13px;
          font-weight: 800;
        }

        .track-search-label svg {
          color: #a5792b;
        }

        .track-search-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
        }

        .track-input {
          width: 100%;
          min-height: 52px;
          padding: 13px 16px;

          border: 1px solid #dcd1c3;
          border-radius: 13px;

          background: #fff;
          color: #2c251e;

          font-size: 15px;
          font-weight: 700;
          letter-spacing: .04em;

          outline: none;
          box-sizing: border-box;
          text-transform: uppercase;
        }

        .track-input:focus {
          border-color: #b68b3c;

          box-shadow:
            0 0 0 4px
            rgba(182,139,60,.11);
        }

        .track-search-button {
          min-width: 145px;
          min-height: 52px;

          border: 0;
          border-radius: 13px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          background:
            linear-gradient(
              135deg,
              #bd9140,
              #906820
            );

          color: #fff;
          font-weight: 900;
          cursor: pointer;

          box-shadow:
            0 9px 23px
            rgba(125,91,28,.18);
        }

        .track-search-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .track-search-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .track-example {
          margin: 9px 2px 0;
          color: #948679;
          font-size: 11px;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .track-error {
          max-width: 720px;
          margin: 18px auto;

          padding: 14px 16px;

          display: flex;
          align-items: center;
          gap: 10px;

          border: 1px solid #e2bcbc;
          border-radius: 14px;

          background: #fff2f2;
          color: #8b2525;

          font-size: 13px;
        }

        /* =====================================================
           RESULT
        ===================================================== */

        .track-result {
          animation: trackUp .65s ease both;
        }

        /* =====================================================
           DARK ORDER HERO
        ===================================================== */

        .order-hero {
          position: relative;
          overflow: hidden;

          padding: 29px;
          border-radius: 25px;

          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(213,177,99,.18),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              #30261c,
              #17130f
            );

          color: #fff;

          box-shadow:
            0 25px 60px
            rgba(36,27,18,.20);
        }

        .order-hero::before {
          content: "";
          position: absolute;

          width: 280px;
          height: 280px;

          right: -160px;
          top: -160px;

          border:
            1px solid
            rgba(224,190,113,.13);

          border-radius: 50%;
        }

        .order-hero::after {
          content: "";
          position: absolute;

          width: 190px;
          height: 190px;

          right: -105px;
          top: -105px;

          border:
            1px solid
            rgba(224,190,113,.10);

          border-radius: 50%;
        }

        .order-hero-content {
          position: relative;
          z-index: 1;
        }

        .order-hero-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;
        }

        .order-label {
          margin: 0 0 8px;

          color: #cdb078;
          font-size: 11px;
          font-weight: 800;

          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .order-code {
          margin: 0;

          color: #fff;
          font-size: clamp(25px,4vw,39px);

          letter-spacing: .06em;
          word-break: break-word;
        }

        .current-status {
          flex-shrink: 0;

          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 10px 15px;

          border:
            1px solid
            rgba(220,186,106,.24);

          border-radius: 999px;

          background:
            rgba(255,255,255,.08);

          color: #efd28e;

          font-size: 12px;
          font-weight: 800;
        }

        .status-live-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #d9b65f;

          box-shadow:
            0 0 0 4px
            rgba(217,182,95,.12);
        }

        .order-hero-bottom {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          margin-top: 27px;
        }

        .hero-mini {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 10px 12px;

          border-radius: 11px;

          background:
            rgba(255,255,255,.055);

          color: #c8bcad;
          font-size: 11px;
        }

        .hero-mini svg {
          color: #d2ae61;
        }

        /* =====================================================
           GRID
        ===================================================== */

        .track-grid {
          display: grid;

          grid-template-columns:
            minmax(0,1.2fr)
            minmax(320px,.8fr);

          gap: 18px;
          margin-top: 18px;
        }

        .track-card {
          padding: 25px;

          border: 1px solid #e5ddd2;
          border-radius: 21px;

          background:
            rgba(255,255,255,.96);

          box-shadow:
            0 13px 38px
            rgba(50,38,24,.06);
        }

        .card-heading {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 20px;
        }

        .card-heading-icon {
          width: 39px;
          height: 39px;

          display: grid;
          place-items: center;

          border-radius: 11px;

          background: #f6ecd8;
          color: #a77b2d;

          flex-shrink: 0;
        }

        .card-heading h2 {
          margin: 0;

          color: #30271f;
          font-size: 21px;
        }

        .card-heading p {
          margin: 3px 0 0;

          color: #948679;
          font-size: 11px;
        }

        /* =====================================================
           DETAILS
        ===================================================== */

        .details-grid {
          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 15px;
        }

        .detail-item {
          padding: 14px;

          border-radius: 13px;

          background: #faf7f2;
          border: 1px solid #eee7dd;
        }

        .detail-label {
          display: block;

          color: #948679;
          font-size: 10px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .detail-value {
          display: block;

          margin-top: 5px;

          color: #332a22;
          font-size: 14px;
          font-weight: 800;

          word-break: break-word;
        }

        /* =====================================================
           PROGRESS
        ===================================================== */

        .progress-card {
          grid-row: span 2;
        }

        .progress-list {
          position: relative;
          display: grid;
        }

        .progress-list::before {
          content: "";

          position: absolute;

          left: 19px;
          top: 21px;
          bottom: 21px;

          width: 2px;

          background: #e7dfd4;
        }

        .progress-item {
          position: relative;
          z-index: 1;

          display: flex;
          align-items: center;
          gap: 13px;

          padding: 8px 0;
        }

        .progress-icon {
          width: 40px;
          height: 40px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          border: 2px solid #e5ddd2;
          background: #fff;
          color: #958778;

          flex-shrink: 0;
        }

        .progress-item.completed
        .progress-icon {
          border-color: #a87c2e;
          background: #a87c2e;
          color: #fff;
        }

        .progress-item.current
        .progress-icon {
          border-color: #d2aa5a;

          box-shadow:
            0 0 0 5px
            rgba(210,170,90,.13);
        }

        .progress-text {
          flex: 1;
          min-width: 0;
        }

        .progress-text strong {
          display: block;

          color: #443a31;
          font-size: 13px;
        }

        .progress-text span {
          display: block;

          margin-top: 2px;

          color: #9b8e81;
          font-size: 10px;
        }

        .progress-item.current
        .progress-text strong {
          color: #a1762b;
        }

        /* =====================================================
           PAYMENT
        ===================================================== */

        .payment-lines {
          display: grid;
          gap: 10px;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;

          color: #766c61;
          font-size: 13px;
        }

        .payment-row strong {
          color: #3b322a;
        }

        .payment-divider {
          height: 1px;
          margin: 5px 0;

          background: #e9e2d8;
        }

        .payment-total {
          padding: 13px;

          border-radius: 12px;

          background: #f8f3e9;

          color: #30271f;
          font-size: 17px;
        }

        .payment-balance {
          padding: 15px;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #30261c,
              #1d1711
            );

          color: #fff;
        }

        .payment-balance strong {
          color: #e1bd70;
          font-size: 20px;
        }

        /* =====================================================
           NOTES
        ===================================================== */

        .notes-card {
          margin-top: 18px;
        }

        .notes-content {
          margin: 0;
          padding: 15px;

          border-radius: 13px;

          background: #faf7f2;

          color: #665b50;

          line-height: 1.7;
          font-size: 13px;

          white-space: pre-wrap;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .track-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          margin-top: 18px;
        }

        .track-action {
          min-height: 48px;

          padding: 0 17px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          border-radius: 13px;

          border: 1px solid #dcd1c3;

          background: #fff;

          color: #40372f;

          font-weight: 800;

          cursor: pointer;
        }

        .track-action:hover {
          transform: translateY(-2px);
          border-color: #b38a43;
        }

        .track-action.primary {
          border-color: #9d7429;

          background:
            linear-gradient(
              135deg,
              #bd9140,
              #906820
            );

          color: #fff;

          box-shadow:
            0 9px 22px
            rgba(125,91,28,.17);
        }

        .track-action:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        /* =====================================================
           HELP
        ===================================================== */

        .track-help {
          margin-top: 23px;
          padding: 17px;

          border-radius: 15px;
          border: 1px solid #e5ddd2;

          background:
            rgba(255,255,255,.65);

          text-align: center;

          color: #918477;
          font-size: 11px;
          line-height: 1.6;
        }

        /* =====================================================
           ANIMATION
        ===================================================== */

        .track-spin {
          animation:
            trackSpin 1s linear infinite;
        }

        @keyframes trackSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes trackDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes trackUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {
          .track-grid {
            grid-template-columns: 1fr;
          }

          .progress-card {
            grid-row: auto;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 650px) {

          .track-page {
            padding: 28px 13px 60px;
          }

          .track-header {
            margin-bottom: 25px;
          }

          .track-title {
            font-size: 36px;
          }

          .track-description {
            font-size: 14px;
          }

          .track-search-card {
            padding: 17px;
            border-radius: 18px;
          }

          .track-search-row {
            grid-template-columns: 1fr;
          }

          .track-search-button {
            width: 100%;
          }

          .order-hero {
            padding: 23px 18px;
            border-radius: 21px;
          }

          .order-hero-top {
            flex-direction: column;
          }

          .current-status {
            align-self: flex-start;
          }

          .track-card {
            padding: 20px 16px;
            border-radius: 19px;
          }

          .details-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .track-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .track-action {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .track-header,
          .track-search-card,
          .track-result {
            animation: none;
          }

          .track-search-button,
          .track-action,
          .progress-icon {
            transition: none;
          }

          .track-spin {
            animation: none;
          }
        }

      `}</style>

      <main className="track-page">
        <div className="track-container">

          {/* HEADER */}

          <header className="track-header">

            <p className="track-eyebrow">
              <Sparkles size={14} />
              Murugan Goldsmith and Jewels
            </p>

            <h1 className="track-title display-font">
              Track Your Order
            </h1>

            <p className="track-description">
              Follow your jewellery order from
              the moment it is received through
              gold issue, making, polishing,
              quality check and delivery.
            </p>

          </header>

          {/* SEARCH */}

          <form
            className="track-search-card"
            onSubmit={searchOrder}
          >

            <label
              className="track-search-label"
              htmlFor="tracking-code"
            >
              <Search size={16} />
              Enter Tracking Code
            </label>

            <div className="track-search-row">

              <input
                id="tracking-code"
                className="track-input"
                type="text"
                placeholder="MGJ-CUS-1001"
                value={trackCode}
                onChange={(event) =>
                  setTrackCode(
                    event.target.value.toUpperCase()
                  )
                }
                autoComplete="off"
              />

              <button
                className="track-search-button"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <Loader2
                    size={17}
                    className="track-spin"
                  />
                ) : (
                  <Search size={17} />
                )}

                {loading
                  ? "Searching..."
                  : "Track Order"}

              </button>

            </div>

            <p className="track-example">
              Example: MGJ-CUS-1001
            </p>

          </form>

          {/* ERROR */}

          {error && (
            <div className="track-error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {/* ORDER */}

          {order && (
            <section className="track-result">

              {/* DARK HERO */}

              <div className="order-hero">

                <div className="order-hero-content">

                  <div className="order-hero-top">

                    <div>

                      <p className="order-label">
                        Order Tracking
                      </p>

                      <h2 className="order-code display-font">
                        {order.track_code}
                      </h2>

                    </div>

                    <div className="current-status">
                      <span className="status-live-dot" />
                      {order.status}
                    </div>

                  </div>

                  <div className="order-hero-bottom">

                    <div className="hero-mini">
                      <Gem size={15} />
                      {order.jewellery}
                    </div>

                    <div className="hero-mini">
                      <Package size={15} />
                      {order.purity}
                    </div>

                    <div className="hero-mini">
                      {Number(
                        order.weight_grams || 0
                      ).toFixed(3)}{" "}
                      g
                    </div>

                    <div className="hero-mini">
                      Delivery:{" "}
                      {formatDate(
                        order.delivery_date
                      )}
                    </div>

                  </div>

                </div>

              </div>

              {/* DETAILS + PROGRESS */}

              <div className="track-grid">

                {/* ORDER DETAILS */}

                <div className="track-card">

                  <div className="card-heading">

                    <div className="card-heading-icon">
                      <PackageCheck size={18} />
                    </div>

                    <div>
                      <h2>
                        Order Details
                      </h2>

                      <p>
                        Your jewellery order
                        information
                      </p>
                    </div>

                  </div>

                  <div className="details-grid">

                    <div className="detail-item">
                      <span className="detail-label">
                        Customer
                      </span>

                      <strong className="detail-value">
                        {order.customer_name || "-"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Mobile
                      </span>

                      <strong className="detail-value">
                        {order.customer_phone || "-"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Jewellery
                      </span>

                      <strong className="detail-value">
                        {order.jewellery || "-"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Purity
                      </span>

                      <strong className="detail-value">
                        {order.purity || "-"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Weight
                      </span>

                      <strong className="detail-value">
                        {Number(
                          order.weight_grams || 0
                        ).toFixed(3)}{" "}
                        g
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Gold Rate
                      </span>

                      <strong className="detail-value">
                        {money(
                          order.gold_rate
                        )} /g
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Order Date
                      </span>

                      <strong className="detail-value">
                        {formatDate(
                          order.order_date
                        )}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Delivery Date
                      </span>

                      <strong className="detail-value">
                        {formatDate(
                          order.delivery_date
                        )}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* PROGRESS */}

                <div className="track-card progress-card">

                  <div className="card-heading">

                    <div className="card-heading-icon">
                      <Truck size={18} />
                    </div>

                    <div>
                      <h2>
                        Order Progress
                      </h2>

                      <p>
                        Current production stage
                      </p>
                    </div>

                  </div>

                  <div className="progress-list">

                    {STATUSES.map(
                      (status, index) => {

                        const completed =
                          index <=
                          currentStatusIndex;

                        const current =
                          index ===
                          currentStatusIndex;

                        return (
                          <div
                            key={status}
                            className={
                              `progress-item ${
                                completed
                                  ? "completed"
                                  : ""
                              } ${
                                current
                                  ? "current"
                                  : ""
                              }`
                            }
                          >

                            <div className="progress-icon">

                              {completed ? (
                                <Check size={18} />
                              ) : index === 0 ? (
                                <Clock3 size={18} />
                              ) : index >= 5 ? (
                                <Truck size={18} />
                              ) : (
                                <Package size={18} />
                              )}

                            </div>

                            <div className="progress-text">

                              <strong>
                                {status}
                              </strong>

                              {current && (
                                <span>
                                  Current order
                                  status
                                </span>
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* PAYMENT */}

                <div className="track-card">

                  <div className="card-heading">

                    <div className="card-heading-icon">
                      <Gem size={18} />
                    </div>

                    <div>
                      <h2>
                        Payment Summary
                      </h2>

                      <p>
                        Current order amount
                      </p>
                    </div>

                  </div>

                  <div className="payment-lines">

                    <div className="payment-row">
                      <span>
                        Gold Value
                      </span>

                      <strong>
                        {money(
                          Number(
                            order.weight_grams || 0
                          ) *
                          Number(
                            order.gold_rate || 0
                          )
                        )}
                      </strong>
                    </div>

                    <div className="payment-row">
                      <span>
                        Making Charge
                      </span>

                      <strong>
                        {money(
                          order.making_charge
                        )}
                      </strong>
                    </div>

                    <div className="payment-row">
                      <span>
                        Stone Charge
                      </span>

                      <strong>
                        {money(
                          order.stone_charge
                        )}
                      </strong>
                    </div>

                    <div className="payment-row">
                      <span>
                        Other Charge
                      </span>

                      <strong>
                        {money(
                          order.other_charge
                        )}
                      </strong>
                    </div>

                    <div className="payment-divider" />

                    <div className="payment-row payment-total">
                      <span>
                        Total
                      </span>

                      <strong>
                        {money(
                          order.total_amount
                        )}
                      </strong>
                    </div>

                    <div className="payment-row">
                      <span>
                        Advance Paid
                      </span>

                      <strong>
                        {money(
                          order.advance_amount
                        )}
                      </strong>
                    </div>

                    <div className="payment-row payment-balance">
                      <span>
                        Balance
                      </span>

                      <strong>
                        {money(
                          order.balance_amount
                        )}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>

              {/* NOTES */}

              {order.notes && (
                <div className="track-card notes-card">

                  <div className="card-heading">

                    <div className="card-heading-icon">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <h2>
                        Design / Notes
                      </h2>

                      <p>
                        Special requirements
                        for this order
                      </p>
                    </div>

                  </div>

                  <p className="notes-content">
                    {order.notes}
                  </p>

                </div>
              )}

              {/* BUTTONS */}

              <div className="track-actions">

                <button
                  type="button"
                  className="track-action primary"
                  onClick={openWhatsApp}
                >
                  <MessageCircle size={17} />
                  Contact on WhatsApp
                </button>

                <button
                  type="button"
                  className="track-action"
                  onClick={refreshOrder}
                  disabled={loading}
                >

                  {loading ? (
                    <Loader2
                      size={17}
                      className="track-spin"
                    />
                  ) : (
                    <RefreshCw size={17} />
                  )}

                  Refresh Status

                </button>

                <button
                  type="button"
                  className="track-action"
                  onClick={copyTrackingCode}
                >

                  {copied ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <Copy size={17} />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy Tracking Code"}

                </button>

              </div>

              <div className="track-help">
                Your order status is connected
                to the shop order system. If you
                have any questions about your
                jewellery, please contact Murugan
                Goldsmith and Jewels through
                WhatsApp.
              </div>

            </section>
          )}

        </div>
      </main>
    </>
  );
}