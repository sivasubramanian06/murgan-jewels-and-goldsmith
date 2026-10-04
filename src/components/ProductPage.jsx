import {
  MessageCircle,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Gem,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

import { Price } from "./ProductCard";

const WHATSAPP_NUMBER = "919384741246";

export default function ProductPage({
  product,
  setView,
  addToCart,
}) {
  if (!product) {
    return null;
  }

  /* =========================================================
     WHATSAPP
  ========================================================= */

  function askOnWhatsApp() {
    const message = `
Hello Murugan Goldsmith and Jewels,

I am interested in this jewellery.

Product: ${product.name || "Jewellery"}
Category: ${product.category || "Jewellery"}
Material: ${product.material || "22K Gold"}
Availability: ${product.availability || "Please confirm"}

Price: ${
      product.price && Number(product.price) > 0
        ? `₹${Number(product.price).toLocaleString("en-IN")}`
        : "Price on request"
    }

Please share the current price and complete details.

Thank you.
    `.trim();

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =========================================================
     BACK TO CATALOG
  ========================================================= */

  function backToCatalog() {
    setView({
      name: "catalog",
    });
  }

  /* =========================================================
     ADD TO CART
  ========================================================= */

  function handleAddToCart() {
    if (!product.inStock) {
      return;
    }

    addToCart(product);
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="product-page">
      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <div className="product-page-topbar">
        <button
          type="button"
          onClick={backToCatalog}
          className="product-back-btn"
        >
          <ArrowLeft size={15} />

          <span>
            Back to collection
          </span>
        </button>

        <div className="product-breadcrumb">
          <span>Collection</span>

          <ChevronRight size={13} />

          <span>
            {product.category || "Jewellery"}
          </span>
        </div>
      </div>

      {/* =====================================================
          PRODUCT DETAIL
      ===================================================== */}

      <section className="product-detail">
        {/* ===================================================
            IMAGE
        =================================================== */}

        <div className="product-detail-visual">
          <div className="product-detail-image">
            {/* IMAGE */}

            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
              />
            ) : (
              <div className="product-detail-placeholder">
                <ImageIcon size={48} />
              </div>
            )}

            {/* IMAGE OVERLAY */}

            <div className="product-detail-image-overlay" />

            {/* CATEGORY */}

            <div className="product-detail-image-category">
              <Sparkles size={13} />

              <span>
                {product.category ||
                  "Jewellery"}
              </span>
            </div>

            {/* PREMIUM LABEL */}

            <div className="product-detail-image-label">
              <span>MGJ</span>
            </div>
          </div>

          {/* IMAGE FOOTER */}

          <div className="product-image-caption">
            <div>
              <span>
                MURUGAN GOLDSMITH AND JEWELS
              </span>

              <strong>
                Crafted with care
              </strong>
            </div>

            <Gem size={19} />
          </div>
        </div>

        {/* ===================================================
            INFORMATION
        =================================================== */}

        <div className="product-detail-info">
          {/* CATEGORY */}

          <div className="product-detail-category">
            {product.category ||
              "Jewellery"}

            {product.availability && (
              <>
                <span className="product-detail-dot">
                  ·
                </span>

                {product.availability}
              </>
            )}
          </div>

          {/* TITLE */}

          <h1 className="display-font product-detail-title">
            {product.name ||
              "Beautiful Jewellery"}
          </h1>

          {/* DESCRIPTION */}

          {product.description && (
            <p className="product-detail-description">
              {product.description}
            </p>
          )}

          {/* PRICE */}

          <div className="product-detail-price-block">
            <span className="product-detail-price-label">
              Current price
            </span>

            <div className="product-detail-price">
              <Price value={product.price} />
            </div>
          </div>

          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="product-detail-specifications">
            <div className="product-detail-spec-title">
              Jewellery Details
            </div>

            <div className="product-detail-spec-grid">
              {/* MATERIAL */}

              <div className="product-detail-spec">
                <span>Material</span>

                <strong>
                  {product.material ||
                    "22K Gold"}
                </strong>
              </div>

              {/* PURITY */}

              {product.purity && (
                <div className="product-detail-spec">
                  <span>Purity</span>

                  <strong>
                    {product.purity}
                  </strong>
                </div>
              )}

              {/* CATEGORY */}

              <div className="product-detail-spec">
                <span>Category</span>

                <strong>
                  {product.category ||
                    "Jewellery"}
                </strong>
              </div>

              {/* AVAILABILITY */}

              <div className="product-detail-spec">
                <span>Availability</span>

                <strong
                  className={
                    product.inStock
                      ? "product-status-available"
                      : "product-status-unavailable"
                  }
                >
                  {product.inStock
                    ? "Available"
                    : "Currently unavailable"}
                </strong>
              </div>
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="product-actions">
            {/* ADD TO CART */}

            <button
              type="button"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className="product-add-btn"
            >
              <ShoppingBag size={17} />

              <span>
                {product.inStock
                  ? "Add to cart"
                  : "Out of stock"}
              </span>
            </button>

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={askOnWhatsApp}
              className="product-whatsapp-btn"
            >
              <MessageCircle size={17} />

              <span>
                Ask on WhatsApp
              </span>
            </button>
          </div>

          {/* =================================================
              TRUST FEATURES
          ================================================= */}

          <div className="product-trust-row">
            <div className="product-trust-item">
              <ShieldCheck size={17} />

              <div>
                <strong>
                  Quality
                </strong>

                <span>
                  Carefully crafted
                </span>
              </div>
            </div>

            <div className="product-trust-item">
              <Gem size={17} />

              <div>
                <strong>
                  Gold Jewellery
                </strong>

                <span>
                  Premium finish
                </span>
              </div>
            </div>

            <div className="product-trust-item">
              <MessageCircle size={17} />

              <div>
                <strong>
                  Personal Help
                </strong>

                <span>
                  WhatsApp support
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              NOTE
          ================================================= */}

          <div className="product-note">
            <MessageCircle size={17} />

            <p>
              Interested in this design?
              Contact us on WhatsApp for
              current price, availability and
              customisation options.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CUSTOM DESIGN CTA
      ===================================================== */}

      <section className="product-custom-section">
        <div className="product-custom-decoration" />

        <div className="product-custom-content">
          <div>
            <div className="product-custom-eyebrow">
              <span />
              CUSTOM JEWELLERY
            </div>

            <h2 className="display-font">
              Want something
              <span> made specially for you?</span>
            </h2>

            <p>
              Create your own jewellery estimate
              based on gold weight, purity,
              making charge, stone charge and
              advance amount.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setView({
                name: "custom-order",
              })
            }
            className="product-custom-btn"
          >
            <Sparkles size={17} />

            Create Custom Jewellery

            <ArrowLeft
              size={16}
              className="product-custom-arrow"
            />
          </button>
        </div>
      </section>

      {/* =====================================================
          PAGE STYLES
      ===================================================== */}

      <style>{`
        /* ===================================================
           PAGE
        =================================================== */

        .product-page {
          min-height: 100vh;
          padding:
            28px
            max(20px, 5vw)
            80px;
          background:
            radial-gradient(
              circle at 12% 20%,
              rgba(181,138,67,0.07),
              transparent 25%
            ),
            #fbf8f3;
          color: #241f1a;
          overflow: hidden;
        }

        /* ===================================================
           TOP BAR
        =================================================== */

        .product-page-topbar {
          width: min(1180px, 100%);
          margin: 0 auto 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .product-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          color: #675e54;
          padding: 8px 0;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .product-back-btn:hover {
          color: #a47a3d;
          transform: translateX(-3px);
        }

        .product-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9a9086;
          font-size: 10px;
        }

        .product-breadcrumb span:last-child {
          color: #665b50;
          font-weight: 700;
        }

        /* ===================================================
           PRODUCT DETAIL
        =================================================== */

        .product-detail {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(400px, 0.95fr);
          gap: clamp(45px, 7vw, 100px);
          align-items: start;
        }

        /* ===================================================
           VISUAL
        =================================================== */

        .product-detail-visual {
          position: sticky;
          top: 25px;
          animation:
            productImageEnter
            0.8s
            cubic-bezier(.2,.8,.2,1)
            both;
        }

        .product-detail-image {
          position: relative;
          width: 100%;
          aspect-ratio: 0.88;
          overflow: hidden;
          border-radius: 26px;
          background:
            linear-gradient(
              145deg,
              #f3ede4,
              #e7ded1
            );
          box-shadow:
            0 25px 70px
            rgba(36,31,26,0.13);
          isolation: isolate;
        }

        .product-detail-image img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transform: scale(1.01);
          transition:
            transform 1.1s
              cubic-bezier(.2,.8,.2,1);
        }

        .product-detail-image:hover img {
          transform: scale(1.045);
        }

        .product-detail-placeholder {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #a59685;
          background:
            radial-gradient(
              circle,
              #faf7f1,
              #e5dbce
            );
        }

        .product-detail-image-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            linear-gradient(
              to bottom,
              rgba(20,15,10,0.03),
              transparent 55%,
              rgba(20,15,10,0.42)
            );
        }

        .product-detail-image-category {
          position: absolute;
          top: 18px;
          left: 18px;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 999px;
          background:
            rgba(255,255,255,0.88);
          color: #695c4e;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          backdrop-filter: blur(12px);
          box-shadow:
            0 8px 25px
            rgba(30,20,10,0.08);
        }

        .product-detail-image-category svg {
          color: #b58a43;
        }

        .product-detail-image-label {
          position: absolute;
          right: 18px;
          top: 18px;
          z-index: 5;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid
            rgba(255,255,255,0.4);
          border-radius: 50%;
          background:
            rgba(30,23,18,0.45);
          color: #fffaf2;
          font-family:
            Georgia,
            serif;
          font-size: 12px;
          letter-spacing: 0.05em;
          backdrop-filter: blur(12px);
        }

        /* ===================================================
           IMAGE FOOTER
        =================================================== */

        .product-image-caption {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 15px 4px 0;
          color: #857b70;
        }

        .product-image-caption > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-image-caption span {
          font-size: 8px;
          letter-spacing: 0.18em;
          font-weight: 800;
          color: #aa7e3d;
        }

        .product-image-caption strong {
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 14px;
          font-weight: 500;
          color: #665b50;
        }

        .product-image-caption svg {
          color: #b58a43;
        }

        /* ===================================================
           INFORMATION
        =================================================== */

        .product-detail-info {
          padding-top: 15px;
          animation:
            productInfoEnter
            0.8s
            0.15s
            cubic-bezier(.2,.8,.2,1)
            both;
        }

        .product-detail-category {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a47a3d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          line-height: 1.4;
          text-transform: uppercase;
        }

        .product-detail-dot {
          color: #b9aa99;
        }

        .product-detail-title {
          max-width: 650px;
          margin: 14px 0 0;
          color: #241f1a;
          font-size: clamp(42px, 5vw, 72px);
          font-weight: 500;
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .product-detail-description {
          max-width: 600px;
          margin: 22px 0 0;
          color: #756b61;
          font-size: 14px;
          line-height: 1.85;
        }

        /* ===================================================
           PRICE
        =================================================== */

        .product-detail-price-block {
          margin-top: 27px;
          padding:
            20px
            0
            22px;
          border-top:
            1px solid
            rgba(36,31,26,0.08);
          border-bottom:
            1px solid
            rgba(36,31,26,0.08);
        }

        .product-detail-price-label {
          display: block;
          margin-bottom: 5px;
          color: #9a9086;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .product-detail-price {
          color: #241f1a;
          font-size: 25px;
          font-weight: 800;
        }

        /* ===================================================
           SPECIFICATIONS
        =================================================== */

        .product-detail-specifications {
          margin-top: 25px;
        }

        .product-detail-spec-title {
          margin-bottom: 13px;
          color: #4d443c;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .product-detail-spec-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          border-top:
            1px solid
            rgba(36,31,26,0.07);
        }

        .product-detail-spec {
          min-width: 0;
          padding:
            14px
            10px
            14px
            0;
          border-bottom:
            1px solid
            rgba(36,31,26,0.07);
        }

        .product-detail-spec:nth-child(even) {
          padding-left: 15px;
          border-left:
            1px solid
            rgba(36,31,26,0.07);
        }

        .product-detail-spec span {
          display: block;
          margin-bottom: 5px;
          color: #9a9086;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .product-detail-spec strong {
          display: block;
          color: #352e28;
          font-size: 12px;
          font-weight: 700;
        }

        .product-status-available {
          color: #70805f !important;
        }

        .product-status-unavailable {
          color: #9a5d52 !important;
        }

        /* ===================================================
           ACTIONS
        =================================================== */

        .product-actions {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 10px;
          margin-top: 28px;
        }

        .product-add-btn,
        .product-whatsapp-btn {
          min-height: 51px;
          border: 0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .product-add-btn {
          background: #241f1a;
          color: #fffaf2;
          box-shadow:
            0 12px 30px
            rgba(36,31,26,0.13);
        }

        .product-add-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow:
            0 16px 35px
            rgba(36,31,26,0.18);
        }

        .product-add-btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .product-whatsapp-btn {
          background: #c99b52;
          color: #19140f;
          box-shadow:
            0 12px 30px
            rgba(181,138,67,0.17);
        }

        .product-whatsapp-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 38px
            rgba(181,138,67,0.25);
        }

        /* ===================================================
           TRUST
        =================================================== */

        .product-trust-row {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 22px;
        }

        .product-trust-item {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 11px 0;
          color: #a47a3d;
        }

        .product-trust-item svg {
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .product-trust-item div {
          min-width: 0;
        }

        .product-trust-item strong,
        .product-trust-item span {
          display: block;
        }

        .product-trust-item strong {
          color: #514940;
          font-size: 9px;
          font-weight: 800;
        }

        .product-trust-item span {
          margin-top: 3px;
          color: #948a80;
          font-size: 8px;
          line-height: 1.3;
        }

        /* ===================================================
           NOTE
        =================================================== */

        .product-note {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 20px;
          padding: 15px;
          border:
            1px solid
            rgba(181,138,67,0.18);
          border-radius: 13px;
          background:
            rgba(181,138,67,0.055);
          color: #8a7964;
        }

        .product-note svg {
          flex: 0 0 auto;
          margin-top: 2px;
          color: #a47a3d;
        }

        .product-note p {
          margin: 0;
          font-size: 11px;
          line-height: 1.7;
        }

        /* ===================================================
           CUSTOM SECTION
        =================================================== */

        .product-custom-section {
          position: relative;
          width: min(1180px, 100%);
          min-height: 260px;
          margin: 95px auto 0;
          padding:
            48px
            55px;
          overflow: hidden;
          border-radius: 26px;
          background:
            linear-gradient(
              120deg,
              #211a15,
              #302319 55%,
              #17120f
            );
          color: #fffaf2;
          box-shadow:
            0 25px 70px
            rgba(36,31,26,0.14);
        }

        .product-custom-section::after {
          content: "";
          position: absolute;
          right: -80px;
          top: -120px;
          width: 330px;
          height: 330px;
          border:
            1px solid
            rgba(201,155,82,0.23);
          border-radius: 50%;
          box-shadow:
            0 0 0 35px
            rgba(201,155,82,0.03),
            0 0 0 70px
            rgba(201,155,82,0.02);
        }

        .product-custom-decoration {
          position: absolute;
          left: -100px;
          bottom: -150px;
          width: 380px;
          height: 240px;
          border-radius: 50%;
          background:
            rgba(201,155,82,0.1);
          filter: blur(55px);
        }

        .product-custom-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .product-custom-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 13px;
          color: #b58a43;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .product-custom-eyebrow span {
          width: 25px;
          height: 1px;
          background: #b58a43;
        }

        .product-custom-content h2 {
          margin: 0;
          font-size: clamp(31px, 4vw, 51px);
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.04em;
        }

        .product-custom-content h2 span {
          display: block;
          color: #c99b52;
        }

        .product-custom-content p {
          max-width: 600px;
          margin: 17px 0 0;
          color: rgba(255,250,242,0.62);
          font-size: 12px;
          line-height: 1.8;
        }

        .product-custom-btn {
          flex: 0 0 auto;
          min-height: 48px;
          padding:
            0
            18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 999px;
          background: #c99b52;
          color: #17120e;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          box-shadow:
            0 15px 40px
            rgba(201,155,82,0.18);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .product-custom-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 20px 48px
            rgba(201,155,82,0.28);
        }

        .product-custom-arrow {
          transform: rotate(180deg);
        }

        /* ===================================================
           ANIMATIONS
        =================================================== */

        @keyframes productImageEnter {
          from {
            opacity: 0;
            transform:
              translateX(-25px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateX(0)
              scale(1);
          }
        }

        @keyframes productInfoEnter {
          from {
            opacity: 0;
            transform:
              translateX(25px);
          }

          to {
            opacity: 1;
            transform:
              translateX(0);
          }
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (max-width: 1000px) {
          .product-detail {
            grid-template-columns:
              minmax(0, 1fr)
              minmax(330px, 0.9fr);
            gap: 45px;
          }

          .product-detail-title {
            font-size: 48px;
          }

          .product-trust-row {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 760px) {
          .product-page {
            padding:
              18px
              12px
              50px;
          }

          .product-page-topbar {
            margin-bottom: 23px;
          }

          .product-breadcrumb {
            display: none;
          }

          .product-detail {
            display: block;
          }

          .product-detail-visual {
            position: relative;
            top: auto;
          }

          .product-detail-image {
            border-radius: 20px;
            aspect-ratio: 0.9;
          }

          .product-detail-image-category {
            top: 12px;
            left: 12px;
            padding: 7px 10px;
            font-size: 8px;
          }

          .product-detail-image-label {
            top: 12px;
            right: 12px;
            width: 37px;
            height: 37px;
            font-size: 10px;
          }

          .product-image-caption {
            padding-top: 11px;
          }

          .product-image-caption span {
            font-size: 7px;
          }

          .product-image-caption strong {
            font-size: 12px;
          }

          .product-detail-info {
            padding-top: 36px;
          }

          .product-detail-category {
            font-size: 8px;
          }

          .product-detail-title {
            margin-top: 11px;
            font-size: clamp(
              38px,
              12vw,
              54px
            );
          }

          .product-detail-description {
            margin-top: 17px;
            font-size: 12px;
            line-height: 1.75;
          }

          .product-detail-price-block {
            margin-top: 21px;
            padding:
              16px
              0
              18px;
          }

          .product-detail-price {
            font-size: 21px;
          }

          .product-detail-specifications {
            margin-top: 21px;
          }

          .product-detail-spec-grid {
            grid-template-columns: 1fr;
          }

          .product-detail-spec {
            padding:
              12px
              0;
          }

          .product-detail-spec:nth-child(even) {
            padding-left: 0;
            border-left: 0;
          }

          .product-actions {
            grid-template-columns: 1fr;
            margin-top: 22px;
          }

          .product-add-btn,
          .product-whatsapp-btn {
            min-height: 50px;
          }

          .product-trust-row {
            grid-template-columns: 1fr;
            gap: 0;
            margin-top: 17px;
          }

          .product-trust-item {
            padding:
              10px 0;
            border-bottom:
              1px solid
              rgba(36,31,26,0.06);
          }

          .product-note {
            margin-top: 16px;
          }

          .product-custom-section {
            margin-top: 55px;
            padding:
              32px
              22px;
            border-radius: 21px;
          }

          .product-custom-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 25px;
          }

          .product-custom-content h2 {
            font-size: 33px;
          }

          .product-custom-btn {
            width: 100%;
          }
        }

        /* ===================================================
           SMALL MOBILE
        =================================================== */

        @media (max-width: 420px) {
          .product-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .product-detail-title {
            font-size: 37px;
          }

          .product-custom-content h2 {
            font-size: 29px;
          }
        }

        /* ===================================================
           REDUCED MOTION
        =================================================== */

        @media (prefers-reduced-motion: reduce) {
          .product-detail-visual,
          .product-detail-info {
            animation: none !important;
          }

          .product-detail-image img,
          .product-back-btn,
          .product-add-btn,
          .product-whatsapp-btn,
          .product-custom-btn {
            transition: none !important;
          }

          .product-detail-image:hover img {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}