import { ShoppingBag, ShieldCheck } from "lucide-react";
import logo from "../assets/murugan-logo.jpeg";

export default function NavBar({ view, setView, cartCount }) {
  const items = [
    { id: "home", label: "Home" },
    { id: "catalog", label: "Catalog" },
    { id: "custom-order", label: "Custom Order" },
    { id: "track-order", label: "Track Order" },
    { id: "contact", label: "Contact Us" },
  ];

  return (
    <header
      className="site-nav border-b sticky top-0 z-40"
      style={{
        borderColor: "#E7DFD2",
        background: "#FBF8F3",
      }}
    >
      {/* TOP BAR */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4"
        style={{
          minHeight: "72px",
        }}
      >
        {/* LOGO / BRAND */}
        <button
          onClick={() => setView({ name: "home" })}
          className="brand-button flex items-center gap-3"
          aria-label="Murugan Goldsmith and Jewels home"
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <img
            src={logo}
            alt="Murugan Goldsmith and Jewels logo"
            className="brand-logo"
            style={{
              width: "46px",
              height: "46px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />

          <span
            className="display-font brand-name"
            style={{
              color: "#241F1A",
              fontWeight: 700,
              fontSize: "18px",
              whiteSpace: "nowrap",
            }}
          >
            Murugan Goldsmith and Jewels
          </span>
        </button>

        {/* DESKTOP CART */}
        <button
          onClick={() => setView({ name: "cart" })}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-sm"
          style={{
            background: "#F4EEE4",
            color: "#241F1A",
            border: "1px solid #E7DFD2",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Shopping cart"
        >
          <ShoppingBag size={17} />

          <span>Cart</span>

          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2 text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
              style={{
                background: "#6B2737",
                color: "#fff",
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          borderTop: "1px solid #E7DFD2",
        }}
      >
        <nav
          className="flex items-center gap-5 px-4 sm:px-6 lg:px-8"
          style={{
            minWidth: "max-content",
            height: "52px",
          }}
        >
          {items.map((it) => {
            const active = view.name === it.id;

            return (
              <button
                key={it.id}
                onClick={() =>
                  setView({
                    name: it.id,
                  })
                }
                style={{
                  height: "100%",
                  padding: "0 2px",
                  border: 0,
                  borderBottom: active
                    ? "2px solid #6B2737"
                    : "2px solid transparent",
                  background: "transparent",
                  color: active
                    ? "#241F1A"
                    : "#8A7F6E",
                  fontSize: "14px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {it.label}
              </button>
            );
          })}

          {/* ADMIN LOGIN BUTTON */}
          <button
            onClick={() =>
              setView({
                name: "admin",
              })
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "34px",
              padding: "0 13px",
              borderRadius: "8px",
              border:
                view.name === "admin"
                  ? "1px solid #6B2737"
                  : "1px solid #D8C7AD",
              background:
                view.name === "admin"
                  ? "#6B2737"
                  : "#F4EEE4",
              color:
                view.name === "admin"
                  ? "#FFFFFF"
                  : "#241F1A",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <ShieldCheck size={16} />
            Admin
          </button>

          {/* MOBILE CART */}
          <button
            onClick={() =>
              setView({
                name: "cart",
              })
            }
            className="relative flex items-center gap-1.5"
            style={{
              height: "34px",
              padding: "0 13px",
              borderRadius: "8px",
              border: "1px solid #D8C7AD",
              background: "#F4EEE4",
              color: "#241F1A",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <ShoppingBag size={16} />

            Cart

            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                style={{
                  background: "#6B2737",
                  color: "#fff",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}