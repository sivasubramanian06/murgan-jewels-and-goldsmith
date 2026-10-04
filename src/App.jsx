import { useEffect, useState } from "react";

import NavBar from "./components/NavBar";
import GoldRateBar from "./components/GoldRateBar";

import HomePage from "./components/HomePage";
import CatalogPage from "./components/CatalogPage";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import ContactPage from "./components/ContactPage";
import CustomOrderPage from "./components/CustomOrderPage";
import TrackOrderPage from "./components/TrackOrderPage";

import { seedProducts } from "./data/seedProducts";

/* =========================================================
   BUSINESS DETAILS
========================================================= */

export const BUSINESS_WHATSAPP = "919384741246";

/* =========================================================
   BACKEND API
========================================================= */

const API_BASE_URL = "http://10.68.27.201:5000";

/* =========================================================
   DEFAULT RATES
   Used only if PostgreSQL and localStorage are unavailable.
========================================================= */

const DEFAULT_RATES = {
  gold22k: 13765,
  silver: 245,
};

/* =========================================================
   LOAD SAVED RATES
   Temporary browser fallback.
========================================================= */

function getSavedRates() {
  try {
    const saved = localStorage.getItem("mgj-rates");

    if (!saved) {
      return DEFAULT_RATES;
    }

    return {
      ...DEFAULT_RATES,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_RATES;
  }
}

/* =========================================================
   NORMALIZE API GOLD RATE
========================================================= */

function normalizeRates(data) {
  const source = data?.data || data || {};

  const gold22k =
    Number(
      source.gold22k ??
        source.gold_22k_rate ??
        source.gold22K ??
        source.gold22KRate
    ) || 0;

  const gold18k =
    Number(
      source.gold18k ??
        source.gold_18k_rate ??
        source.gold18K ??
        source.gold18KRate
    ) || 0;

  const silver =
    Number(
      source.silver ??
        source.silver_rate ??
        source.silverRate
    ) || 0;

  return {
    gold22k,
    gold18k,
    silver,
  };
}

/* =========================================================
   FETCH LATEST GOLD RATE FROM POSTGRESQL
========================================================= */

async function fetchLatestRates() {
  const response = await fetch(`${API_BASE_URL}/api/gold-rates`);

  if (!response.ok) {
    throw new Error(
      `Gold rate request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data?.success === false) {
    throw new Error(data.message || "Unable to load gold rates");
  }

  const apiRates = normalizeRates(data);

  if (!apiRates.gold22k) {
    throw new Error("22K gold rate is missing from server response");
  }

  return apiRates;
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [products, setProducts] = useState(seedProducts);

  /* =======================================================
     CART
  ======================================================= */

  const [cart, setCart] = useState([]);

  /* =======================================================
     GOLD RATES
  ======================================================= */

  const [rates, setRates] = useState(getSavedRates);

  /* =======================================================
     GOLD RATE LOADING STATE
  ======================================================= */

  const [ratesLoading, setRatesLoading] = useState(true);

  /* =======================================================
     ADMIN LOGIN STATE
  ======================================================= */

  const [adminLoggedIn, setAdminLoggedIn] = useState(
    () => sessionStorage.getItem("mgj-admin-auth") === "true"
  );

  /* =======================================================
     LOAD LATEST RATES FROM POSTGRESQL
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      try {
        setRatesLoading(true);

        const latestRates = await fetchLatestRates();

        if (cancelled) {
          return;
        }

        const cleanedRates = {
          gold22k: Number(latestRates.gold22k) || DEFAULT_RATES.gold22k,
          gold18k: Number(latestRates.gold18k) || 0,
          silver: Number(latestRates.silver) || DEFAULT_RATES.silver,
        };

        setRates(cleanedRates);

        /*
          Save the latest successful PostgreSQL values
          as a temporary browser fallback.
        */

        localStorage.setItem(
          "mgj-rates",
          JSON.stringify(cleanedRates)
        );

        console.log("✅ Latest gold rates loaded from PostgreSQL");
        console.log("22K Gold:", cleanedRates.gold22k);
        console.log("18K Gold:", cleanedRates.gold18k);
        console.log("Silver:", cleanedRates.silver);
      } catch (error) {
        console.error(
          "❌ Failed to load latest gold rates:",
          error.message
        );

        /*
          Keep existing localStorage/default rate.
          The website will continue working even if
          the backend is temporarily unavailable.
        */
      } finally {
        if (!cancelled) {
          setRatesLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     INITIAL PAGE
  ======================================================= */

  const [view, setViewState] = useState(() => {
    const browserState = window.history.state;

    if (browserState?.mgjView) {
      return browserState.mgjView;
    }

    return {
      name: "home",
    };
  });

  /* =======================================================
     BROWSER HISTORY NAVIGATION
  ======================================================= */

  function navigate(nextView, options = {}) {
    const currentView = view;

    const sameView =
      JSON.stringify(currentView) ===
      JSON.stringify(nextView);

    if (sameView) {
      return;
    }

    setViewState(nextView);

    if (options.replace) {
      window.history.replaceState(
        {
          mgjView: nextView,
        },
        "",
        window.location.href
      );
    } else {
      window.history.pushState(
        {
          mgjView: nextView,
        },
        "",
        window.location.href
      );
    }

    /*
      Scroll to top whenever the customer changes page.
    */

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     INITIALIZE BROWSER HISTORY
  ======================================================= */

  useEffect(() => {
    const currentState = window.history.state;

    if (!currentState?.mgjView) {
      window.history.replaceState(
        {
          mgjView: view,
        },
        "",
        window.location.href
      );
    }
  }, []);

  /* =======================================================
     BROWSER BACK / FORWARD
  ======================================================= */

  useEffect(() => {
    function handlePopState(event) {
      if (event.state?.mgjView) {
        setViewState(event.state.mgjView);
      } else {
        setViewState({
          name: "home",
        });
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function addToCart(product) {
    setCart((previousCart) => {
      const existingProduct =
        previousCart.find(
          (item) => item.id === product.id
        );

      if (existingProduct) {
        return previousCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    navigate({
      name: "cart",
    });
  }

  /* =======================================================
     UPDATE CART
  ======================================================= */

  function updateQty(id, qty) {
    if (qty < 1) {
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              qty,
            }
          : item
      )
    );
  }

  /* =======================================================
     REMOVE CART ITEM
  ======================================================= */

  function removeFromCart(id) {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== id
      )
    );
  }

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  /* =======================================================
     SELECTED PRODUCT
  ======================================================= */

  const selectedProduct =
    view.name === "product"
      ? products.find(
          (product) =>
            product.id === view.id
        )
      : null;

  /* =======================================================
     ADMIN LOGIN SUCCESS
  ======================================================= */

  function handleAdminLogin() {
    sessionStorage.setItem(
      "mgj-admin-auth",
      "true"
    );

    setAdminLoggedIn(true);
  }

  /* =======================================================
     ADMIN LOGOUT
  ======================================================= */

  function handleAdminLogout() {
    sessionStorage.removeItem(
      "mgj-admin-auth"
    );

    setAdminLoggedIn(false);

    navigate({
      name: "home",
    });
  }

  /* =======================================================
     UPDATE RATES FROM ADMIN PANEL
  ======================================================= */

  function handleRatesUpdate(newRates) {
    const updatedRates = {
      ...rates,
      ...newRates,
    };

    setRates(updatedRates);

    localStorage.setItem(
      "mgj-rates",
      JSON.stringify(updatedRates)
    );
  }

  /* =======================================================
     APP
  ======================================================= */

  return (
    <div
      className="app-shell"
      style={{
        color: "#241F1A",
        background: "#FBF8F3",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ===================================================
          GOLD RATE BAR
      =================================================== */}

      <GoldRateBar
        rates={rates}
        loading={ratesLoading}
      />

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <NavBar
        view={view}
        setView={navigate}
        cartCount={cartCount}
      />

      {/* ===================================================
          PAGE CONTENT
      =================================================== */}

      <div
        key={`${view.name}-${view.id || ""}-${view.category || ""}`}
        className="page-content page-switch"
      >
        {/* =================================================
            HOME
        ================================================= */}

        {view.name === "home" && (
          <HomePage
            products={products}
            setView={navigate}
            rates={rates}
          />
        )}

        {/* =================================================
            CATALOG
        ================================================= */}

        {view.name === "catalog" && (
          <CatalogPage
            products={products}
            setView={navigate}
            initialCategory={
              view.category || "All"
            }
          />
        )}

        {/* =================================================
            PRODUCT
        ================================================= */}

        {view.name === "product" && (
          <ProductPage
            product={selectedProduct}
            setView={navigate}
            addToCart={addToCart}
          />
        )}

        {/* =================================================
            CART
        ================================================= */}

        {view.name === "cart" && (
          <CartPage
            cart={cart}
            updateQty={updateQty}
            removeFromCart={removeFromCart}
            setView={navigate}
          />
        )}

        {/* =================================================
            ADMIN
        ================================================= */}

        {view.name === "admin" &&
          (adminLoggedIn ? (
            <AdminPanel
              products={products}
              setProducts={setProducts}
              rates={rates}
              setRates={handleRatesUpdate}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminLogin
              onLogin={handleAdminLogin}
              onBack={() =>
                navigate({
                  name: "home",
                })
              }
            />
          ))}

        {/* =================================================
            CONTACT
        ================================================= */}

        {view.name === "contact" && (
          <ContactPage />
        )}

        {/* =================================================
            CUSTOM ORDER
        ================================================= */}

        {view.name === "custom-order" && (
 <CustomOrderPage
  setView={navigate}
  rates={rates}
  initialJewellery={view.jewellery}
/>
)}
        {/* =================================================
            TRACK ORDER
        ================================================= */}

        {view.name === "track-order" && (
          <TrackOrderPage />
        )}
      </div>
    </div>
  );
}