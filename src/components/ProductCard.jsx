import {
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* =========================================================
   PRICE
========================================================= */

export function Price({ value }) {
  const amount = Number(value);

  if (
    !value ||
    Number.isNaN(amount) ||
    amount <= 0
  ) {
    return <>Price on request</>;
  }

  return (
    <>
      ₹{amount.toLocaleString("en-IN")}
    </>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

export default function ProductCard({
  product,
  onView,
}) {
  const isAvailable =
    product.inStock !== false;

  return (
    <button
      type="button"
      onClick={() => onView(product.id)}
      className="product-card"
    >
      {/* ===================================================
          IMAGE
      =================================================== */}

      <div className="product-card-image">
        {/* IMAGE */}

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <span className="product-image-placeholder">
            <ImageIcon size={30} />
          </span>
        )}

        {/* IMAGE OVERLAY */}

        <div className="product-card-image-overlay" />

        {/* CATEGORY */}

        <span className="product-card-badge">
          {product.category}
        </span>

        {/* VIEW BUTTON */}

        <span className="product-view">
          <span>View Details</span>

          <ArrowRight size={14} />
        </span>

        {/* OUT OF STOCK */}

        {!isAvailable && (
          <span className="product-stock-badge">
            Out of stock
          </span>
        )}

        {/* PREMIUM SHINE */}

        <span className="product-card-shine" />
      </div>

      {/* ===================================================
          INFORMATION
      =================================================== */}

      <div className="product-card-info">
        {/* CATEGORY */}

        <div className="product-category">
          {product.category}
        </div>

        {/* PRODUCT NAME */}

        <h3>
          {product.name}
        </h3>

        {/* PRICE */}

        <div className="product-price">
          <Price value={product.price} />
        </div>

        {/* BOTTOM INFORMATION */}

        <div className="product-bottom">
          <span className="product-material">
            <Sparkles size={12} />

            {product.material ||
              "22K Gold"}
          </span>

          {isAvailable ? (
            <span className="product-available">
              Available
            </span>
          ) : (
            <span className="product-out">
              Out of stock
            </span>
          )}
        </div>
      </div>

      {/* ===================================================
          PRODUCT CARD CSS
      =================================================== */}

      <style>{`
        /* =================================================
           CARD
        ================================================= */

        .product-card {
          position: relative;
          width: 100%;
          min-width: 0;
          padding: 0;
          margin: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #241f1a;
          text-align: left;
          cursor: pointer;
          font: inherit;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* =================================================
           IMAGE
        ================================================= */

        .product-card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 0.82;
          overflow: hidden;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              #f5f0e8,
              #ebe3d7
            );
          isolation: isolate;
        }

        .product-card-image img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1);
          transition:
            transform 0.7s
              cubic-bezier(.2,.7,.2,1),
            filter 0.5s ease;
        }

        /* =================================================
           IMAGE PLACEHOLDER
        ================================================= */

        .product-image-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a49687;
          background:
            radial-gradient(
              circle at center,
              #faf7f1,
              #e8dfd2
            );
        }

        /* =================================================
           OVERLAY
        ================================================= */

        .product-card-image-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            linear-gradient(
              to bottom,
              rgba(20,15,10,0.04) 0%,
              rgba(20,15,10,0) 48%,
              rgba(20,15,10,0.52) 100%
            );
          opacity: 0.72;
          transition:
            opacity 0.45s ease;
        }

        /* =================================================
           CATEGORY BADGE
        ================================================= */

        .product-card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 4;
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.88);
          color: #665a4e;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.13em;
          line-height: 1;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
          box-shadow:
            0 5px 20px rgba(30,20,10,0.08);
        }

        /* =================================================
           VIEW DETAILS
        ================================================= */

        .product-view {
          position: absolute;
          left: 50%;
          bottom: 16px;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border: 1px solid
            rgba(255,255,255,0.22);
          border-radius: 999px;
          background:
            rgba(25,20,15,0.72);
          color: #fffaf2;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.03em;
          white-space: nowrap;
          opacity: 0;
          transform:
            translate(-50%, 12px);
          backdrop-filter: blur(12px);
          transition:
            opacity 0.35s ease,
            transform 0.35s
              cubic-bezier(.2,.8,.2,1),
            background 0.25s ease;
        }

        .product-view:hover {
          background:
            rgba(181,138,67,0.92);
          color: #17120e;
        }

        /* =================================================
           STOCK BADGE
        ================================================= */

        .product-stock-badge {
          position: absolute;
          right: 12px;
          top: 12px;
          z-index: 5;
          padding: 6px 9px;
          border-radius: 999px;
          background:
            rgba(35,28,22,0.72);
          color: #fffaf2;
          font-size: 8px;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }

        /* =================================================
           SHINE
        ================================================= */

        .product-card-shine {
          position: absolute;
          top: -30%;
          left: -80%;
          z-index: 6;
          width: 45%;
          height: 160%;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.24),
              transparent
            );
          transform:
            rotate(18deg)
            translateX(0);
          transition:
            transform 0.9s
              cubic-bezier(.2,.8,.2,1);
        }

        /* =================================================
           INFORMATION
        ================================================= */

        .product-card-info {
          padding: 15px 3px 3px;
        }

        .product-category {
          margin-bottom: 5px;
          color: #a47a3d;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.17em;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .product-card-info h3 {
          margin: 0;
          color: #241f1a;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 18px;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: -0.015em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition:
            color 0.25s ease;
        }

        /* =================================================
           PRICE
        ================================================= */

        .product-price {
          margin-top: 8px;
          color: #241f1a;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        /* =================================================
           BOTTOM
        ================================================= */

        .product-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 11px;
          padding-top: 10px;
          border-top: 1px solid
            rgba(36,31,26,0.07);
          color: #81776d;
          font-size: 9px;
        }

        .product-material {
          min-width: 0;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-material svg {
          flex: 0 0 auto;
          color: #b58a43;
        }

        .product-available {
          flex: 0 0 auto;
          color: #70805f;
          font-weight: 700;
        }

        .product-out {
          flex: 0 0 auto;
          color: #9a5d52;
          font-weight: 700;
        }

        /* =================================================
           DESKTOP HOVER
        ================================================= */

        @media (hover: hover) and (pointer: fine) {
          .product-card:hover
            .product-card-image img {
            transform: scale(1.065);
            filter: saturate(1.05);
          }

          .product-card:hover
            .product-card-image-overlay {
            opacity: 0.92;
          }

          .product-card:hover
            .product-view {
            opacity: 1;
            transform:
              translate(-50%, 0);
          }

          .product-card:hover
            .product-card-shine {
            transform:
              rotate(18deg)
              translateX(440%);
          }

          .product-card:hover
            .product-card-info h3 {
            color: #a47a3d;
          }

          .product-card:hover {
            transform: translateY(-4px);
          }

          .product-card {
            transition:
              transform 0.35s
                cubic-bezier(.2,.8,.2,1);
          }
        }

        /* =================================================
           FOCUS
        ================================================= */

        .product-card:focus-visible
          .product-card-image {
          outline: 2px solid #b58a43;
          outline-offset: 4px;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 900px) {
          .product-card-image {
            border-radius: 15px;
          }

          .product-card-info h3 {
            font-size: 16px;
          }

          .product-price {
            font-size: 13px;
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 760px) {
          .product-card-image {
            aspect-ratio: 0.82;
            border-radius: 14px;
          }

          .product-card-badge {
            top: 8px;
            left: 8px;
            padding: 5px 7px;
            font-size: 7px;
          }

          .product-stock-badge {
            top: 8px;
            right: 8px;
            padding: 5px 7px;
            font-size: 7px;
          }

          .product-view {
            left: 8px;
            right: 8px;
            bottom: 9px;
            justify-content: center;
            transform:
              translateY(0);
            opacity: 1;
            padding: 8px 10px;
            font-size: 9px;
          }

          .product-card-info {
            padding:
              11px
              2px
              2px;
          }

          .product-category {
            margin-bottom: 4px;
            font-size: 7px;
          }

          .product-card-info h3 {
            font-size: 14px;
            line-height: 1.2;
          }

          .product-price {
            margin-top: 6px;
            font-size: 12px;
          }

          .product-bottom {
            margin-top: 8px;
            padding-top: 8px;
            font-size: 8px;
          }

          .product-material svg {
            width: 10px;
            height: 10px;
          }

          /*
             Disable the large shine animation
             on touch devices.
          */

          .product-card-shine {
            display: none;
          }
        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 420px) {
          .product-card-image {
            border-radius: 12px;
          }

          .product-card-info h3 {
            font-size: 13px;
          }

          .product-price {
            font-size: 11px;
          }

          .product-bottom {
            font-size: 7px;
          }

          .product-view {
            font-size: 8px;
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {
          .product-card,
          .product-card-image img,
          .product-card-image-overlay,
          .product-view,
          .product-card-shine,
          .product-card-info h3 {
            transition: none !important;
          }

          .product-card:hover {
            transform: none;
          }
        }
      `}</style>
    </button>
  );
}