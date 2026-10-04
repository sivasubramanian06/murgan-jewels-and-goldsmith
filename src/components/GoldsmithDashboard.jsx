import { useEffect, useMemo, useState } from "react";
import {
  Users,
  RefreshCw,
  Search,
  Package,
  Hammer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const GOLDSMITHS = [
  "Vignesh",
  "Vikki",
  "Ravi",
  "Sankar",
  "Karthik",
];

const STATUSES = [
  "Order Received",
  "Gold Issued",
  "Making",
  "Polishing",
  "Quality Check",
  "Ready",
  "Delivered",
];

function getToken() {
  return (
    sessionStorage.getItem("mgj-admin-token") ||
    localStorage.getItem("mgj-admin-token") ||
    ""
  );
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(
      `${String(value).slice(0, 10)}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function normalizeOrder(order) {
  return {
    id: order.id,
    dbId: order.id,
    orderCode: order.order_code || "-",
    trackCode: order.track_code || "-",
    customerName: order.customer_name || "-",
    phone: order.customer_phone || "",
    jewellery: order.jewellery || "-",
    purity: order.purity || "-",
    weight: Number(order.weight_grams || 0),
    goldsmith:
      order.goldsmith_name ||
      order.goldsmith ||
      "",
    status: order.status || "Order Received",
    deliveryDate: order.delivery_date || null,
    goldIssued: Number(order.gold_issued_grams || 0),
    goldReturned: Number(
      order.gold_returned_grams || 0
    ),
    wastage: Number(order.wastage_grams || 0),
    total: Number(order.total_amount || 0),
  };
}

export default function GoldsmithDashboard({
  onOpenOrder,
}) {
  const [orders, setOrders] = useState([]);

  const [selectedGoldsmith, setSelectedGoldsmith] =
    useState("All");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [updatingOrder, setUpdatingOrder] =
    useState(null);

  const [goldUpdatingOrder, setGoldUpdatingOrder] =
    useState(null);

  const [goldValues, setGoldValues] = useState({});

  async function apiRequest(url, options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Admin login session not found. Please login again."
      );
    }

    let response;

    try {
      response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw new Error(
        "Unable to connect to the MGJ backend."
      );
    }

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Server error: ${response.status}`
      );
    }

    return data;
  }

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        `${API_BASE_URL}/api/orders`
      );

      const list = Array.isArray(data.data)
        ? data.data.map(normalizeOrder)
        : [];

      setOrders(list);

      const initialGold = {};

      list.forEach((order) => {
        initialGold[order.dbId] = {
          issued: order.goldIssued,
          returned: order.goldReturned,
          wastage: order.wastage,
        };
      });

      setGoldValues(initialGold);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load goldsmith orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const assignedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.goldsmith
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = [...assignedOrders];

    if (selectedGoldsmith !== "All") {
      result = result.filter(
        (order) =>
          order.goldsmith.toLowerCase() ===
          selectedGoldsmith.toLowerCase()
      );
    }

    if (selectedStatus !== "All") {
      result = result.filter(
        (order) =>
          order.status === selectedStatus
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((order) => {
        return [
          order.orderCode,
          order.trackCode,
          order.customerName,
          order.phone,
          order.jewellery,
          order.goldsmith,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }

    return result;
  }, [
    assignedOrders,
    selectedGoldsmith,
    selectedStatus,
    search,
  ]);

  const stats = useMemo(() => {
    return {
      total: assignedOrders.length,

      making: assignedOrders.filter(
        (order) => order.status === "Making"
      ).length,

      polishing: assignedOrders.filter(
        (order) => order.status === "Polishing"
      ).length,

      quality: assignedOrders.filter(
        (order) =>
          order.status === "Quality Check"
      ).length,

      ready: assignedOrders.filter(
        (order) => order.status === "Ready"
      ).length,
    };
  }, [assignedOrders]);

  function getNextStatus(currentStatus) {
    const index =
      STATUSES.indexOf(currentStatus);

    if (index < 0) return null;

    if (index >= STATUSES.length - 1) {
      return null;
    }

    return STATUSES[index + 1];
  }

  async function updateStatus(order) {
    const nextStatus = getNextStatus(
      order.status
    );

    if (!nextStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Move ${order.orderCode} from "${order.status}" to "${nextStatus}"?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingOrder(order.dbId);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `${API_BASE_URL}/api/admin/orders/${order.dbId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      setOrders((previous) =>
        previous.map((item) =>
          item.dbId === order.dbId
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      setSuccess(
        `${order.orderCode} moved to ${nextStatus}.`
      );

      setTimeout(
        () => setSuccess(""),
        3000
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  function updateGoldField(
    orderId,
    field,
    value
  ) {
    setGoldValues((previous) => ({
      ...previous,
      [orderId]: {
        ...(previous[orderId] || {}),
        [field]: value,
      },
    }));
  }

  async function saveGold(order) {
    const values =
      goldValues[order.dbId] || {};

    const issued = Number(
      values.issued ?? order.goldIssued
    );

    const returned = Number(
      values.returned ?? order.goldReturned
    );

    const wastage = Number(
      values.wastage ?? order.wastage
    );

    if (
      issued < 0 ||
      returned < 0 ||
      wastage < 0
    ) {
      setError(
        "Gold values cannot be negative."
      );

      return;
    }

    if (returned > issued) {
      setError(
        "Gold returned cannot be greater than gold issued."
      );

      return;
    }

    setGoldUpdatingOrder(order.dbId);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `${API_BASE_URL}/api/admin/orders/${order.dbId}/gold`,
        {
          method: "PATCH",
          body: JSON.stringify({
            goldIssued: issued,
            goldReturned: returned,
            wastage,
          }),
        }
      );

      setOrders((previous) =>
        previous.map((item) =>
          item.dbId === order.dbId
            ? {
                ...item,
                goldIssued: issued,
                goldReturned: returned,
                wastage,
              }
            : item
        )
      );

      setSuccess(
        `${order.orderCode} gold details updated.`
      );

      setTimeout(
        () => setSuccess(""),
        3000
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to update gold details."
      );
    } finally {
      setGoldUpdatingOrder(null);
    }
  }

  return (
    <div className="goldsmith-dashboard">
      <style>{`
        .goldsmith-dashboard {
          width: 100%;
          padding: 20px;
          box-sizing: border-box;
          color: #1f2937;
          background: #f7f4ed;
          min-height: 600px;
        }

        .gs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          padding: 24px;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            #1f1710,
            #4b351b
          );
          color: white;
        }

        .gs-header h2 {
          margin: 0;
          font-size: 28px;
        }

        .gs-header p {
          margin: 7px 0 0;
          opacity: .75;
          font-size: 13px;
        }

        .gs-refresh {
          border: 0;
          border-radius: 10px;
          padding: 10px 15px;
          cursor: pointer;
          background: #d4af37;
          color: #17120c;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .gs-message {
          padding: 12px 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          font-size: 13px;
        }

        .gs-error {
          background: #fff0f0;
          border: 1px solid #efb5b5;
          color: #a12626;
        }

        .gs-success {
          background: #eefaf1;
          border: 1px solid #b7dfc0;
          color: #26743a;
        }

        .gs-stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .gs-stat {
          background: white;
          border: 1px solid #e7dfcf;
          border-radius: 14px;
          padding: 15px;
        }

        .gs-stat-label {
          font-size: 11px;
          color: #7b7061;
        }

        .gs-stat-value {
          margin-top: 5px;
          font-size: 25px;
          font-weight: 800;
        }

        .gs-toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .gs-search {
          flex: 1;
          min-width: 220px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: white;
          border: 1px solid #ded5c4;
          border-radius: 10px;
        }

        .gs-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
        }

        .gs-select {
          border: 1px solid #ded5c4;
          border-radius: 10px;
          padding: 10px;
          background: white;
          min-width: 170px;
        }

        .gs-team {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .gs-person {
          border: 1px solid #e1d7c6;
          background: white;
          border-radius: 13px;
          padding: 13px;
          cursor: pointer;
          text-align: left;
        }

        .gs-person.active {
          border-color: #c39a25;
          box-shadow:
            0 0 0 2px
            rgba(195,154,37,.12);
        }

        .gs-person strong {
          display: block;
          margin-bottom: 4px;
        }

        .gs-person span {
          font-size: 11px;
          color: #777;
        }

        .gs-orders {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .gs-order {
          background: white;
          border: 1px solid #e4dccd;
          border-radius: 15px;
          padding: 15px;
        }

        .gs-order-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .gs-order-code {
          font-weight: 800;
          font-size: 13px;
        }

        .gs-status {
          font-size: 10px;
          padding: 5px 8px;
          border-radius: 20px;
          background: #f1eadb;
          white-space: nowrap;
        }

        .gs-customer {
          font-weight: 700;
          margin-bottom: 4px;
        }

        .gs-jewellery {
          font-size: 12px;
          color: #71685d;
          margin-bottom: 12px;
        }

        .gs-info {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 7px;
          margin-bottom: 12px;
        }

        .gs-info div {
          background: #faf8f3;
          border-radius: 8px;
          padding: 8px;
        }

        .gs-info small {
          display: block;
          color: #81786d;
          font-size: 9px;
        }

        .gs-info strong {
          display: block;
          margin-top: 2px;
          font-size: 12px;
        }

        .gs-gold-box {
          border-top: 1px solid #eee7db;
          padding-top: 12px;
          margin-top: 10px;
        }

        .gs-gold-title {
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .gs-gold-fields {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 6px;
        }

        .gs-gold-fields label {
          font-size: 9px;
          color: #777;
        }

        .gs-gold-fields input {
          width: 100%;
          box-sizing: border-box;
          margin-top: 4px;
          padding: 7px 5px;
          border: 1px solid #ddd4c5;
          border-radius: 7px;
          outline: 0;
        }

        .gs-button {
          width: 100%;
          border: 0;
          border-radius: 9px;
          padding: 9px;
          margin-top: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .gs-save {
          background: #f0e1b1;
          color: #5a430d;
        }

        .gs-next {
          background: #251b11;
          color: white;
        }

        .gs-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .gs-empty {
          background: white;
          border: 1px dashed #d7cdbd;
          border-radius: 14px;
          padding: 45px;
          text-align: center;
          color: #777;
        }

        .gs-loading {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 18px;
          color: #777;
        }

        @media (max-width: 1100px) {
          .gs-stats {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .gs-team {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .gs-orders {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .goldsmith-dashboard {
            padding: 10px;
          }

          .gs-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .gs-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .gs-team {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .gs-orders {
            grid-template-columns: 1fr;
          }

          .gs-gold-fields {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="gs-header">
        <div>
          <h2>Goldsmith Work</h2>
          <p>
            Production management for Vignesh,
            Vikki, Ravi, Sankar and Karthik.
          </p>
        </div>

        <button
          className="gs-refresh"
          type="button"
          onClick={loadOrders}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="gs-message gs-error">
          <AlertTriangle
            size={15}
            style={{
              verticalAlign: "middle",
              marginRight: 6,
            }}
          />
          {error}
        </div>
      )}

      {success && (
        <div className="gs-message gs-success">
          <CheckCircle2
            size={15}
            style={{
              verticalAlign: "middle",
              marginRight: 6,
            }}
          />
          {success}
        </div>
      )}

      {loading ? (
        <div className="gs-loading">
          Loading Goldsmith Work...
        </div>
      ) : (
        <>
          <div className="gs-stats">
            <div className="gs-stat">
              <div className="gs-stat-label">
                Assigned Orders
              </div>
              <div className="gs-stat-value">
                {stats.total}
              </div>
            </div>

            <div className="gs-stat">
              <div className="gs-stat-label">
                Making
              </div>
              <div className="gs-stat-value">
                {stats.making}
              </div>
            </div>

            <div className="gs-stat">
              <div className="gs-stat-label">
                Polishing
              </div>
              <div className="gs-stat-value">
                {stats.polishing}
              </div>
            </div>

            <div className="gs-stat">
              <div className="gs-stat-label">
                Quality Check
              </div>
              <div className="gs-stat-value">
                {stats.quality}
              </div>
            </div>

            <div className="gs-stat">
              <div className="gs-stat-label">
                Ready
              </div>
              <div className="gs-stat-value">
                {stats.ready}
              </div>
            </div>
          </div>

          <div className="gs-toolbar">
            <div className="gs-search">
              <Search size={15} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customer, order or jewellery..."
              />
            </div>

            <select
              className="gs-select"
              value={selectedGoldsmith}
              onChange={(event) =>
                setSelectedGoldsmith(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Goldsmiths
              </option>

              {GOLDSMITHS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              className="gs-select"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="gs-team">
            {GOLDSMITHS.map((name) => {
              const count =
                assignedOrders.filter(
                  (order) =>
                    order.goldsmith.toLowerCase() ===
                    name.toLowerCase()
                ).length;

              return (
                <button
                  key={name}
                  type="button"
                  className={`gs-person ${
                    selectedGoldsmith === name
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedGoldsmith(
                      selectedGoldsmith === name
                        ? "All"
                        : name
                    )
                  }
                >
                  <Users
                    size={16}
                    style={{
                      marginBottom: 7,
                    }}
                  />

                  <strong>{name}</strong>

                  <span>
                    {count} assigned order
                    {count === 1 ? "" : "s"}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="gs-empty">
              <Package
                size={28}
                style={{ marginBottom: 10 }}
              />

              <div>
                No assigned orders found.
              </div>

              <small>
                Assign a goldsmith to an order from
                Customer Orders.
              </small>
            </div>
          ) : (
            <div className="gs-orders">
              {filteredOrders.map((order) => {
                const values =
                  goldValues[order.dbId] || {};

                const nextStatus =
                  getNextStatus(order.status);

                return (
                  <div
                    className="gs-order"
                    key={order.dbId}
                  >
                    <div className="gs-order-head">
                      <span className="gs-order-code">
                        {order.orderCode}
                      </span>

                      <span className="gs-status">
                        {order.status}
                      </span>
                    </div>

                    <div className="gs-customer">
                      {order.customerName}
                    </div>

                    <div className="gs-jewellery">
                      {order.jewellery}
                    </div>

                    <div className="gs-info">
                      <div>
                        <small>Goldsmith</small>
                        <strong>
                          {order.goldsmith}
                        </strong>
                      </div>

                      <div>
                        <small>Weight</small>
                        <strong>
                          {order.weight.toFixed(3)} g
                        </strong>
                      </div>

                      <div>
                        <small>Purity</small>
                        <strong>
                          {order.purity}
                        </strong>
                      </div>

                      <div>
                        <small>Delivery</small>
                        <strong>
                          {formatDate(
                            order.deliveryDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>Total</small>
                        <strong>
                          {money(order.total)}
                        </strong>
                      </div>

                      <div>
                        <small>Track Code</small>
                        <strong>
                          {order.trackCode}
                        </strong>
                      </div>
                    </div>

                    <div className="gs-gold-box">
                      <div className="gs-gold-title">
                        Gold Control
                      </div>

                      <div className="gs-gold-fields">
                        <label>
                          Issued
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={
                              values.issued ??
                              order.goldIssued
                            }
                            onChange={(event) =>
                              updateGoldField(
                                order.dbId,
                                "issued",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label>
                          Returned
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={
                              values.returned ??
                              order.goldReturned
                            }
                            onChange={(event) =>
                              updateGoldField(
                                order.dbId,
                                "returned",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label>
                          Wastage
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={
                              values.wastage ??
                              order.wastage
                            }
                            onChange={(event) =>
                              updateGoldField(
                                order.dbId,
                                "wastage",
                                event.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="gs-button gs-save"
                        disabled={
                          goldUpdatingOrder ===
                          order.dbId
                        }
                        onClick={() =>
                          saveGold(order)
                        }
                      >
                        {goldUpdatingOrder ===
                        order.dbId
                          ? "Saving..."
                          : "Save Gold Details"}
                      </button>
                    </div>

                    {nextStatus ? (
                      <button
                        type="button"
                        className="gs-button gs-next"
                        disabled={
                          updatingOrder ===
                          order.dbId
                        }
                        onClick={() =>
                          updateStatus(order)
                        }
                      >
                        {updatingOrder ===
                        order.dbId
                          ? "Updating..."
                          : `Move to ${nextStatus}`}
                      </button>
                    ) : (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 9,
                          textAlign: "center",
                          background: "#eef8ef",
                          color: "#347442",
                          borderRadius: 9,
                          fontSize: 11,
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          style={{
                            verticalAlign:
                              "middle",
                            marginRight: 5,
                          }}
                        />
                        Production completed
                      </div>
                    )}

                    {onOpenOrder && (
                      <button
                        type="button"
                        className="gs-button"
                        style={{
                          background: "#f4f1eb",
                          color: "#4b4035",
                        }}
                        onClick={() =>
                          onOpenOrder(order)
                        }
                      >
                        View Order
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}