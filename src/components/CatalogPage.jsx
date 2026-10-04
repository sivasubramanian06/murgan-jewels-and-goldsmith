import { useEffect, useRef, useState } from "react";
import {
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
  ChevronRight,
} from "lucide-react";

import ProductCard from "./ProductCard";
import { CATEGORIES } from "../data/seedProducts";

export default function CatalogPage({
  products,
  setView,
  initialCategory = "All",
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const pageRef = useRef(null);
  const searchRef = useRef(null);

  /* =========================================================
     UPDATE CATEGORY WHEN COMING FROM HOMEPAGE
  ========================================================= */

  useEffect(() => {
    setCategory(initialCategory || "All");
  }, [initialCategory]);

  /* =========================================================
     REMOVE CUSTOM FROM PRODUCT FILTERS
  ========================================================= */

  const catalogueCategories = CATEGORIES.filter(
    (item) => item !== "Custom"
  );

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filtered = products.filter((product) => {
    const matchesCategory =
      category === "All" ||
      product.category === category;

    const productName =
      product.name?.toLowerCase() || "";

    const searchText =
      query.toLowerCase().trim();

    const matchesSearch =
      productName.includes(searchText);

    return matchesCategory && matchesSearch;
  });

  /* =========================================================
     OPEN CUSTOM JEWELLERY
  ========================================================= */

  function openCustomOrder() {
    setView({
      name: "custom-order",
    });
  }

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  function resetFilters() {
    setCategory("All");
    setQuery("");
    setShowMobileFilters(false);

    setView({
      name: "catalog",
      category: "All",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     OPEN CATEGORY
  ========================================================= */

  function selectCategory(categoryName) {
    setCategory(categoryName);
    setShowMobileFilters(false);

    setView({
      name: "catalog",
      category: categoryName,
    });
  }

  /* =========================================================
     OPEN PRODUCT
  ========================================================= */

  function openProduct(id) {
    setView({
      name: "product",
      id,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     CLEAR SEARCH
  ========================================================= */

  function clearSearch() {
    setQuery("");

    requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main
      ref={pageRef}
      className="catalog-page"
    >
      {/* =====================================================
          PREMIUM CATALOG HERO
      ===================================================== */}

      <section className="catalog-hero">
        <div className="catalog-hero-glow catalog-hero-glow-one" />
        <div className="catalog-hero-glow catalog-hero-glow-two" />

        <div className="catalog-hero-content">
          <div className="catalog-hero-copy">
            <div className="catalog-eyebrow-row">
              <span className="catalog-eyebrow-line" />

              <p className="catalog-eyebrow">
                 Sri MURUGAN GOLDSMITH AND JEWELS
              </p>
            </div>

            <h1 className="display-font catalog-title">
              Jewellery
              <span> Collection</span>
            </h1>

            <p className="catalog-description">
              Explore our handcrafted jewellery collection,
              created for everyday elegance, celebrations,
              and timeless moments.
            </p>

            <div className="catalog-hero-actions">
              <button
                type="button"
                onClick={() => {
                  const element =
                    document.querySelector(
                      ".catalog-products-section"
                    );

                  element?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="catalog-primary-btn"
              >
                Explore Collection

                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={openCustomOrder}
                className="catalog-secondary-btn"
              >
                <Sparkles size={16} />

                Custom Jewellery
              </button>
            </div>
          </div>

          {/* =================================================
              HERO DECORATION
          ================================================= */}

          <div className="catalog-hero-decoration">
            <div className="catalog-orbit catalog-orbit-one" />
            <div className="catalog-orbit catalog-orbit-two" />

            <div className="catalog-hero-medallion">
              <Sparkles size={25} />

              <span>
                Crafted
              </span>

              <small>
                With Care
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH + FILTER AREA
      ===================================================== */}

      <section className="catalog-toolbar-section">
        <div className="catalog-toolbar">
          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="catalog-search-wrapper">
            <div className="catalog-search">
              <Search size={18} />

              <input
                ref={searchRef}
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search jewellery..."
                type="text"
                aria-label="Search jewellery"
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="catalog-search-clear"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              MOBILE FILTER BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setShowMobileFilters(
                !showMobileFilters
              )
            }
            className="catalog-mobile-filter-btn"
          >
            <SlidersHorizontal size={17} />

            <span>
              Categories
            </span>

            <ChevronRight
              size={16}
              className={
                showMobileFilters
                  ? "catalog-chevron-open"
                  : ""
              }
            />
          </button>
        </div>

        {/* ===================================================
            CATEGORY FILTERS
        =================================================== */}

        <div
          className={`catalog-category-wrapper ${
            showMobileFilters
              ? "catalog-category-wrapper-open"
              : ""
          }`}
        >
          <div className="catalog-category-scroll">
            <button
              type="button"
              onClick={() =>
                selectCategory("All")
              }
              className={`catalog-filter ${
                category === "All"
                  ? "active"
                  : ""
              }`}
            >
              <span>All</span>
            </button>

            {catalogueCategories.map(
              (categoryName) => (
                <button
                  key={categoryName}
                  type="button"
                  onClick={() =>
                    selectCategory(
                      categoryName
                    )
                  }
                  className={`catalog-filter ${
                    category === categoryName
                      ? "active"
                      : ""
                  }`}
                >
                  <span>
                    {categoryName}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          RESULT HEADER
      ===================================================== */}

      <section className="catalog-products-section">
        <div className="catalog-result-row">
          <div className="catalog-result-heading">
            <p className="catalog-result-kicker">
              Our Collection
            </p>

            <h2 className="display-font">
              {category === "All"
                ? "All Jewellery"
                : category}
            </h2>
          </div>

          <div className="catalog-result-count">
            <span className="catalog-count-number">
              {filtered.length}
            </span>

            <span>
              {filtered.length === 1
                ? "piece"
                : "pieces"}
            </span>
          </div>
        </div>

        {/* ===================================================
            ACTIVE FILTER INFO
        =================================================== */}

        {(category !== "All" || query) && (
          <div className="catalog-active-filters">
            {category !== "All" && (
              <button
                type="button"
                onClick={() =>
                  selectCategory("All")
                }
                className="catalog-active-chip"
              >
                {category}

                <X size={13} />
              </button>
            )}

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="catalog-active-chip"
              >
                Search: "{query}"

                <X size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="catalog-clear-all"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ===================================================
            PRODUCTS
        =================================================== */}

        {filtered.length > 0 ? (
          <div className="catalog-product-grid">
            {filtered.map(
              (product, index) => (
                <div
                  key={product.id}
                  className="catalog-product-reveal"
                  style={{
                    "--catalog-delay": `${Math.min(
                      index * 45,
                      450
                    )}ms`,
                  }}
                >
                  <ProductCard
                    product={product}
                    onView={openProduct}
                  />
                </div>
              )
            )}
          </div>
        ) : (
          /* ================================================
             EMPTY STATE
          ================================================= */

          <div className="catalog-empty">
            <div className="catalog-empty-icon">
              <Search size={26} />
            </div>

            <p className="catalog-empty-kicker">
              COLLECTION SEARCH
            </p>

            <h2 className="display-font">
              No jewellery found
            </h2>

            <p>
              We couldn't find a jewellery piece
              matching your search. Try another
              name or category.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="catalog-reset-btn"
            >
              View all jewellery

              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          CUSTOM JEWELLERY BANNER
      ===================================================== */}

      <section className="catalog-custom-banner">
        <div className="catalog-custom-banner-glow" />

        <div className="catalog-custom-content">
          <div className="catalog-custom-copy">
            <div className="catalog-eyebrow-row">
              <span className="catalog-eyebrow-line" />

              <p className="catalog-eyebrow">
                MADE ESPECIALLY FOR YOU
              </p>
            </div>

            <h2 className="display-font">
              Have your own
              <span> design in mind?</span>
            </h2>

            <p>
              Create a custom jewellery estimate
              based on your gold weight, purity,
              making charge, stone charge and
              advance amount.
            </p>
          </div>

          <button
            type="button"
            onClick={openCustomOrder}
            className="catalog-custom-banner-btn"
          >
            <Sparkles size={17} />

            <span>
              Create Custom Jewellery
            </span>

            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* =====================================================
          CATALOG PAGE STYLES
      ===================================================== */}

      <style>{`
        /* ===================================================
           PAGE
        =================================================== */

        .catalog-page {
          width: 100%;
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 85% 8%,
              rgba(184, 134, 11, 0.08),
              transparent 25%
            ),
            #fbf8f3;
          color: #241f1a;
          overflow: hidden;
        }

        /* ===================================================
           HERO
        =================================================== */

        .catalog-hero {
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: center;
          padding: 80px 6vw 90px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #171310 0%,
              #241d18 45%,
              #100e0c 100%
            );
          color: #fffaf2;
        }

        .catalog-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.16;
          background-image:
            radial-gradient(
              rgba(255,255,255,0.7) 0.7px,
              transparent 0.7px
            );
          background-size: 6px 6px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent
          );
        }

        .catalog-hero::after {
          content: "";
          position: absolute;
          left: -10%;
          right: -10%;
          bottom: -120px;
          height: 240px;
          border-radius: 50%;
          background: #fbf8f3;
        }

        .catalog-hero-content {
          position: relative;
          z-index: 2;
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          align-items: center;
          gap: 60px;
        }

        .catalog-hero-copy {
          max-width: 760px;
          animation: catalogHeroIn 0.9s ease both;
        }

        .catalog-eyebrow-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .catalog-eyebrow {
          margin: 0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b58a43;
        }

        .catalog-eyebrow-line {
          width: 28px;
          height: 1px;
          display: block;
          background: #b58a43;
        }

        .catalog-title {
          margin: 0;
          max-width: 760px;
          font-size: clamp(48px, 7vw, 92px);
          line-height: 0.94;
          letter-spacing: -0.045em;
          font-weight: 500;
        }

        .catalog-title span,
        .catalog-custom-copy h2 span {
          display: block;
          color: #c99b52;
        }

        .catalog-description {
          max-width: 620px;
          margin: 28px 0 0;
          color: rgba(255, 250, 242, 0.68);
          font-size: 15px;
          line-height: 1.8;
        }

        .catalog-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .catalog-primary-btn,
        .catalog-secondary-btn,
        .catalog-custom-banner-btn,
        .catalog-reset-btn {
          border: 0;
          cursor: pointer;
          font: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .catalog-primary-btn {
          padding: 13px 20px;
          border-radius: 999px;
          background: #c99b52;
          color: #17120e;
          font-size: 13px;
          font-weight: 700;
          box-shadow:
            0 10px 35px rgba(201, 155, 82, 0.2);
        }

        .catalog-primary-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 15px 42px rgba(201, 155, 82, 0.3);
        }

        .catalog-secondary-btn {
          padding: 13px 19px;
          border-radius: 999px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fffaf2;
          font-size: 13px;
          font-weight: 600;
        }

        .catalog-secondary-btn:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.12);
        }

        /* ===================================================
           HERO DECORATION
        =================================================== */

        .catalog-hero-decoration {
          position: relative;
          width: 310px;
          height: 310px;
          margin: 0 auto;
          animation: catalogDecorationIn 1.1s ease both;
        }

        .catalog-orbit {
          position: absolute;
          inset: 20px;
          border: 1px solid rgba(201, 155, 82, 0.35);
          border-radius: 50%;
        }

        .catalog-orbit-one {
          transform: rotate(25deg) scaleX(0.68);
          animation: catalogOrbit 12s linear infinite;
        }

        .catalog-orbit-two {
          inset: 48px;
          transform: rotate(-35deg) scaleX(0.8);
          border-color: rgba(201, 155, 82, 0.22);
          animation: catalogOrbitReverse 16s linear infinite;
        }

        .catalog-hero-medallion {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 145px;
          height: 145px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background:
            radial-gradient(
              circle,
              rgba(201,155,82,0.18),
              rgba(201,155,82,0.02) 65%
            );
          border: 1px solid rgba(201,155,82,0.35);
          box-shadow:
            0 0 70px rgba(201,155,82,0.08);
          color: #c99b52;
        }

        .catalog-hero-medallion span {
          font-size: 15px;
          font-weight: 600;
          color: #fffaf2;
        }

        .catalog-hero-medallion small {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,250,242,0.5);
        }

        /* ===================================================
           TOOLBAR
        =================================================== */

        .catalog-toolbar-section {
          position: relative;
          z-index: 5;
          width: min(1180px, calc(100% - 40px));
          margin: -28px auto 0;
        }

        .catalog-toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(36,31,26,0.08);
          border-radius: 20px;
          box-shadow:
            0 18px 60px rgba(36,31,26,0.08);
          backdrop-filter: blur(18px);
        }

        .catalog-search-wrapper {
          flex: 1;
        }

        .catalog-search {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border-radius: 13px;
          background: #f7f3ed;
          border: 1px solid transparent;
          color: #8b8177;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .catalog-search:focus-within {
          background: #fff;
          border-color: rgba(181,138,67,0.35);
          box-shadow:
            0 0 0 4px rgba(181,138,67,0.07);
        }

        .catalog-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #241f1a;
          font: inherit;
          font-size: 13px;
        }

        .catalog-search input::placeholder {
          color: #9b9289;
        }

        .catalog-search-clear {
          width: 28px;
          height: 28px;
          flex: 0 0 auto;
          border: 0;
          border-radius: 50%;
          background: #e8e1d8;
          color: #62594f;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .catalog-mobile-filter-btn {
          display: none;
          height: 48px;
          padding: 0 15px;
          border: 1px solid rgba(36,31,26,0.08);
          border-radius: 13px;
          background: #fff;
          color: #332c25;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 600;
        }

        .catalog-mobile-filter-btn svg:last-child {
          transition: transform 0.25s ease;
        }

        .catalog-chevron-open {
          transform: rotate(90deg);
        }

        /* ===================================================
           CATEGORY FILTERS
        =================================================== */

        .catalog-category-wrapper {
          margin-top: 13px;
        }

        .catalog-category-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 2px 2px 10px;
          scrollbar-width: none;
        }

        .catalog-category-scroll::-webkit-scrollbar {
          display: none;
        }

        .catalog-filter {
          flex: 0 0 auto;
          border: 1px solid rgba(36,31,26,0.09);
          background: rgba(255,255,255,0.75);
          color: #6b6259;
          border-radius: 999px;
          padding: 10px 17px;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .catalog-filter:hover {
          transform: translateY(-2px);
          color: #241f1a;
          border-color: rgba(181,138,67,0.3);
        }

        .catalog-filter.active {
          background: #241f1a;
          color: #fffaf2;
          border-color: #241f1a;
          box-shadow:
            0 8px 22px rgba(36,31,26,0.13);
        }

        /* ===================================================
           PRODUCTS SECTION
        =================================================== */

        .catalog-products-section {
          width: min(1180px, calc(100% - 40px));
          margin: 55px auto 0;
          scroll-margin-top: 30px;
        }

        .catalog-result-row {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .catalog-result-kicker {
          margin: 0 0 6px;
          color: #aa7e3d;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .catalog-result-heading h2 {
          margin: 0;
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .catalog-result-count {
          display: flex;
          align-items: baseline;
          gap: 6px;
          color: #887e73;
          font-size: 12px;
        }

        .catalog-count-number {
          color: #241f1a;
          font-size: 24px;
          font-weight: 700;
        }

        /* ===================================================
           ACTIVE FILTERS
        =================================================== */

        .catalog-active-filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 20px;
        }

        .catalog-active-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(181,138,67,0.25);
          background: rgba(181,138,67,0.07);
          color: #75572d;
          border-radius: 999px;
          padding: 7px 10px;
          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .catalog-clear-all {
          border: 0;
          background: transparent;
          color: #8b8177;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ===================================================
           PRODUCT GRID
        =================================================== */

        .catalog-product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .catalog-product-reveal {
          min-width: 0;
          animation:
            catalogProductIn
            0.65s
            cubic-bezier(.2,.8,.2,1)
            both;
          animation-delay: var(--catalog-delay);
        }

        /* ===================================================
           EMPTY STATE
        =================================================== */

        .catalog-empty {
          min-height: 390px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 50px 20px;
          border: 1px solid rgba(36,31,26,0.07);
          border-radius: 24px;
          background: rgba(255,255,255,0.6);
        }

        .catalog-empty-icon {
          width: 60px;
          height: 60px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          margin-bottom: 20px;
          background: #f0e9df;
          color: #a67b3d;
        }

        .catalog-empty-kicker {
          margin: 0 0 8px;
          color: #a67b3d;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .catalog-empty h2 {
          margin: 0;
          font-size: 34px;
          font-weight: 500;
        }

        .catalog-empty > p:not(.catalog-empty-kicker) {
          max-width: 450px;
          margin: 12px auto 24px;
          color: #81776d;
          font-size: 13px;
          line-height: 1.7;
        }

        .catalog-reset-btn {
          padding: 12px 18px;
          border-radius: 999px;
          background: #241f1a;
          color: #fffaf2;
          font-size: 12px;
          font-weight: 700;
        }

        .catalog-reset-btn:hover {
          transform: translateY(-2px);
        }

        /* ===================================================
           CUSTOM BANNER
        =================================================== */

        .catalog-custom-banner {
          position: relative;
          width: min(1180px, calc(100% - 40px));
          min-height: 300px;
          margin: 90px auto 70px;
          padding: 55px;
          overflow: hidden;
          border-radius: 28px;
          background:
            linear-gradient(
              120deg,
              #211a15,
              #302319 55%,
              #17120f
            );
          color: #fffaf2;
          box-shadow:
            0 25px 70px rgba(36,31,26,0.15);
        }

        .catalog-custom-banner::before {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          right: -80px;
          top: -130px;
          border-radius: 50%;
          border: 1px solid rgba(201,155,82,0.25);
          box-shadow:
            0 0 0 35px rgba(201,155,82,0.03),
            0 0 0 70px rgba(201,155,82,0.02);
        }

        .catalog-custom-banner-glow {
          position: absolute;
          width: 400px;
          height: 200px;
          left: -180px;
          bottom: -120px;
          border-radius: 50%;
          background: rgba(201,155,82,0.12);
          filter: blur(60px);
        }

        .catalog-custom-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .catalog-custom-copy {
          max-width: 680px;
        }

        .catalog-custom-copy h2 {
          margin: 0;
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 500;
        }

        .catalog-custom-copy > p {
          max-width: 600px;
          margin: 20px 0 0;
          color: rgba(255,250,242,0.64);
          font-size: 13px;
          line-height: 1.8;
        }

        .catalog-custom-banner-btn {
          flex: 0 0 auto;
          padding: 14px 20px;
          border-radius: 999px;
          background: #c99b52;
          color: #17120e;
          font-size: 12px;
          font-weight: 800;
          box-shadow:
            0 15px 40px rgba(201,155,82,0.18);
        }

        .catalog-custom-banner-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 20px 50px rgba(201,155,82,0.28);
        }

        /* ===================================================
           ANIMATIONS
        =================================================== */

        @keyframes catalogHeroIn {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes catalogDecorationIn {
          from {
            opacity: 0;
            transform: scale(0.82) rotate(-8deg);
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes catalogOrbit {
          from {
            transform:
              rotate(25deg)
              scaleX(0.68);
          }

          to {
            transform:
              rotate(385deg)
              scaleX(0.68);
          }
        }

        @keyframes catalogOrbitReverse {
          from {
            transform:
              rotate(-35deg)
              scaleX(0.8);
          }

          to {
            transform:
              rotate(-395deg)
              scaleX(0.8);
          }
        }

        @keyframes catalogProductIn {
          from {
            opacity: 0;
            transform:
              translateY(25px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (max-width: 1050px) {
          .catalog-product-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .catalog-hero-content {
            grid-template-columns:
              minmax(0, 1fr) 260px;
            gap: 35px;
          }

          .catalog-hero-decoration {
            width: 250px;
            height: 250px;
          }

          .catalog-hero-medallion {
            width: 120px;
            height: 120px;
          }
        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 760px) {
          .catalog-hero {
            min-height: auto;
            padding:
              55px
              20px
              85px;
          }

          .catalog-hero::after {
            bottom: -160px;
            height: 230px;
          }

          .catalog-hero-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .catalog-title {
            font-size: clamp(
              45px,
              14vw,
              70px
            );
          }

          .catalog-description {
            margin-top: 20px;
            font-size: 13px;
          }

          .catalog-hero-actions {
            width: 100%;
          }

          .catalog-primary-btn,
          .catalog-secondary-btn {
            flex: 1;
            min-width: 0;
            padding-left: 14px;
            padding-right: 14px;
          }

          .catalog-hero-decoration {
            width: 190px;
            height: 190px;
            margin: 5px auto 0;
          }

          .catalog-hero-medallion {
            width: 95px;
            height: 95px;
          }

          .catalog-hero-medallion span {
            font-size: 12px;
          }

          .catalog-hero-medallion small {
            font-size: 7px;
          }

          .catalog-toolbar-section {
            width:
              calc(100% - 24px);
            margin-top: -25px;
          }

          .catalog-toolbar {
            padding: 10px;
            border-radius: 17px;
          }

          .catalog-mobile-filter-btn {
            display: flex;
          }

          .catalog-category-wrapper {
            display: none;
          }

          .catalog-category-wrapper-open {
            display: block;
            padding: 10px;
            border-radius: 14px;
            background: rgba(255,255,255,0.92);
            box-shadow:
              0 15px 35px rgba(36,31,26,0.08);
          }

          .catalog-category-scroll {
            flex-wrap: wrap;
            overflow: visible;
            padding: 0;
          }

          .catalog-filter {
            padding: 9px 13px;
            font-size: 11px;
          }

          .catalog-products-section {
            width:
              calc(100% - 24px);
            margin-top: 42px;
          }

          .catalog-result-row {
            align-items: end;
          }

          .catalog-result-heading h2 {
            font-size: 31px;
          }

          .catalog-result-count {
            font-size: 10px;
          }

          .catalog-count-number {
            font-size: 20px;
          }

          .catalog-product-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 11px;
          }

          .catalog-custom-banner {
            width:
              calc(100% - 24px);
            margin:
              60px auto
              40px;
            padding: 30px 22px;
            border-radius: 22px;
          }

          .catalog-custom-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 25px;
          }

          .catalog-custom-copy h2 {
            font-size: 34px;
          }

          .catalog-custom-banner-btn {
            width: 100%;
          }
        }

        /* ===================================================
           SMALL MOBILE
        =================================================== */

        @media (max-width: 420px) {
          .catalog-hero-actions {
            flex-direction: column;
          }

          .catalog-primary-btn,
          .catalog-secondary-btn {
            width: 100%;
            flex: none;
          }

          .catalog-product-grid {
            gap: 9px;
          }

          .catalog-result-heading h2 {
            font-size: 28px;
          }

          .catalog-custom-copy h2 {
            font-size: 30px;
          }
        }

        /* ===================================================
           REDUCED MOTION
        =================================================== */

        @media (prefers-reduced-motion: reduce) {
          .catalog-hero-copy,
          .catalog-hero-decoration,
          .catalog-product-reveal,
          .catalog-orbit-one,
          .catalog-orbit-two {
            animation: none !important;
          }

          .catalog-primary-btn,
          .catalog-secondary-btn,
          .catalog-filter,
          .catalog-custom-banner-btn,
          .catalog-reset-btn {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}