import { Minus, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Price } from "./ProductCard";

export default function CartPage({
  cart,
  updateQty,
  removeFromCart,
  setView,
}) {
  // Convert catalogue category to Custom Order jewellery type
  const getJewelleryType = (category) => {
    const value = String(category || "")
      .trim()
      .toLowerCase();

    const map = {
      ring: "Ring",
      rings: "Ring",

      chain: "Chain",
      chains: "Chain",

      necklace: "Necklace",
      necklaces: "Necklace",

      earring: "Earring",
      earrings: "Earring",

      bracelet: "Bracelet",
      bracelets: "Bracelet",

      bangle: "Bangle",
      bangles: "Bangle",

      custom: "Custom Design",
      "custom design": "Custom Design",
    };

    return map[value] || "Ring";
  };

  // Calculate cart total
  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto">

      {/* PAGE TITLE */}
      <h1
        className="display-font text-3xl mb-6"
        style={{
          color: "#241F1A",
        }}
      >
        Your cart
      </h1>

      {/* EMPTY CART */}
      {cart.length === 0 && (
        <div className="text-center py-16">

          <p
            className="text-sm mb-4"
            style={{
              color: "#A69B89",
            }}
          >
            Your cart is empty.
          </p>

          <button
            onClick={() =>
              setView({
                name: "catalog",
              })
            }
            className="px-5 py-2.5 rounded-sm text-sm font-medium"
            style={{
              background: "#6B2737",
              color: "#FBF8F3",
              cursor: "pointer",
            }}
          >
            Browse catalog
          </button>

        </div>
      )}

      {/* CART ITEMS */}
      {cart.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 py-4 border-b"
          style={{
            borderColor: "#EFE9DD",
          }}
        >

          {/* PRODUCT IMAGE */}
          <div
            className="w-14 h-14 rounded-sm flex items-center justify-center shrink-0"
            style={{
              background: "#F4EEE4",
            }}
          >
            <ImageIcon
              size={18}
              style={{
                color: "#C4B8A2",
              }}
            />
          </div>

          {/* PRODUCT DETAILS */}
          <div className="flex-1">

            <div className="font-medium text-sm">
              {item.name}
            </div>

            <div
              className="text-xs"
              style={{
                color: "#A69B89",
              }}
            >
              <Price value={item.price} />
            </div>

          </div>

          {/* QUANTITY */}
          <div className="flex items-center gap-2">

            {/* MINUS */}
            <button
              onClick={() =>
                updateQty(
                  item.id,
                  item.qty - 1
                )
              }
              className="w-7 h-7 flex items-center justify-center border rounded-sm"
              style={{
                borderColor: "#E7DFD2",
                cursor: "pointer",
              }}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            {/* QUANTITY */}
            <span className="text-sm w-4 text-center">
              {item.qty}
            </span>

            {/* PLUS */}
            <button
              onClick={() =>
                updateQty(
                  item.id,
                  item.qty + 1
                )
              }
              className="w-7 h-7 flex items-center justify-center border rounded-sm"
              style={{
                borderColor: "#E7DFD2",
                cursor: "pointer",
              }}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>

          </div>

          {/* DELETE */}
          <button
            onClick={() =>
              removeFromCart(item.id)
            }
            style={{
              color: "#A65B4B",
              cursor: "pointer",
            }}
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 size={15} />
          </button>

        </div>
      ))}

      {/* TOTAL + CHECKOUT */}
      {cart.length > 0 && (
        <>
          {/* TOTAL */}
          <div className="flex items-center justify-between pt-6">

            <span
              className="text-sm"
              style={{
                color: "#6B5E4C",
              }}
            >
              Total
            </span>

            <span
              className="display-font text-2xl"
              style={{
                color: "#6B2737",
              }}
            >
              <Price value={total} />
            </span>

          </div>

          {/* CHECKOUT */}
          <button
            onClick={() =>
              setView({
                name: "custom-order",
                jewellery: getJewelleryType(
                  cart[0]?.category
                ),
              })
            }
            className="w-full mt-6 py-3 rounded-sm text-sm font-medium"
            style={{
              background: "#6B2737",
              color: "#FBF8F3",
              cursor: "pointer",
            }}
          >
            Checkout
          </button>

        </>
      )}

    </div>
  );
}