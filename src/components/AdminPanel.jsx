import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Coins,
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
  Save,
  WalletCards,
  ContactRound,
  ClipboardList,
  AlertTriangle,
  Truck,
  Eye,
  RotateCcw,
} from "lucide-react";

import {
  CATEGORIES,
  AVAILABILITY,
  emptyProduct,
} from "../data/seedProducts";

import { Price } from "./ProductCard";

const API_BASE_URL = "http://10.68.27.201:5000";

const STATUSES = [
  "Order Received",
  "Gold Issued",
  "Making",
  "Polishing",
  "Quality Check",
  "Ready",
  "Delivered",
];

const INITIAL_GOLDSMITHS = [
  { id: 1, name: "Ravi", phone: "", active: true },
  { id: 2, name: "Kumar", phone: "", active: true },
  { id: 3, name: "Mani", phone: "", active: true },
  { id: 4, name: "Suresh", phone: "", active: true },
  { id: 5, name: "Muthu", phone: "", active: true },
];

const today = () => new Date().toISOString().slice(0, 10);

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const fmtDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "-";
  }
};

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) return digits;

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return "";
};

const getToken = () =>
  sessionStorage.getItem("mgj-admin-token");

const handleUnauthorized = (onLogout) => {
  sessionStorage.removeItem("mgj-admin-token");
  sessionStorage.removeItem("mgj-admin-auth");

  alert("Your admin session has expired. Please login again.");

  if (onLogout) {
    onLogout();
  }
};

const adminFetch = async (url, options = {}, onLogout) => {
  const token = getToken();

  if (!token) {
    handleUnauthorized(onLogout);
    throw new Error("Admin session expired");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401 || response.status === 403) {
    handleUnauthorized(onLogout);
    throw new Error("Admin session expired");
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || "Server request failed"
    );
  }

  return data;
};

const openWhatsAppForOrder = (order) => {
  const phone = normalizePhone(order.phone);

  if (!phone) {
    alert("Customer mobile number is missing or invalid.");
    return;
  }

  const message = `
Vanakkam ${order.customer} 🙏

Your jewellery order has been registered successfully.

🏪 Murugan Goldsmith and Jewels
📍 Kuruvikulam
📞 9789481246

━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━

Order No: ${order.id}
Track Code: ${order.trackCode}
Jewellery: ${order.jewellery}
Weight: ${order.weight} g
Goldsmith: ${order.goldsmith || "To be assigned"}
Delivery Date: ${fmtDate(order.deliveryDate)}
Status: ${order.status}

━━━━━━━━━━━━━━━━━━

Please keep your Track Code safely.

Thank you 🙏
`.trim();

  const url =
    `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};

function Field({ label, children }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "default",
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={18} />
      </div>

      <div>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
      </div>
    </div>
  );
}

function Status({ value }) {
  return (
    <span
      className={`status ${String(value || "")
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {value || "-"}
    </span>
  );
}

function mapApiOrder(row) {
  return {
    dbId: row.id,

    id:
      row.order_code ||
      `MGJ-ORD-${1000 + Number(row.id || 0)}`,

    trackCode: row.track_code || "",

    customer: row.customer_name || "",

    phone: row.customer_phone || "",

    jewellery: row.jewellery || "",

    category: row.category || "",

    purity: row.purity || "22K",

    weight: Number(row.weight_grams || 0),

    goldsmith: row.goldsmith_name || "",

    goldsmithId: row.goldsmith_id || null,

    deliveryDate: row.delivery_date
      ? String(row.delivery_date).slice(0, 10)
      : "",

    orderDate: row.order_date
      ? String(row.order_date).slice(0, 10)
      : "",

    status: row.status || "Order Received",

    advance: Number(row.advance_amount || 0),

    total: Number(row.total_amount || 0),

    balance: Number(row.balance_amount || 0),

    goldIssued: Number(row.gold_issued_grams || 0),

    goldReturned: Number(row.gold_returned_grams || 0),

    wastage: Number(row.wastage_grams || 0),

    makingCharge: Number(row.making_charge || 0),

    goldRateAtOrder: Number(row.gold_rate || 0),

    stoneCharge: Number(row.stone_charge || 0),

    otherCharge: Number(row.other_charge || 0),

    notes: row.notes || "",
  };
}

export default function AdminPanel({
  products,
  setProducts,
  rates,
  setRates,
  onLogout,
}) {
  const [tab, setTab] = useState("dashboard");

  /* =========================================================
     ORDERS - POSTGRESQL
  ========================================================= */

  const [orders, setOrders] = useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [ordersError, setOrdersError] =
    useState("");

  /* =========================================================
     OTHER LOCAL MODULES
  ========================================================= */

  const [goldsmiths, setGoldsmiths] = useState([]);

  const [goldsmithsLoading, setGoldsmithsLoading] =
    useState(false);

  const [goldsmithsError, setGoldsmithsError] =
    useState("");

  const [customers, setCustomers] = useState([]);

  const [payments, setPayments] = useState([]);

  const [query, setQuery] = useState("");

  /* =========================================================
     ORDER UI
  ========================================================= */

  const [showOrderForm, setShowOrderForm] =
    useState(false);

  const [editingOrder, setEditingOrder] =
    useState(null);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [orderSaving, setOrderSaving] =
    useState(false);

  const [showGoldsmithForm, setShowGoldsmithForm] =
    useState(false);

  const [showProductForm, setShowProductForm] =
    useState(false);

  /* =========================================================
     GOLDSMITH
  ========================================================= */

  const [goldsmithForm, setGoldsmithForm] =
    useState({
      id: null,
      name: "",
      phone: "",
      active: true,
    });

  /* =========================================================
     PRODUCT
  ========================================================= */

  const [draft, setDraft] =
    useState(emptyProduct);

  /* =========================================================
     GOLD RATES
  ========================================================= */

  const [rateDraft, setRateDraft] =
    useState({
      gold22k: rates?.gold22k ?? "",
      gold18k: rates?.gold18k ?? "",
      silver: rates?.silver ?? "",
    });

  const [ratesLoading, setRatesLoading] =
    useState(false);

  const [ratesSaving, setRatesSaving] =
    useState(false);

  /* =========================================================
     PAYMENT
  ========================================================= */

  const [paymentForm, setPaymentForm] =
    useState({
      orderId: "",
      amount: "",
      method: "Cash",
      note: "",
    });

  /* =========================================================
     ORDER FORM
  ========================================================= */

  const blankOrder = () => ({
    customer: "",
    phone: "",
    jewellery: "",
    purity: "22K",
    weight: "",
    goldsmith: "",
    deliveryDate: today(),
    advance: "",
    total: "",
    goldIssued: "",
    goldReturned: "",
    wastage: "",
    makingCharge: "",
    goldRateAtOrder: "",
    stoneCharge: "",
    otherCharge: "",
    notes: "",
    status: "Order Received",
    trackCode: "",
  });

  const [orderForm, setOrderForm] =
    useState(blankOrder());

  /* =========================================================
     LOAD ORDERS
  ========================================================= */

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const data = await adminFetch(
        `${API_BASE_URL}/api/orders`,
        {
          method: "GET",
        },
        onLogout
      );

      const nextOrders = Array.isArray(data.data)
        ? data.data.map(mapApiOrder)
        : [];

      setOrders(nextOrders);
    } catch (error) {
      console.error("❌ Load orders error:", error);

      setOrdersError(
        error.message || "Unable to load orders"
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* =========================================================
     LOAD GOLDSMITHS - POSTGRESQL
  ========================================================= */

  const loadGoldsmiths = async () => {
    setGoldsmithsLoading(true);
    setGoldsmithsError("");

    try {
      const data = await adminFetch(
        `${API_BASE_URL}/api/admin/goldsmiths`,
        { method: "GET" },
        onLogout
      );

      const nextGoldsmiths = Array.isArray(data.data)
        ? data.data.map((item) => ({
            id: Number(item.id),
            name: item.name || "",
            phone: item.phone || "",
            active: Boolean(item.active),
          }))
        : [];

      setGoldsmiths(nextGoldsmiths);
    } catch (error) {
      console.error("❌ Load goldsmiths error:", error);
      setGoldsmithsError(
        error.message || "Unable to load goldsmiths"
      );
    } finally {
      setGoldsmithsLoading(false);
    }
  };

  useEffect(() => {
    loadGoldsmiths();
  }, []);

  /* =========================================================
     LOAD GOLD RATES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadRates = async () => {
      setRatesLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/gold-rates`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load gold rates"
          );
        }

        if (!cancelled && data.data) {
          const nextRates = {
            gold22k:
              Number(data.data.gold_22k_rate) || 0,

            gold18k:
              Number(data.data.gold_18k_rate) || 0,

            silver:
              Number(data.data.silver_rate) || 0,
          };

          setRates(nextRates);
          setRateDraft(nextRates);
        }
      } catch (error) {
        console.error(
          "❌ Gold rate loading error:",
          error
        );
      } finally {
        if (!cancelled) {
          setRatesLoading(false);
        }
      }
    };

    loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     GOLD RATE BASED ON PURITY
  ========================================================= */

  const selectedGoldRate =
    orderForm.purity === "18K"
      ? Number(rates?.gold18k || 0)
      : Number(rates?.gold22k || 0);

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const calculatedOrder = useMemo(() => {
    const weight =
      Number(orderForm.weight) || 0;

    const goldRate =
      Number(
        orderForm.goldRateAtOrder ||
          selectedGoldRate
      ) || 0;

    const makingRate =
      Number(orderForm.makingCharge) || 0;

    const stone =
      Number(orderForm.stoneCharge) || 0;

    const other =
      Number(orderForm.otherCharge) || 0;

    const advance =
      Number(orderForm.advance) || 0;

    const goldValue =
      weight * goldRate;

    const makingAmount =
      weight * makingRate;

    const total =
      goldValue +
      makingAmount +
      stone +
      other;

    const balance =
      Math.max(0, total - advance);

    return {
      weight,
      goldRate,
      makingRate,
      makingAmount,
      stone,
      other,
      advance,
      goldValue,
      total,
      balance,
    };
  }, [
    orderForm.weight,
    orderForm.goldRateAtOrder,
    orderForm.makingCharge,
    orderForm.stoneCharge,
    orderForm.otherCharge,
    orderForm.advance,
    selectedGoldRate,
  ]);

  /* =========================================================
     DASHBOARD
  ========================================================= */

  const todayOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.deliveryDate === today() &&
          o.status !== "Delivered"
      ),
    [orders]
  );

  const delayedOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.deliveryDate &&
          o.deliveryDate < today() &&
          o.status !== "Delivered"
      ),
    [orders]
  );

  const readyOrders = orders.filter(
    (o) => o.status === "Ready"
  );

  const productionOrders = orders.filter(
    (o) =>
      !["Ready", "Delivered"].includes(
        o.status
      )
  );

  const totalSales = orders
    .filter((o) => o.status === "Delivered")
    .reduce(
      (sum, o) =>
        sum + Number(o.total || 0),
      0
    );

  const pendingBalance = orders
    .filter((o) => o.status !== "Delivered")
    .reduce(
      (sum, o) =>
        sum +
        Math.max(
          0,
          Number(o.total || 0) -
            Number(o.advance || 0)
        ),
      0
    );

  const activeGoldsmiths =
    goldsmiths.filter(
      (g) => g.active
    );

  /* =========================================================
     NEW ORDER
  ========================================================= */

  const openNewOrder = () => {
    setEditingOrder(null);

    setOrderForm({
      ...blankOrder(),
      goldRateAtOrder:
        selectedGoldRate || "",
    });

    setShowOrderForm(true);
    setTab("orders");
  };

  /* =========================================================
     EDIT ORDER
  ========================================================= */

  const openEditOrder = (order) => {
    setEditingOrder(order.dbId);

    setOrderForm({
      ...blankOrder(),

      ...order,

      customer:
        order.customer || "",

      phone:
        order.phone || "",

      purity:
        order.purity || "22K",

      weight:
        order.weight ?? "",

      advance:
        order.advance ?? "",

      total:
        order.total ?? "",

      goldIssued:
        order.goldIssued ?? "",

      goldReturned:
        order.goldReturned ?? "",

      wastage:
        order.wastage ?? "",

      makingCharge:
        order.makingCharge ?? "",

      goldRateAtOrder:
        order.goldRateAtOrder || "",

      stoneCharge:
        order.stoneCharge ?? "",

      otherCharge:
        order.otherCharge ?? "",

      deliveryDate:
        order.deliveryDate || today(),

      status:
        order.status || "Order Received",

      notes:
        order.notes || "",
    });

    setShowOrderForm(true);
  };

  /* =========================================================
     CREATE / UPDATE ORDER
  ========================================================= */

  const saveOrder = async (event) => {
    event.preventDefault();

    if (orderSaving) return;

    const customer =
      orderForm.customer.trim();

    const phone =
      normalizePhone(orderForm.phone);

    const jewellery =
      orderForm.jewellery.trim();

    if (!customer) {
      alert("Please enter customer name.");
      return;
    }

    if (!phone) {
      alert(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (!jewellery) {
      alert("Please enter jewellery name.");
      return;
    }

    if (
      calculatedOrder.weight <= 0
    ) {
      alert(
        "Please enter valid jewellery weight."
      );
      return;
    }

    if (
      calculatedOrder.goldRate <= 0
    ) {
      alert(
        "Gold rate is not available."
      );
      return;
    }

    if (!orderForm.deliveryDate) {
      alert(
        "Please select delivery date."
      );
      return;
    }

    const payload = {
      customerName: customer,

      phone,

      jewellery,

      purity:
        orderForm.purity || "22K",

      weight:
        calculatedOrder.weight,

      goldRate:
        calculatedOrder.goldRate,

      makingCharge:
        calculatedOrder.makingRate,

      advance:
        calculatedOrder.advance,

      deliveryDate:
        orderForm.deliveryDate || null,

      status:
        orderForm.status ||
        "Order Received",

      goldIssued:
        Number(orderForm.goldIssued) || 0,

      goldReturned:
        Number(orderForm.goldReturned) || 0,

      wastage:
        Number(orderForm.wastage) || 0,

      notes:
        orderForm.notes.trim() || "",
    };

    setOrderSaving(true);

    try {
      let data;

      if (editingOrder) {
        data = await adminFetch(
          `${API_BASE_URL}/api/admin/orders/${editingOrder}`,
          {
            method: "PUT",
            body: JSON.stringify(
              payload
            ),
          },
          onLogout
        );

        alert(
          "Customer order updated successfully."
        );
      } else {
        data = await adminFetch(
          `${API_BASE_URL}/api/admin/orders`,
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          },
          onLogout
        );

        alert(
          "Customer order created successfully."
        );
      }

      setShowOrderForm(false);
      setEditingOrder(null);

      setOrderForm(blankOrder());

      await loadOrders();

      const savedOrderId =
        Number(data?.data?.order?.id || editingOrder || 0);

      const selectedGoldsmith =
        goldsmiths.find(
          (goldsmith) =>
            goldsmith.name === orderForm.goldsmith
        );

      if (savedOrderId > 0) {
        await adminFetch(
          `${API_BASE_URL}/api/admin/orders/${savedOrderId}/goldsmith`,
          {
            method: "PATCH",
            body: JSON.stringify({
              goldsmithId: selectedGoldsmith
                ? selectedGoldsmith.id
                : null,
            }),
          },
          onLogout
        );
      }

      if (
        !editingOrder &&
        data?.data?.order
      ) {
        const saved =
          mapApiOrder(
            data.data.order
          );

        setTimeout(() => {
          openWhatsAppForOrder(
            saved
          );
        }, 300);
      }
    } catch (error) {
      console.error(
        "❌ Save order error:",
        error
      );

      alert(
        error.message ||
          "Unable to save customer order."
      );
    } finally {
      setOrderSaving(false);
    }
  };

  /* =========================================================
     STATUS UPDATE
  ========================================================= */

  const updateStatus = async (
    order,
    status
  ) => {
    try {
      await adminFetch(
        `${API_BASE_URL}/api/admin/orders/${order.dbId}/status`,
        {
          method: "PATCH",

          body: JSON.stringify({
            status,
          }),
        },
        onLogout
      );

      setOrders((previous) =>
        previous.map((item) =>
          item.dbId === order.dbId
            ? {
                ...item,
                status,
              }
            : item
        )
      );

      setSelectedOrder((previous) =>
        previous &&
        previous.dbId === order.dbId
          ? {
              ...previous,
              status,
            }
          : previous
      );
    } catch (error) {
      console.error(
        "❌ Status update error:",
        error
      );

      alert(
        error.message ||
          "Unable to update status."
      );
    }
  };

  /* =========================================================
     GOLD UPDATE
  ========================================================= */

  const updateGold = async (
    order,
    patch
  ) => {
    try {
      const data =
        await adminFetch(
          `${API_BASE_URL}/api/admin/orders/${order.dbId}/gold`,
          {
            method: "PATCH",

            body: JSON.stringify({
              goldIssued:
                patch.goldIssued ??
                order.goldIssued,

              goldReturned:
                patch.goldReturned ??
                order.goldReturned,

              wastage:
                patch.wastage ??
                order.wastage,
            }),
          },
          onLogout
        );

      const updated =
        mapApiOrder(
          data.data
        );

      setOrders((previous) =>
        previous.map((item) =>
          item.dbId === order.dbId
            ? {
                ...item,
                ...updated,
              }
            : item
        )
      );

      setSelectedOrder(
        updated
      );
    } catch (error) {
      console.error(
        "❌ Gold update error:",
        error
      );

      alert(
        error.message ||
          "Unable to update gold details."
      );
    }
  };

  /* =========================================================
     DELETE ORDER
  ========================================================= */

  const deleteOrder = async (
    order
  ) => {
    const confirmed =
      window.confirm(
        `Delete order ${order.id}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    try {
      await adminFetch(
        `${API_BASE_URL}/api/admin/orders/${order.dbId}`,
        {
          method: "DELETE",
        },
        onLogout
      );

      setOrders((previous) =>
        previous.filter(
          (item) =>
            item.dbId !== order.dbId
        )
      );

      setSelectedOrder(null);

      alert(
        "Order deleted successfully."
      );
    } catch (error) {
      console.error(
        "❌ Delete order error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete order."
      );
    }
  };

  /* =========================================================
     GOLD RATES
  ========================================================= */

  const saveRates = async (
    event
  ) => {
    event.preventDefault();

    const gold22k =
      Number(rateDraft.gold22k);

    const gold18k =
      Number(rateDraft.gold18k);

    const silver =
      Number(rateDraft.silver);

    if (
      !Number.isFinite(gold22k) ||
      gold22k <= 0
    ) {
      alert(
        "Please enter a valid 22K gold rate."
      );
      return;
    }

    if (
      !Number.isFinite(gold18k) ||
      gold18k <= 0
    ) {
      alert(
        "Please enter a valid 18K gold rate."
      );
      return;
    }

    if (
      !Number.isFinite(silver) ||
      silver <= 0
    ) {
      alert(
        "Please enter a valid silver rate."
      );
      return;
    }

    setRatesSaving(true);

    try {
      const data =
        await adminFetch(
          `${API_BASE_URL}/api/gold-rates`,
          {
            method: "POST",

            body: JSON.stringify({
              gold22kRate:
                gold22k,

              gold18kRate:
                gold18k,

              silverRate:
                silver,
            }),
          },
          onLogout
        );

      const saved =
        data.data;

      const nextRates = {
        gold22k:
          Number(
            saved.gold_22k_rate
          ) || 0,

        gold18k:
          Number(
            saved.gold_18k_rate
          ) || 0,

        silver:
          Number(
            saved.silver_rate
          ) || 0,
      };

      setRates(nextRates);
      setRateDraft(nextRates);

      alert(
        "Today's gold and silver rates saved successfully."
      );
    } catch (error) {
      console.error(
        "❌ Gold rate save error:",
        error
      );

      alert(
        error.message ||
          "Unable to save gold rates."
      );
    } finally {
      setRatesSaving(false);
    }
  };

  /* =========================================================
     GOLDSMITH - POSTGRESQL
  ========================================================= */

  const saveGoldsmith = async (event) => {
    event.preventDefault();

    const name = goldsmithForm.name.trim();

    if (!name) {
      alert("Please enter goldsmith name.");
      return;
    }

    const payload = {
      name,
      phone: String(goldsmithForm.phone || "").trim(),
      active: Boolean(goldsmithForm.active),
    };

    try {
      const data = goldsmithForm.id
        ? await adminFetch(
            `${API_BASE_URL}/api/admin/goldsmiths/${goldsmithForm.id}`,
            {
              method: "PUT",
              body: JSON.stringify(payload),
            },
            onLogout
          )
        : await adminFetch(
            `${API_BASE_URL}/api/admin/goldsmiths`,
            {
              method: "POST",
              body: JSON.stringify(payload),
            },
            onLogout
          );

      const saved = data.data;

      const normalized = {
        id: Number(saved.id),
        name: saved.name || "",
        phone: saved.phone || "",
        active: Boolean(saved.active),
      };

      setGoldsmiths((previous) =>
        goldsmithForm.id
          ? previous.map((item) =>
              item.id === normalized.id
                ? normalized
                : item
            )
          : [...previous, normalized]
      );

      setShowGoldsmithForm(false);
      setGoldsmithForm({
        id: null,
        name: "",
        phone: "",
        active: true,
      });

      alert(
        goldsmithForm.id
          ? "Goldsmith updated successfully."
          : "Goldsmith added successfully."
      );
    } catch (error) {
      console.error("❌ Save goldsmith error:", error);
      alert(error.message || "Unable to save goldsmith.");
    }
  };

  const toggleGoldsmith = async (id) => {
    const goldsmith = goldsmiths.find(
      (item) => item.id === id
    );

    if (!goldsmith) return;

    try {
      const data = await adminFetch(
        `${API_BASE_URL}/api/admin/goldsmiths/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            active: !goldsmith.active,
          }),
        },
        onLogout
      );

      const saved = data.data;

      setGoldsmiths((previous) =>
        previous.map((item) =>
          item.id === Number(saved.id)
            ? {
                ...item,
                name: saved.name || item.name,
                phone: saved.phone ?? item.phone,
                active: Boolean(saved.active),
              }
            : item
        )
      );
    } catch (error) {
      console.error("❌ Goldsmith status error:", error);
      alert(
        error.message ||
          "Unable to change goldsmith status."
      );
    }
  };

  /* =========================================================
     PRODUCT
  ========================================================= */

  const saveProduct = (
    event
  ) => {
    event.preventDefault();

    if (!draft.name?.trim()) {
      alert(
        "Please enter product name."
      );
      return;
    }

    const product = {
      ...draft,

      price:
        Number(draft.price) || 0,
    };

    setProducts((previous) =>
      product.id
        ? previous.map(
            (item) =>
              item.id ===
              product.id
                ? product
                : item
          )
        : [
            ...previous,
            {
              ...product,
              id: Date.now(),
            },
          ]
    );

    setShowProductForm(false);
  };

  /* =========================================================
     PAYMENTS - CURRENTLY LOCAL
     PostgreSQL migration will be next.
  ========================================================= */

  const addPayment = (
    event
  ) => {
    event.preventDefault();

    if (
      !paymentForm.orderId ||
      Number(paymentForm.amount) <= 0
    ) {
      alert(
        "Please select an order and enter payment amount."
      );
      return;
    }

    const payment = {
      ...paymentForm,

      id: Date.now(),

      amount:
        Number(
          paymentForm.amount
        ),

      date:
        new Date().toISOString(),
    };

    const next = [
      payment,
      ...payments,
    ];

    setPayments(next);

    localStorage.setItem(
      "mgj-payments",
      JSON.stringify(next)
    );

    setPaymentForm({
      orderId: "",
      amount: "",
      method: "Cash",
      note: "",
    });
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredProducts =
    products.filter((product) =>
      String(product.name || "")
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
    );

  const filteredOrders =
    orders.filter((order) =>
      `${order.id}
       ${order.trackCode}
       ${order.customer}
       ${order.phone}
       ${order.jewellery}`
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
    );

  /* =========================================================
     TABS
  ========================================================= */

  const tabs = [
  [
    "dashboard",
    "Dashboard",
    BarChart3,
  ],

  [
    "orders",
    "Customer Orders",
    CalendarClock,
  ],

  [
    "goldsmiths",
    "Goldsmiths",
    UserRound,
  ],

  [
    "inventory",
    "Inventory",
    Package,
  ],

  [
    "rates",
    "Gold Rates",
    Coins,
  ],

  [
    "customers",
    "Customers",
    ContactRound,
  ],

  [
    "payments",
    "Payments",
    WalletCards,
  ],

  [
    "reports",
    "Reports",
    ClipboardList,
  ],
];
  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="admin-shell">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-header">

        <div>
          <h1 className="display-font">
            Shop Administration
          </h1>

          <p>
             Sri Murugan Goldsmith and Jewels
            {" · "}
            Kuruvikulam
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <button
            className="primary-btn"
            onClick={openNewOrder}
          >
            <Plus size={16} />
            New Customer Order
          </button>

          {onLogout && (
            <button
              type="button"
              className="secondary-btn"
              onClick={onLogout}
            >
              <RotateCcw size={16} />
              Logout
            </button>
          )}

        </div>
      </div>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="admin-tabs">

        {tabs.map(
          ([
            id,
            label,
            Icon,
          ]) => (
            <button
              key={id}
              onClick={() =>
                setTab(id)
              }
              className={
                tab === id
                  ? "active"
                  : ""
              }
            >
              <Icon size={16} />
              {label}
            </button>
          )
        )}

      </div>

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      {tab === "dashboard" && (
        <section className="admin-content page-enter">

          <div className="metrics-grid">

            <Metric
              icon={CalendarClock}
              label="Orders Due Today"
              value={
                todayOrders.length
              }
              tone="danger"
            />

            <Metric
              icon={Clock3}
              label="In Production"
              value={
                productionOrders.length
              }
              tone="gold"
            />

            <Metric
              icon={CheckCircle2}
              label="Ready for Delivery"
              value={
                readyOrders.length
              }
              tone="success"
            />

            <Metric
              icon={AlertTriangle}
              label="Delayed Orders"
              value={
                delayedOrders.length
              }
              tone="danger"
            />

          </div>

          <div className="metrics-grid">

            <Metric
              icon={WalletCards}
              label="Pending Customer Balance"
              value={money(
                pendingBalance
              )}
            />

            <Metric
              icon={Truck}
              label="Delivered Sales"
              value={money(
                totalSales
              )}
            />

            <Metric
              icon={Users}
              label="Goldsmiths"
              value={
                activeGoldsmiths.length
              }
            />

            <Metric
              icon={Package}
              label="Inventory Pieces"
              value={
                products.length
              }
            />

          </div>

          <div className="dashboard-grid">

            <div className="panel-card">

              <div className="panel-title">

                <div>
                  <h2>
                    Orders Due Today
                  </h2>

                  <p>
                    Promised delivery date is today.
                  </p>
                </div>

                <button
                  className="text-btn"
                  onClick={() =>
                    setTab("orders")
                  }
                >
                  View all
                </button>

              </div>

              {todayOrders.length === 0 ? (
                <div className="empty-state">
                  No orders are due today.
                </div>
              ) : (
                todayOrders.map(
                  (order) => (
                    <div
                      className="order-row"
                      key={order.dbId}
                    >

                      <div>
                        <strong>
                          {order.id}
                        </strong>

                        <span>
                          {order.customer}
                          {" · "}
                          {order.jewellery}
                        </span>
                      </div>

                      <Status
                        value={
                          order.status
                        }
                      />

                    </div>
                  )
                )
              )}

            </div>

            <div className="panel-card">

              <div className="panel-title">

                <div>
                  <h2>
                    Quick Actions
                  </h2>

                  <p>
                    Common shop tasks.
                  </p>
                </div>

              </div>

              <div className="quick-grid">

                <button
                  onClick={
                    openNewOrder
                  }
                >
                  + New Order
                </button>

                <button
                  onClick={() =>
                    setTab(
                      "goldsmiths"
                    )
                  }
                >
                  Goldsmiths
                </button>

                <button
                  onClick={() =>
                    setTab("rates")
                  }
                >
                  Update Gold Rate
                </button>

                <button
                  onClick={() =>
                    setTab("payments")
                  }
                >
                  Add Payment
                </button>

              </div>

            </div>

          </div>

          {delayedOrders.length > 0 && (
            <div className="alert-card">

              <AlertTriangle
                size={17}
              />

              <strong>
                {delayedOrders.length}{" "}
                delayed order
                {delayedOrders.length >
                1
                  ? "s"
                  : ""}
              </strong>

              <span>
                Review and contact customers.
              </span>

            </div>
          )}

        </section>
      )}

      {/* =====================================================
          CUSTOMER ORDERS
      ===================================================== */}

      {tab === "orders" && (
        <section className="admin-content page-enter">

          <div className="section-heading">

            <div>
              <h2>
                Customer Orders
              </h2>

              <p>
                Create, edit and track custom jewellery orders.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={
                openNewOrder
              }
            >
              <Plus size={16} />
              New Order
            </button>

          </div>

          <div className="search-box">

            <Search size={16} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search customer, order or jewellery"
            />

          </div>

          {ordersError && (
            <div className="alert-card">

              <AlertTriangle
                size={17}
              />

              <span>
                {ordersError}
              </span>

              <button
                className="text-btn"
                onClick={
                  loadOrders
                }
              >
                Retry
              </button>

            </div>
          )}

          <div className="table-wrap panel-card">

            {ordersLoading ? (
              <div className="empty-state">
                Loading customer orders...
              </div>
            ) : (
              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Jewellery</th>
                    <th>Goldsmith</th>
                    <th>Delivery</th>
                    <th>Gold</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="empty-state"
                      >
                        No customer orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(
                      (order) => (
                        <tr
                          key={
                            order.dbId
                          }
                        >

                          <td>

                            <strong>
                              {order.id}
                            </strong>

                            <small>
                              Track:{" "}
                              {order.trackCode ||
                                "Not available"}
                            </small>

                            <small>
                              Rate:{" "}
                              {money(
                                order.goldRateAtOrder
                              )}
                              /g
                            </small>

                          </td>

                          <td>

                            {order.customer}

                            <small>
                              {order.phone ||
                                "No phone"}
                            </small>

                          </td>

                          <td>

                            {order.jewellery}

                            <small>
                              {order.weight} g
                              {" · "}
                              {order.purity}
                            </small>

                          </td>

                          <td>
                            {order.goldsmith ||
                              "Unassigned"}
                          </td>

                          <td>

                            {fmtDate(
                              order.deliveryDate
                            )}

                            {order.deliveryDate ===
                              today() &&
                              order.status !==
                                "Delivered" && (
                                <small className="due-text">
                                  Due today
                                </small>
                              )}

                            {order.deliveryDate <
                              today() &&
                              order.status !==
                                "Delivered" && (
                                <small className="late-text">
                                  Delayed
                                </small>
                              )}

                          </td>

                          <td>

                            <small>
                              Issued{" "}
                              {Number(
                                order.goldIssued ||
                                  0
                              ).toFixed(3)}
                              g
                            </small>

                            <small>
                              Returned{" "}
                              {Number(
                                order.goldReturned ||
                                  0
                              ).toFixed(3)}
                              g
                            </small>

                          </td>

                          <td>
                            {money(
                              order.balance
                            )}
                          </td>

                          <td>

                            <select
                              value={
                                order.status
                              }
                              onChange={(
                                event
                              ) =>
                                updateStatus(
                                  order,
                                  event.target
                                    .value
                                )
                              }
                            >

                              {STATUSES.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={
                                      status
                                    }
                                  >
                                    {status}
                                  </option>
                                )
                              )}

                            </select>

                          </td>

                          <td>

                            <div className="row-actions">

                              <button
                                onClick={() =>
                                  setSelectedOrder(
                                    order
                                  )
                                }
                                title="View"
                              >
                                <Eye
                                  size={16}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  openEditOrder(
                                    order
                                  )
                                }
                                title="Edit"
                              >
                                <Edit3
                                  size={16}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  openWhatsAppForOrder(
                                    order
                                  )
                                }
                                title="WhatsApp"
                              >
                                📱
                              </button>

                              <button
                                onClick={() =>
                                  deleteOrder(
                                    order
                                  )
                                }
                                title="Delete"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          GOLDSMITHS
      ===================================================== */}

      {tab === "goldsmiths" && (
        <section className="admin-content page-enter">

          <div className="section-heading">

            <div>
              <h2>
                Goldsmith Management
              </h2>

              <p>
                Manage your goldsmith members.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => {
                setGoldsmithForm({
                  id: null,
                  name: "",
                  phone: "",
                  active: true,
                });

                setShowGoldsmithForm(
                  true
                );
              }}
            >
              <Plus size={16} />
              Add Goldsmith
            </button>

          </div>

          {goldsmithsError && (
            <div className="alert-card">
              <AlertTriangle size={17} />
              <span>{goldsmithsError}</span>
              <button
                className="text-btn"
                onClick={loadGoldsmiths}
              >
                Retry
              </button>
            </div>
          )}

          <div className="goldsmith-grid">

            {goldsmithsLoading ? (
              <div className="empty-state">
                Loading goldsmiths...
              </div>
            ) : goldsmiths.length === 0 ? (
              <div className="empty-state">
                No goldsmiths found. Add a goldsmith to PostgreSQL.
              </div>
            ) : (
              goldsmiths.map(
                (goldsmith) => {

                const mine =
                  orders.filter(
                    (order) =>
                      order.goldsmith ===
                        goldsmith.name &&
                      order.status !==
                        "Delivered"
                  );

                const gold =
                  mine.reduce(
                    (sum, order) =>
                      sum +
                      Number(
                        order.goldIssued ||
                          0
                      ) -
                      Number(
                        order.goldReturned ||
                          0
                      ),
                    0
                  );

                const due =
                  mine.reduce(
                    (sum, order) =>
                      sum +
                      Number(
                        order.makingCharge ||
                          0
                      ),
                    0
                  );

                return (
                  <div
                    className="panel-card goldsmith-card"
                    key={
                      goldsmith.id
                    }
                  >

                    <div className="avatar">
                      <UserRound
                        size={19}
                      />
                    </div>

                    <div>
                      <h3>
                        {goldsmith.name}
                      </h3>

                      <p>
                        {goldsmith.phone ||
                          "No phone added"}
                        {" · "}
                        {goldsmith.active
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>

                    <div className="goldsmith-stats">

                      <div>
                        <span>
                          Active orders
                        </span>

                        <strong>
                          {mine.length}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Gold with worker
                        </span>

                        <strong>
                          {gold.toFixed(
                            3
                          )}{" "}
                          g
                        </strong>
                      </div>

                      <div>
                        <span>
                          Making due
                        </span>

                        <strong>
                          {money(due)}
                        </strong>
                      </div>

                      <div className="goldsmith-actions">

                        <button
                          onClick={() => {
                            setGoldsmithForm({
                              ...goldsmith,
                            });

                            setShowGoldsmithForm(
                              true
                            );
                          }}
                        >
                          <Edit3
                            size={15}
                          />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleGoldsmith(
                              goldsmith.id
                            )
                          }
                        >
                          {goldsmith.active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
              )
            )}

          </div>

        </section>
      )}
      
     

      
      {/* =====================================================
          INVENTORY
      ===================================================== */}

      {tab === "inventory" && (
        <section className="admin-content page-enter">

          <div className="section-heading">

            <div>
              <h2>
                Inventory
              </h2>

              <p>
                {products.length} pieces
                {" · "}
                changes here reflect in catalog.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => {
                setDraft({
                  ...emptyProduct,
                });

                setShowProductForm(
                  true
                );
              }}
            >
              <Plus size={16} />
              Add Piece
            </button>

          </div>

          <div className="search-box">

            <Search size={16} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search products"
            />

          </div>

          <div className="table-wrap panel-card">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Piece</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (
                    <tr
                      key={
                        product.id
                      }
                    >

                      <td>

                        <div className="product-mini">

                          {product.imageUrl && (
                            <img
                              src={
                                product.imageUrl
                              }
                              alt=""
                            />
                          )}

                          <span>
                            {product.name}
                          </span>

                        </div>

                      </td>

                      <td>
                        {product.category}
                      </td>

                      <td>
                        <Price
                          value={
                            product.price
                          }
                        />
                      </td>

                      <td>
                        {product.availability}
                      </td>

                      <td>
                        {product.inStock
                          ? "In stock"
                          : "Out of stock"}
                      </td>

                      <td>

                        <div className="row-actions">

                          <button
                            onClick={() => {
                              setDraft({
                                ...product,
                              });

                              setShowProductForm(
                                true
                              );
                            }}
                          >
                            <Edit3
                              size={16}
                            />
                          </button>

                          <button
                            onClick={() =>
                              setProducts(
                                (previous) =>
                                  previous.filter(
                                    (item) =>
                                      item.id !==
                                      product.id
                                  )
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* =====================================================
          GOLD RATES
      ===================================================== */}

      {tab === "rates" && (
        <section className="admin-content page-enter">

          <div className="section-heading">

            <div>
              <h2>
                Gold & Silver Rates
              </h2>

              <p>
                Manual shop rate.
                Existing orders keep the saved rate.
              </p>
            </div>

          </div>

          <form
            className="panel-card rate-form"
            onSubmit={saveRates}
          >

            <Field label="22K Gold · ₹/gram">

              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={
                  rateDraft.gold22k
                }
                onChange={(event) =>
                  setRateDraft({
                    ...rateDraft,
                    gold22k:
                      event.target
                        .value,
                  })
                }
                disabled={
                  ratesLoading ||
                  ratesSaving
                }
              />

            </Field>

            <Field label="18K Gold · ₹/gram">

              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={
                  rateDraft.gold18k
                }
                onChange={(event) =>
                  setRateDraft({
                    ...rateDraft,
                    gold18k:
                      event.target
                        .value,
                  })
                }
                disabled={
                  ratesLoading ||
                  ratesSaving
                }
              />

            </Field>

            <Field label="Silver · ₹/gram">

              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={
                  rateDraft.silver
                }
                onChange={(event) =>
                  setRateDraft({
                    ...rateDraft,
                    silver:
                      event.target
                        .value,
                  })
                }
                disabled={
                  ratesLoading ||
                  ratesSaving
                }
              />

            </Field>

            <button
              className="primary-btn"
              type="submit"
              disabled={
                ratesLoading ||
                ratesSaving
              }
            >
              <Save size={16} />

              {ratesSaving
                ? "Saving..."
                : ratesLoading
                  ? "Loading..."
                  : "Save Today's Rate"}
            </button>

          </form>

          <div className="form-note">

            Current rate:

            {" 22K "}
            {money(
              rates?.gold22k
            )}
            /g

            {" · 18K "}
            {money(
              rates?.gold18k
            )}
            /g

            {" · Silver "}
            {money(
              rates?.silver
            )}
            /g

            {" · "}
            Manual · PostgreSQL

          </div>

        </section>
      )}

      {/* =====================================================
          CUSTOMERS
      ===================================================== */}

      {tab === "customers" && (
        <section className="admin-content page-enter">

          <div className="section-heading">

            <div>
              <h2>
                Customers
              </h2>

              <p>
                Customer information from current orders.
              </p>
            </div>

          </div>

          <div className="table-wrap panel-card">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Pending Balance</th>
                </tr>
              </thead>

              <tbody>

                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-state"
                    >
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  Array.from(
                    new Map(
                      orders.map(
                        (order) => [
                          order.phone ||
                            order.customer,
                          order,
                        ]
                      )
                    ).values()
                  ).map(
                    (customerOrder) => {

                      const customerOrders =
                        orders.filter(
                          (order) =>
                            order.phone ===
                              customerOrder.phone ||
                            order.customer ===
                              customerOrder.customer
                        );

                      const balance =
                        customerOrders.reduce(
                          (sum, order) =>
                            sum +
                            Number(
                              order.balance ||
                                0
                            ),
                          0
                        );

                      return (
                        <tr
                          key={
                            customerOrder.phone ||
                            customerOrder.customer
                          }
                        >

                          <td>
                            {
                              customerOrder.customer
                            }
                          </td>

                          <td>
                            {
                              customerOrder.phone
                            }
                          </td>

                          <td>
                            {
                              customerOrders.length
                            }
                          </td>

                          <td>
                            {money(
                              balance
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* =====================================================
          PAYMENTS
      ===================================================== */}

      {tab === "payments" && (
        <section className="admin-content page-enter">

          <div className="section-heading">

            <div>
              <h2>
                Payments
              </h2>

              <p>
                Payment records.
              </p>
            </div>

          </div>

          <div className="dashboard-grid">

            <form
              className="panel-card form-panel"
              onSubmit={addPayment}
            >

              <div className="panel-title">

                <div>
                  <h2>
                    Add Payment
                  </h2>
                </div>

              </div>

              <div className="form-body">

                <Field label="Order">

                  <select
                    className="input"
                    required
                    value={
                      paymentForm.orderId
                    }
                    onChange={(event) =>
                      setPaymentForm({
                        ...paymentForm,
                        orderId:
                          event.target
                            .value,
                      })
                    }
                  >

                    <option value="">
                      Select order
                    </option>

                    {orders.map(
                      (order) => (
                        <option
                          key={
                            order.dbId
                          }
                          value={
                            order.dbId
                          }
                        >
                          {order.id}
                          {" · "}
                          {order.customer}
                        </option>
                      )
                    )}

                  </select>

                </Field>

                <Field label="Amount · ₹">

                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={
                      paymentForm.amount
                    }
                    onChange={(event) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Method">

                  <select
                    className="input"
                    value={
                      paymentForm.method
                    }
                    onChange={(event) =>
                      setPaymentForm({
                        ...paymentForm,
                        method:
                          event.target
                            .value,
                      })
                    }
                  >
                    <option>
                      Cash
                    </option>

                    <option>
                      UPI
                    </option>

                    <option>
                      Bank Transfer
                    </option>

                    <option>
                      Card
                    </option>
                  </select>

                </Field>

                <Field label="Note">

                  <input
                    className="input"
                    value={
                      paymentForm.note
                    }
                    onChange={(event) =>
                      setPaymentForm({
                        ...paymentForm,
                        note:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <button
                  className="primary-btn full"
                  type="submit"
                >
                  <Save size={16} />
                  Save Payment
                </button>

              </div>

            </form>

            <div className="panel-card">

              <div className="panel-title">
                <div>
                  <h2>
                    Payment History
                  </h2>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="empty-state">
                  No payments recorded yet.
                </div>
              ) : (
                payments.map(
                  (payment) => (
                    <div
                      className="order-row"
                      key={
                        payment.id
                      }
                    >

                      <div>

                        <strong>
                          {
                            payment.orderId
                          }
                        </strong>

                        <span>
                          {
                            payment.method
                          }
                          {" · "}
                          {new Date(
                            payment.date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <strong>
                        {money(
                          payment.amount
                        )}
                      </strong>

                    </div>
                  )
                )
              )}

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          REPORTS
      ===================================================== */}

      {tab === "reports" && (
        <section className="admin-content page-enter">

          <div className="section-heading">

            <div>
              <h2>
                Reports
              </h2>

              <p>
                Current shop operational summary.
              </p>
            </div>

          </div>

          <div className="metrics-grid">

            <Metric
              icon={WalletCards}
              label="Total Order Value"
              value={money(
                orders.reduce(
                  (sum, order) =>
                    sum +
                    Number(
                      order.total || 0
                    ),
                  0
                )
              )}
            />

            <Metric
              icon={Truck}
              label="Delivered Sales"
              value={money(
                totalSales
              )}
            />

            <Metric
              icon={Clock3}
              label="Production Orders"
              value={
                productionOrders.length
              }
            />

            <Metric
              icon={AlertTriangle}
              label="Delayed Orders"
              value={
                delayedOrders.length
              }
            />

          </div>

        </section>
      )}

      {/* =====================================================
          NEW / EDIT ORDER MODAL
      ===================================================== */}

      {showOrderForm && (
        <div className="modal-backdrop">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>
                  {editingOrder
                    ? "Edit Customer Order"
                    : "New Customer Order"}
                </h2>

                <p>
                  Customer order is saved to PostgreSQL.
                </p>
              </div>

              <button
                className="icon-btn"
                onClick={() => {
                  setShowOrderForm(
                    false
                  );
                  setEditingOrder(
                    null
                  );
                }}
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={saveOrder}
              className="form-body"
            >

              <div className="form-grid">

                <Field label="Customer Name">

                  <input
                    className="input"
                    required
                    value={
                      orderForm.customer
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        customer:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Mobile Number">

                  <input
                    className="input"
                    required
                    inputMode="numeric"
                    value={
                      orderForm.phone
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        phone:
                          event.target
                            .value,
                      })
                    }
                    placeholder="10 digit mobile"
                  />

                </Field>

                <Field label="Jewellery">

                  <input
                    className="input"
                    required
                    value={
                      orderForm.jewellery
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        jewellery:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Gold Ring / Chain / Necklace"
                  />

                </Field>

                <Field label="Purity">

                  <select
                    className="input"
                    value={
                      orderForm.purity
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        purity:
                          event.target
                            .value,
                        goldRateAtOrder:
                          event.target
                            .value ===
                          "18K"
                            ? rates.gold18k
                            : rates.gold22k,
                      })
                    }
                  >
                    <option value="22K">
                      22K Gold
                    </option>

                    <option value="18K">
                      18K Gold
                    </option>
                  </select>

                </Field>

                <Field label="Weight · grams">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.001"
                    value={
                      orderForm.weight
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        weight:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Gold Rate · ₹/gram">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      orderForm.goldRateAtOrder ||
                      selectedGoldRate
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        goldRateAtOrder:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Making Charge · ₹/gram">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      orderForm.makingCharge
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        makingCharge:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Stone Charge · ₹">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      orderForm.stoneCharge
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        stoneCharge:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Other Charge · ₹">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      orderForm.otherCharge
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        otherCharge:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Advance · ₹">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      orderForm.advance
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        advance:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Delivery Date">

                  <input
                    className="input"
                    type="date"
                    required
                    value={
                      orderForm.deliveryDate
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        deliveryDate:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Goldsmith">

                  <select
                    className="input"
                    value={
                      orderForm.goldsmith
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        goldsmith:
                          event.target
                            .value,
                      })
                    }
                  >
                    <option value="">
                      To be assigned
                    </option>

                    {activeGoldsmiths.map(
                      (goldsmith) => (
                        <option
                          key={
                            goldsmith.id
                          }
                          value={
                            goldsmith.name
                          }
                        >
                          {
                            goldsmith.name
                          }
                        </option>
                      )
                    )}
                  </select>

                </Field>

                <Field label="Status">

                  <select
                    className="input"
                    value={
                      orderForm.status
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        status:
                          event.target
                            .value,
                      })
                    }
                  >
                    {STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={
                            status
                          }
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>

                </Field>

                <Field label="Gold Issued · grams">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.001"
                    value={
                      orderForm.goldIssued
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        goldIssued:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Gold Returned · grams">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.001"
                    value={
                      orderForm.goldReturned
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        goldReturned:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

                <Field label="Wastage · grams">

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.001"
                    value={
                      orderForm.wastage
                    }
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        wastage:
                          event.target
                            .value,
                      })
                    }
                  />

                </Field>

              </div>

              <Field label="Notes">

                <textarea
                  className="input"
                  rows="3"
                  value={
                    orderForm.notes
                  }
                  onChange={(event) =>
                    setOrderForm({
                      ...orderForm,
                      notes:
                        event.target
                          .value,
                    })
                  }
                />

              </Field>

              <div className="panel-card">

                <h3>
                  Order Calculation
                </h3>

                <div className="metrics-grid">

                  <Metric
                    label="Gold Value"
                    value={money(
                      calculatedOrder.goldValue
                    )}
                    icon={Coins}
                  />

                  <Metric
                    label="Making"
                    value={money(
                      calculatedOrder.makingAmount
                    )}
                    icon={Coins}
                  />

                  <Metric
                    label="Total"
                    value={money(
                      calculatedOrder.total
                    )}
                    icon={WalletCards}
                  />

                  <Metric
                    label="Balance"
                    value={money(
                      calculatedOrder.balance
                    )}
                    icon={WalletCards}
                  />

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowOrderForm(
                      false
                    );
                    setEditingOrder(
                      null
                    );
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    orderSaving
                  }
                >
                  <Save size={16} />

                  {orderSaving
                    ? "Saving..."
                    : editingOrder
                      ? "Update Order"
                      : "Create Order"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (
        <div className="modal-backdrop order-details-backdrop">

          <div className="modal-card order-details-modal">

            <div className="modal-header order-details-header">
              <div className="order-heading">
                <span className="order-heading-label">ORDER DETAILS</span>
                <h2>{selectedOrder.id}</h2>
                <div className="order-track-line">
                  <span>Track Code</span>
                  <strong>{selectedOrder.trackCode || "-"}</strong>
                </div>
              </div>

              <button
                type="button"
                className="icon-btn order-close-btn"
                aria-label="Close order details"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="form-body order-details-body">

              <div className="order-info-grid">
                <div className="panel-card detail-card customer-card">
                  <div className="detail-card-head">
                    <div className="detail-icon"><UserRound size={16} /></div>
                    <h3>Customer</h3>
                  </div>
                  <div className="detail-primary">{selectedOrder.customer || "-"}</div>
                  <div className="detail-secondary">{selectedOrder.phone || "-"}</div>
                </div>

                <div className="panel-card detail-card jewellery-card">
                  <div className="detail-card-head">
                    <div className="detail-icon"><Package size={16} /></div>
                    <h3>Jewellery</h3>
                  </div>
                  <div className="detail-primary">{selectedOrder.jewellery || "-"}</div>
                  <div className="detail-facts">
                    <span><small>Weight</small><b>{Number(selectedOrder.weight || 0).toFixed(3)} g</b></span>
                    <span><small>Purity</small><b>{selectedOrder.purity || "-"}</b></span>
                    <span><small>Gold Rate</small><b>{money(selectedOrder.goldRateAtOrder)}/g</b></span>
                  </div>
                </div>
              </div>

              <div className="panel-card detail-card status-card">
                <div className="section-card-heading">
                  <div>
                    <span className="section-eyebrow">WORKFLOW</span>
                    <h3>Order Status</h3>
                  </div>
                  <Status value={selectedOrder.status} />
                </div>

                <label className="status-select-wrap">
                  <span>Update current stage</span>
                  <select
                    className="input status-select"
                    value={selectedOrder.status}
                    onChange={(event) =>
                      updateStatus(selectedOrder, event.target.value)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="panel-card detail-card gold-card">
                <div className="section-card-heading">
                  <div>
                    <span className="section-eyebrow">WORKSHOP CONTROL</span>
                    <h3>Gold Tracking</h3>
                  </div>
                  <div className="gold-order-weight">
                    Order Weight <strong>{Number(selectedOrder.weight || 0).toFixed(3)} g</strong>
                  </div>
                </div>

                <div className="gold-input-grid">
                  <Field label="Gold Issued · grams">
                    <input
                      className="input gold-input"
                      type="number"
                      min="0"
                      step="0.001"
                      defaultValue={selectedOrder.goldIssued}
                      id="selectedGoldIssued"
                    />
                  </Field>

                  <Field label="Gold Returned · grams">
                    <input
                      className="input gold-input"
                      type="number"
                      min="0"
                      step="0.001"
                      defaultValue={selectedOrder.goldReturned}
                      id="selectedGoldReturned"
                    />
                  </Field>

                  <Field label="Wastage · grams">
                    <input
                      className="input gold-input"
                      type="number"
                      min="0"
                      step="0.001"
                      defaultValue={selectedOrder.wastage}
                      id="selectedWastage"
                    />
                  </Field>
                </div>

                <div className="gold-summary-row">
                  <div>
                    <span>Gold balance</span>
                    <strong>
                      {Math.max(
                        0,
                        Number(selectedOrder.goldIssued || 0) -
                          Number(selectedOrder.goldReturned || 0)
                      ).toFixed(3)} g
                    </strong>
                  </div>
                  <div>
                    <span>Recorded wastage</span>
                    <strong>{Number(selectedOrder.wastage || 0).toFixed(3)} g</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn gold-save-btn"
                  onClick={() => {
                    const issued = document.getElementById("selectedGoldIssued")?.value;
                    const returned = document.getElementById("selectedGoldReturned")?.value;
                    const wastage = document.getElementById("selectedWastage")?.value;

                    updateGold(selectedOrder, {
                      goldIssued: Number(issued) || 0,
                      goldReturned: Number(returned) || 0,
                      wastage: Number(wastage) || 0,
                    });
                  }}
                >
                  <Save size={16} />
                  Save Gold Progress
                </button>
              </div>

              <div className="order-info-grid payment-delivery-grid">
                <div className="panel-card detail-card payment-card">
                  <div className="detail-card-head">
                    <div className="detail-icon"><WalletCards size={16} /></div>
                    <h3>Payment</h3>
                  </div>
                  <div className="payment-list">
                    <div><span>Total</span><strong>{money(selectedOrder.total)}</strong></div>
                    <div><span>Advance</span><strong>{money(selectedOrder.advance)}</strong></div>
                    <div className="balance-row"><span>Balance</span><strong>{money(selectedOrder.balance)}</strong></div>
                  </div>
                </div>

                <div className="panel-card detail-card delivery-card">
                  <div className="detail-card-head">
                    <div className="detail-icon"><CalendarClock size={16} /></div>
                    <h3>Delivery</h3>
                  </div>
                  <div className="delivery-date">{fmtDate(selectedOrder.deliveryDate)}</div>
                  {selectedOrder.notes && (
                    <div className="notes-box">
                      <span>Notes</span>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions order-detail-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => openWhatsAppForOrder(selectedOrder)}
                >
                  WhatsApp Customer
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => openEditOrder(selectedOrder)}
                >
                  <Edit3 size={16} />
                  Edit Order
                </button>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          GOLDSMITH MODAL
      ===================================================== */}

      {showGoldsmithForm && (
        <div className="modal-backdrop">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>
                  {goldsmithForm.id
                    ? "Edit Goldsmith"
                    : "Add Goldsmith"}
                </h2>
              </div>

              <button
                className="icon-btn"
                onClick={() =>
                  setShowGoldsmithForm(
                    false
                  )
                }
              >
                <X size={18} />
              </button>

            </div>

            <form
              className="form-body"
              onSubmit={
                saveGoldsmith
              }
            >

              <Field label="Name">

                <input
                  className="input"
                  value={
                    goldsmithForm.name
                  }
                  onChange={(event) =>
                    setGoldsmithForm({
                      ...goldsmithForm,
                      name:
                        event.target
                          .value,
                    })
                  }
                  required
                />

              </Field>

              <Field label="Phone">

                <input
                  className="input"
                  value={
                    goldsmithForm.phone
                  }
                  onChange={(event) =>
                    setGoldsmithForm({
                      ...goldsmithForm,
                      phone:
                        event.target
                          .value,
                    })
                  }
                />

              </Field>

              <label
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems:
                    "center",
                }}
              >

                <input
                  type="checkbox"
                  checked={
                    goldsmithForm.active
                  }
                  onChange={(event) =>
                    setGoldsmithForm({
                      ...goldsmithForm,
                      active:
                        event.target
                          .checked,
                    })
                  }
                />

                Active

              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowGoldsmithForm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  <Save size={16} />
                  Save Goldsmith
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          PRODUCT MODAL
      ===================================================== */}

      {showProductForm && (
        <div className="modal-backdrop">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>
                  Product
                </h2>
              </div>

              <button
                className="icon-btn"
                onClick={() =>
                  setShowProductForm(
                    false
                  )
                }
              >
                <X size={18} />
              </button>

            </div>

            <form
              className="form-body"
              onSubmit={
                saveProduct
              }
            >

              <Field label="Product Name">

                <input
                  className="input"
                  value={
                    draft.name || ""
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      name:
                        event.target
                          .value,
                    })
                  }
                  required
                />

              </Field>

              <Field label="Category">

                <select
                  className="input"
                  value={
                    draft.category ||
                    ""
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      category:
                        event.target
                          .value,
                    })
                  }
                >
                  {CATEGORIES.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

              </Field>

              <Field label="Price">

                <input
                  className="input"
                  type="number"
                  min="0"
                  value={
                    draft.price || ""
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      price:
                        event.target
                          .value,
                    })
                  }
                />

              </Field>

              <Field label="Availability">

                <select
                  className="input"
                  value={
                    draft.availability ||
                    ""
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      availability:
                        event.target
                          .value,
                    })
                  }
                >
                  {AVAILABILITY.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

              </Field>

              <label
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems:
                    "center",
                }}
              >

                <input
                  type="checkbox"
                  checked={
                    Boolean(
                      draft.inStock
                    )
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      inStock:
                        event.target
                          .checked,
                    })
                  }
                />

                In Stock

              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowProductForm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  <Save size={16} />
                  Save Product
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}