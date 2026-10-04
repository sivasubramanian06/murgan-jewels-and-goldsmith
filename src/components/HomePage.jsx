import { useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowRight,
  Gem,
  ShieldCheck,
  Award,
  Sparkles,
  MessageCircle,
  MapPin,
  ChevronRight,
  Star,
} from "lucide-react";

/* =========================================================
   MURUGAN GOLDSMITH AND JEWELS
   PREMIUM CINEMATIC HOME PAGE
========================================================= */

export default function HomePage({
  products,
  setView,
  rates,
}) {
  /* =========================================================
     PRODUCT COLLECTIONS
  ========================================================= */

  const rings = products
    .filter((p) => p.category === "Rings")
    .slice(0, 4);

  const chains = products
    .filter((p) => p.category === "Chains")
    .slice(0, 4);

  const bangles = products
    .filter((p) => p.category === "Bangles")
    .slice(0, 4);

  const earrings = products
    .filter((p) => p.category === "Earrings")
    .slice(0, 4);

  const necklaces = products
    .filter((p) => p.category === "Necklaces")
    .slice(0, 4);

  const bracelets = products
    .filter((p) => p.category === "Bracelets")
    .slice(0, 4);

  /* =========================================================
     FEATURED
  ========================================================= */

  const featured =
    rings.length > 0
      ? rings
      : products.slice(0, 4);

  /* =========================================================
     CATEGORY DATA
  ========================================================= */

  const categories = [
    {
      name: "Rings",
      label: "Rings",
      image: rings[0]?.imageUrl,
    },
    {
      name: "Chains",
      label: "Chains",
      image: chains[0]?.imageUrl,
    },
    {
      name: "Necklaces",
      label: "Necklaces",
      image: necklaces[0]?.imageUrl,
    },
    {
      name: "Earrings",
      label: "Earrings",
      image: earrings[0]?.imageUrl,
    },
    {
      name: "Bracelets",
      label: "Bracelets",
      image: bracelets[0]?.imageUrl,
    },
    {
      name: "Bangles",
      label: "Bangles",
      image: bangles[0]?.imageUrl,
    },
  ];

  /* =========================================================
     HERO PRODUCT ROTATION
  ========================================================= */

  const rotatingProducts = useMemo(() => {
    const categoryOrder = [
      "Rings",
      "Chains",
      "Necklaces",
      "Earrings",
      "Bracelets",
      "Bangles",
    ];

    const categoryProducts = {};

    categoryOrder.forEach((category) => {
      categoryProducts[category] = products.filter(
        (product) =>
          product.category === category &&
          product.imageUrl
      );
    });

    const maxLength = Math.max(
      ...categoryOrder.map(
        (category) =>
          categoryProducts[category].length
      ),
      0
    );

    const result = [];

    for (let index = 0; index < maxLength; index++) {
      categoryOrder.forEach((category) => {
        const product =
          categoryProducts[category][index];

        if (product) {
          result.push(product);
        }
      });
    }

    const usedIds = new Set(
      result.map((product) => product.id)
    );

    products.forEach((product) => {
      if (
        product.imageUrl &&
        !usedIds.has(product.id)
      ) {
        result.push(product);
      }
    });

    return result;
  }, [products]);

  /* =========================================================
     HERO STATE
  ========================================================= */

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDirection, setHeroDirection] = useState("next");

  useEffect(() => {
    if (rotatingProducts.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setHeroDirection("next");

      setHeroIndex((previousIndex) => {
        return (
          (previousIndex + 1) %
          rotatingProducts.length
        );
      });
    }, 4500);

    return () => {
      window.clearInterval(timer);
    };
  }, [rotatingProducts.length]);

  useEffect(() => {
    setHeroIndex(0);
  }, [rotatingProducts.length]);

  const heroProduct =
    rotatingProducts.length > 0
      ? rotatingProducts[
          heroIndex % rotatingProducts.length
        ]
      : null;

  /* =========================================================
     GOLD RATE
  ========================================================= */

  const goldRate =
    Number(rates?.gold22k) || 13765;

  /* =========================================================
     CATEGORY NAVIGATION
  ========================================================= */

  function openCategory(category) {
    setView({
      name: "catalog",
      category,
    });
  }

  /* =========================================================
     SCROLL REVEAL
  ========================================================= */

  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;

    if (!root) {
      return;
    }

    const elements =
      root.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "mgj-visible"
            );
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =========================================================
     PARALLAX MOUSE EFFECT
  ========================================================= */

  useEffect(() => {
    const root = pageRef.current;

    if (!root) {
      return;
    }

    const handleMove = (event) => {
      const rect = root.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
        rect.width -
        0.5;

      const y =
        (event.clientY - rect.top) /
        rect.height -
        0.5;

      root.style.setProperty(
        "--mouse-x",
        `${x}`
      );

      root.style.setProperty(
        "--mouse-y",
        `${y}`
      );
    };

    const handleLeave = () => {
      root.style.setProperty(
        "--mouse-x",
        "0"
      );

      root.style.setProperty(
        "--mouse-y",
        "0"
      );
    };

    root.addEventListener(
      "mousemove",
      handleMove
    );

    root.addEventListener(
      "mouseleave",
      handleLeave
    );

    return () => {
      root.removeEventListener(
        "mousemove",
        handleMove
      );

      root.removeEventListener(
        "mouseleave",
        handleLeave
      );
    };
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main
      ref={pageRef}
      className="mgj-home"
    >
      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

      <div className="mgj-background">
        <div className="mgj-orb mgj-orb-one" />
        <div className="mgj-orb mgj-orb-two" />
        <div className="mgj-grid" />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="mgj-hero">
        <div className="mgj-hero-noise" />

        <div
          className="mgj-hero-left"
          data-reveal
        >
          <div className="mgj-overline">
            <span className="mgj-overline-line" />

            <Sparkles size={14} />

            <span>
               Sri MURUGAN GOLDSMITH AND JEWELS
            </span>
          </div>

          <h1 className="mgj-hero-title">
            Jewellery
            <br />

            <span>
              made for
            </span>

            <br />

            <em>
              your moments.
            </em>
          </h1>

          <p className="mgj-hero-description">
            Discover beautifully crafted gold
            jewellery from our collection —
            or create a design made especially
            for you.
          </p>

          <div className="mgj-hero-buttons">
            <button
              className="mgj-btn mgj-btn-gold"
              onClick={() =>
                setView({
                  name: "catalog",
                })
              }
            >
              <span>
                Explore Collection
              </span>

              <ArrowRight size={17} />
            </button>

            <button
              className="mgj-btn mgj-btn-outline"
              onClick={() =>
                setView({
                  name: "custom-order",
                })
              }
            >
              Custom Jewellery
            </button>
          </div>

          <div className="mgj-hero-stats">
            <div>
              <strong>22K</strong>
              <span>Gold Jewellery</span>
            </div>

            <div className="mgj-stat-divider" />

            <div>
              <strong>916</strong>
              <span>Purity</span>
            </div>

            <div className="mgj-stat-divider" />

            <div>
              <strong>100%</strong>
              <span>Craftsmanship</span>
            </div>
          </div>
        </div>

        {/* =================================================
            HERO PRODUCT
        ================================================= */}

        <div
          className="mgj-hero-right"
          data-reveal
        >
          <div className="mgj-hero-ring" />

          <div className="mgj-hero-glow" />

          <div className="mgj-hero-number">
            <span>
              {String(
                (heroIndex % 99) + 1
              ).padStart(2, "0")}
            </span>

            <i />
          </div>

          {heroProduct?.imageUrl ? (
            <div
              key={heroProduct.id}
              className={`mgj-hero-product ${heroDirection}`}
            >
              <img
                src={heroProduct.imageUrl}
                alt={
                  heroProduct.name ||
                  "Gold jewellery"
                }
                className="mgj-hero-image"
              />

              <div className="mgj-product-caption">
                <span>
                  {heroProduct.category}
                </span>

                <strong>
                  {heroProduct.name}
                </strong>
              </div>
            </div>
          ) : (
            <div className="mgj-hero-placeholder">
              <Gem size={90} />
            </div>
          )}

          {/* GOLD RATE */}

          <div className="mgj-gold-card">
            <div className="mgj-gold-icon">
              <Sparkles size={16} />
            </div>

            <div>
              <span>
                TODAY'S GOLD RATE
              </span>

              <strong>
                ₹
                {goldRate.toLocaleString(
                  "en-IN"
                )}
                <small>/g</small>
              </strong>
            </div>
          </div>

          {/* ROTATION */}

          {rotatingProducts.length > 1 && (
            <div className="mgj-dots">
              {rotatingProducts
                .slice(
                  0,
                  Math.min(
                    rotatingProducts.length,
                    8
                  )
                )
                .map(
                  (product, index) => (
                    <button
                      key={product.id}
                      aria-label={`Show jewellery ${
                        index + 1
                      }`}
                      className={
                        index ===
                        heroIndex %
                          Math.min(
                            rotatingProducts.length,
                            8
                          )
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        setHeroDirection(
                          index > heroIndex
                            ? "next"
                            : "previous"
                        );

                        setHeroIndex(index);
                      }}
                    />
                  )
                )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MARQUEE
      ===================================================== */}

      <section className="mgj-marquee">
        <div className="mgj-marquee-track">
          <span>
            FINE GOLD JEWELLERY
          </span>

          <Gem size={18} />

          <span>
            HANDCRAFTED WITH CARE
          </span>

          <Gem size={18} />

          <span>
            22K GOLD • 916 PURITY
          </span>

          <Gem size={18} />

          <span>
            MURUGAN GOLDSMITH
          </span>

          <Gem size={18} />

          <span>
            FINE GOLD JEWELLERY
          </span>

          <Gem size={18} />

          <span>
            HANDCRAFTED WITH CARE
          </span>

          <Gem size={18} />
        </div>
      </section>

      {/* =====================================================
          CATEGORY SECTION
      ===================================================== */}

      <section
        className="mgj-section mgj-category-section"
        data-reveal
      >
        <div className="mgj-section-heading">
          <div>
            <span className="mgj-small-label">
              EXPLORE OUR COLLECTION
            </span>

            <h2>
              Shop by
              <em> category.</em>
            </h2>
          </div>

          <button
            className="mgj-text-button"
            onClick={() =>
              setView({
                name: "catalog",
              })
            }
          >
            View all
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="mgj-category-grid">
          {categories.map(
            (category, index) => (
              <button
                key={category.name}
                className="mgj-category-card"
                onClick={() =>
                  openCategory(
                    category.name
                  )
                }
                data-reveal
              >
                <div className="mgj-category-image">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.label}
                      loading="lazy"
                    />
                  ) : (
                    <Gem size={45} />
                  )}

                  <div className="mgj-category-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="mgj-category-overlay">
                    <span>
                      Explore
                    </span>

                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className="mgj-category-footer">
                  <span>
                    {category.label}
                  </span>

                  <ChevronRight size={17} />
                </div>
              </button>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          FEATURED COLLECTION
      ===================================================== */}

      <section
        className="mgj-section mgj-featured"
        data-reveal
      >
        <div className="mgj-section-heading">
          <div>
            <span className="mgj-small-label">
              HANDCRAFTED COLLECTION
            </span>

            <h2>
              Pieces to
              <em> cherish.</em>
            </h2>
          </div>

          <button
            className="mgj-text-button"
            onClick={() =>
              setView({
                name: "catalog",
              })
            }
          >
            Explore collection
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="mgj-featured-grid">
          {featured.map(
            (product, index) => (
              <button
                key={product.id}
                className={`mgj-featured-card mgj-featured-${index}`}
                onClick={() =>
                  setView({
                    name: "product",
                    id: product.id,
                  })
                }
                data-reveal
              >
                <div className="mgj-featured-image">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <Gem size={50} />
                  )}

                  <div className="mgj-image-number">
                    0{index + 1}
                  </div>

                  <div className="mgj-featured-hover">
                    <span>
                      View piece
                    </span>

                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className="mgj-featured-info">
                  <span>
                    {product.category}
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  <div>
                    View piece
                    <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          CINEMATIC CUSTOM DESIGN
      ===================================================== */}

      <section
        className="mgj-custom"
        data-reveal
      >
        <div className="mgj-custom-glow" />

        <div className="mgj-custom-content">
          <span className="mgj-small-label">
            MADE FOR YOU
          </span>

          <h2>
            Your idea.
            <br />

            <em>
              Our craftsmanship.
            </em>
          </h2>

          <p>
            Have a jewellery design in mind?
            Tell us what you want and create
            a custom piece with our
            goldsmiths.
          </p>

          <button
            className="mgj-btn mgj-btn-light"
            onClick={() =>
              setView({
                name: "custom-order",
              })
            }
          >
            Create Custom Jewellery
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="mgj-custom-art">
          <div className="mgj-custom-circle">
            <div className="mgj-custom-circle-inner">
              <Gem
                size={76}
                strokeWidth={1}
              />
            </div>
          </div>

          <span className="mgj-custom-vertical">
            CRAFTED FOR YOU
          </span>
        </div>
      </section>

      {/* =====================================================
          ASSURANCE
      ===================================================== */}

      <section
        className="mgj-section mgj-assurance"
        data-reveal
      >
        <div className="mgj-center-heading">
          <span className="mgj-small-label">
            WHY MURUGAN
          </span>

          <h2>
            Crafted with
            <em> trust.</em>
          </h2>

          <p>
            Every piece is made with care,
            attention to detail and a
            commitment to quality.
          </p>
        </div>

        <div className="mgj-assurance-grid">
          <div
            className="mgj-assurance-card"
            data-reveal
          >
            <div className="mgj-assurance-icon">
              <Gem size={22} />
            </div>

            <span>01</span>

            <h3>
              Quality Craftsmanship
            </h3>

            <p>
              Carefully crafted jewellery
              made with attention to every
              detail.
            </p>
          </div>

          <div
            className="mgj-assurance-card"
            data-reveal
          >
            <div className="mgj-assurance-icon">
              <ShieldCheck size={22} />
            </div>

            <span>02</span>

            <h3>
              916 Gold Purity
            </h3>

            <p>
              Our gold jewellery is crafted
              using 22K gold with 916
              purity.
            </p>
          </div>

          <div
            className="mgj-assurance-card"
            data-reveal
          >
            <div className="mgj-assurance-icon">
              <Award size={22} />
            </div>

            <span>03</span>

            <h3>
              Skilled Goldsmiths
            </h3>

            <p>
              Experienced craftsmen bring
              traditional skills to every
              design.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION STRIP
      ===================================================== */}

      <section
        className="mgj-section mgj-collection-strip"
        data-reveal
      >
        <button
          onClick={() =>
            openCategory("Bangles")
          }
          className="mgj-wide-card"
        >
          <div className="mgj-wide-content">
            <span>
              WOMEN'S COLLECTION
            </span>

            <h3>
              Timeless
              <br />
              Bangles.
            </h3>

            <p>
              Traditional beauty with a
              modern touch.
            </p>

            <strong>
              Explore
              <ArrowRight size={16} />
            </strong>
          </div>

          {bangles[0]?.imageUrl && (
            <img
              src={bangles[0].imageUrl}
              alt="Gold bangles"
              loading="lazy"
            />
          )}
        </button>

        <button
          onClick={() =>
            openCategory("Chains")
          }
          className="mgj-wide-card"
        >
          <div className="mgj-wide-content">
            <span>
              EVERYDAY GOLD
            </span>

            <h3>
              Elegant
              <br />
              Chains.
            </h3>

            <p>
              Designs made for everyday
              moments.
            </p>

            <strong>
              Explore
              <ArrowRight size={16} />
            </strong>
          </div>

          {chains[0]?.imageUrl && (
            <img
              src={chains[0].imageUrl}
              alt="Gold chain"
              loading="lazy"
            />
          )}
        </button>
      </section>

      {/* =====================================================
          STORE CTA
      ===================================================== */}

      <section
        className="mgj-store"
        data-reveal
      >
        <div className="mgj-store-glow" />

        <div className="mgj-store-icon">
          <MapPin size={24} />
        </div>

        <span className="mgj-small-label">
          VISIT OUR STORE
        </span>

        <h2>
          See it. Feel it.
          <br />
          <em>Make it yours.</em>
        </h2>

        <p>
          Visit  Sri Murugan Goldsmith and
          Jewels in Kuruvikulam and
          explore our jewellery collection
          in person.
        </p>

        <div className="mgj-store-buttons">
          <button
            className="mgj-btn mgj-btn-gold"
            onClick={() =>
              setView({
                name: "contact",
              })
            }
          >
            Contact Us
            <ArrowRight size={16} />
          </button>

          <a
            className="mgj-whatsapp"
            href="https://wa.me/919789481246"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} />
            WhatsApp Us
          </a>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section
        className="mgj-final"
        data-reveal
      >
        <div className="mgj-final-stars">
          <Star size={13} />
          <Star size={18} />
          <Star size={13} />
        </div>

        <span className="mgj-small-label">
          Sri MURUGAN GOLDSMITH AND JEWELS
        </span>

        <h2>
          Jewellery made
          <br />
          <em>to be kept.</em>
        </h2>

        <p>
          Explore our collection or create
          something uniquely yours.
        </p>

        <button
          className="mgj-btn mgj-btn-gold"
          onClick={() =>
            setView({
              name: "catalog",
            })
          }
        >
          Browse Catalogue
          <ArrowRight size={17} />
        </button>
      </section>

      {/* =====================================================
          PREMIUM ANIMATION CSS
      ===================================================== */}

      <style>{`

        /* =====================================================
           BASE
        ===================================================== */

        .mgj-home {
          --gold: #b68a45;
          --gold-light: #d8b477;
          --dark: #17130f;
          --dark-2: #211b15;
          --cream: #f8f4ed;
          --text: #28221c;

          position: relative;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 80% 10%,
              rgba(182,138,69,.08),
              transparent 28%
            ),
            var(--cream);

          color: var(--text);

          --mouse-x: 0;
          --mouse-y: 0;
        }

        .mgj-home *,
        .mgj-home *::before,
        .mgj-home *::after {
          box-sizing: border-box;
        }

        .mgj-home button,
        .mgj-home a {
          font: inherit;
        }

        /* =====================================================
           BACKGROUND
        ===================================================== */

        .mgj-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .mgj-grid {
          position: absolute;
          inset: 0;

          opacity: .18;

          background-image:
            linear-gradient(
              rgba(120,90,50,.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(120,90,50,.05) 1px,
              transparent 1px
            );

          background-size: 80px 80px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 70%
            );
        }

        .mgj-orb {
          position: absolute;

          width: 420px;
          height: 420px;

          border-radius: 50%;

          filter: blur(80px);

          opacity: .18;

          animation:
            mgjOrbMove 12s ease-in-out infinite;
        }

        .mgj-orb-one {
          top: 200px;
          right: -200px;
          background: #d1a35d;
        }

        .mgj-orb-two {
          top: 900px;
          left: -250px;
          background: #a77b46;
          animation-delay: -5s;
        }

        @keyframes mgjOrbMove {
          0%,
          100% {
            transform: translate3d(0,0,0);
          }

          50% {
            transform: translate3d(
              50px,
              -40px,
              0
            );
          }
        }

        /* =====================================================
           HERO
        ===================================================== */

        .mgj-hero {
          position: relative;

          min-height: 720px;

          display: grid;

          grid-template-columns:
            minmax(0, .9fr)
            minmax(420px, 1.1fr);

          align-items: center;

          gap: 20px;

          padding:
            80px
            clamp(24px, 7vw, 110px)
            90px;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 75% 45%,
              rgba(192,150,83,.14),
              transparent 35%
            );
        }

        .mgj-hero-noise {
          position: absolute;
          inset: 0;

          pointer-events: none;

          opacity: .04;

          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
        }

        .mgj-hero-left {
          position: relative;
          z-index: 3;

          max-width: 650px;
        }

        .mgj-overline {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 28px;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: .2em;

          color: #7e684f;

          animation:
            mgjFadeUp .9s .1s both;
        }

        .mgj-overline-line {
          width: 30px;
          height: 1px;

          background:
            var(--gold);
        }

        .mgj-hero-title {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(52px, 6.5vw, 96px);

          line-height: .91;

          letter-spacing: -.055em;

          font-weight: 400;

          animation:
            mgjHeroTitle 1.15s .15s both;
        }

        .mgj-hero-title span {
          color: #695845;
        }

        .mgj-hero-title em {
          color: var(--gold);
          font-style: italic;
        }

        .mgj-hero-description {
          max-width: 500px;

          margin:
            32px 0 30px;

          font-size: 15px;

          line-height: 1.8;

          color: #70665c;

          animation:
            mgjFadeUp 1s .35s both;
        }

        .mgj-hero-buttons {
          display: flex;
          align-items: center;
          gap: 12px;

          animation:
            mgjFadeUp 1s .5s both;
        }

        .mgj-btn {
          min-height: 50px;

          border: 0;

          padding:
            0 22px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          cursor: pointer;

          transition:
            transform .4s cubic-bezier(.2,.8,.2,1),
            box-shadow .4s ease,
            background .4s ease;

          white-space: nowrap;
        }

        .mgj-btn:hover {
          transform:
            translateY(-4px);
        }

        .mgj-btn-gold {
          color: white;

          background:
            linear-gradient(
              110deg,
              #9b7139,
              #c49a59,
              #9d7138
            );

          box-shadow:
            0 12px 30px
            rgba(125,86,37,.20);
        }

        .mgj-btn-gold:hover {
          box-shadow:
            0 18px 38px
            rgba(125,86,37,.30);
        }

        .mgj-btn-outline {
          color: #574b40;

          background:
            rgba(255,255,255,.55);

          border:
            1px solid
            rgba(100,80,55,.20);
        }

        .mgj-btn-outline:hover {
          background: white;
        }

        .mgj-btn-light {
          color: #292119;

          background: #f7f1e6;

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.15);
        }

        .mgj-hero-stats {
          display: flex;
          align-items: center;
          gap: 25px;

          margin-top: 55px;

          animation:
            mgjFadeUp 1s .65s both;
        }

        .mgj-hero-stats div:not(.mgj-stat-divider) {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mgj-hero-stats strong {
          font-family:
            Georgia,
            serif;

          font-size: 21px;

          font-weight: 400;

          color: #493c2f;
        }

        .mgj-hero-stats span {
          font-size: 9px;

          text-transform: uppercase;

          letter-spacing: .13em;

          color: #8a7d6e;
        }

        .mgj-stat-divider {
          width: 1px;
          height: 28px;

          background:
            rgba(80,60,40,.15);
        }

        /* =====================================================
           HERO RIGHT
        ===================================================== */

        .mgj-hero-right {
          position: relative;

          min-height: 570px;

          display: flex;
          align-items: center;
          justify-content: center;

          transform:
            translate3d(
              calc(var(--mouse-x) * 8px),
              calc(var(--mouse-y) * 8px),
              0
            );

          transition:
            transform .5s ease;
        }

        .mgj-hero-ring {
          position: absolute;

          width: min(500px, 90%);

          aspect-ratio: 1;

          border-radius: 50%;

          border:
            1px solid
            rgba(157,115,55,.18);

          animation:
            mgjRingRotate 25s linear infinite;
        }

        .mgj-hero-ring::before,
        .mgj-hero-ring::after {
          content: "";

          position: absolute;

          border-radius: 50%;

          border:
            1px solid
            rgba(157,115,55,.10);
        }

        .mgj-hero-ring::before {
          inset: 30px;
        }

        .mgj-hero-ring::after {
          inset: 70px;
        }

        @keyframes mgjRingRotate {
          to {
            transform:
              rotate(360deg);
          }
        }

        .mgj-hero-glow {
          position: absolute;

          width: 420px;
          height: 420px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(213,174,107,.24),
              transparent 65%
            );

          filter: blur(10px);

          animation:
            mgjGlowPulse 5s ease-in-out infinite;
        }

        @keyframes mgjGlowPulse {
          0%,
          100% {
            transform: scale(.92);
            opacity: .7;
          }

          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .mgj-hero-product {
          position: relative;

          width: 75%;
          height: 500px;

          display: flex;

          align-items: center;
          justify-content: center;

          z-index: 2;

          animation:
            mgjProductEnter .9s
            cubic-bezier(.16,1,.3,1)
            both;
        }

        .mgj-hero-product.previous {
          animation-name:
            mgjProductPrevious;
        }

        .mgj-hero-image {
          width: 100%;
          height: 100%;

          object-fit: contain;

          filter:
            drop-shadow(
              0 35px 35px
              rgba(67,43,20,.16)
            );

          animation:
            mgjJewelleryFloat 5s
            ease-in-out infinite;

          transition:
            transform 1s ease;
        }

        .mgj-hero-product:hover
        .mgj-hero-image {
          transform:
            scale(1.045)
            rotate(-2deg);
        }

        @keyframes mgjProductEnter {
          from {
            opacity: 0;
            transform:
              translate3d(90px,0,0)
              scale(.84)
              rotate(5deg);
          }

          to {
            opacity: 1;
            transform:
              translate3d(0,0,0)
              scale(1)
              rotate(0);
          }
        }

        @keyframes mgjProductPrevious {
          from {
            opacity: 0;
            transform:
              translate3d(-90px,0,0)
              scale(.84)
              rotate(-5deg);
          }

          to {
            opacity: 1;
            transform:
              translate3d(0,0,0)
              scale(1)
              rotate(0);
          }
        }

        @keyframes mgjJewelleryFloat {
          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-12px);
          }
        }

        .mgj-product-caption {
          position: absolute;

          left: 0;
          bottom: 35px;

          display: flex;
          flex-direction: column;
          gap: 5px;

          padding:
            13px 18px;

          background:
            rgba(255,255,255,.78);

          backdrop-filter:
            blur(15px);

          border-left:
            2px solid
            var(--gold);

          box-shadow:
            0 15px 40px
            rgba(55,38,20,.10);
        }

        .mgj-product-caption span {
          font-size: 8px;

          letter-spacing: .17em;

          text-transform: uppercase;

          color: #8c7964;
        }

        .mgj-product-caption strong {
          font-size: 13px;

          font-weight: 600;

          color: #3e3328;
        }

        .mgj-hero-number {
          position: absolute;

          top: 20px;
          right: 20px;

          display: flex;
          align-items: center;
          gap: 12px;

          z-index: 5;

          color: #8d7658;
        }

        .mgj-hero-number span {
          font-family:
            Georgia,
            serif;

          font-size: 12px;

          letter-spacing: .15em;
        }

        .mgj-hero-number i {
          display: block;

          width: 50px;
          height: 1px;

          background:
            #b99a6c;
        }

        .mgj-gold-card {
          position: absolute;

          right: 0;
          top: 50%;

          z-index: 6;

          display: flex;
          align-items: center;
          gap: 12px;

          padding:
            13px 17px;

          background:
            rgba(255,255,255,.83);

          backdrop-filter:
            blur(16px);

          border:
            1px solid
            rgba(110,80,40,.10);

          box-shadow:
            0 20px 45px
            rgba(55,38,20,.13);

          animation:
            mgjFloatCard 4s
            ease-in-out infinite;
        }

        .mgj-gold-icon {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: white;

          background:
            linear-gradient(
              135deg,
              #a47a3e,
              #d3ad6e
            );
        }

        .mgj-gold-card div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .mgj-gold-card span {
          font-size: 8px;

          letter-spacing: .13em;

          color: #8b7a67;
        }

        .mgj-gold-card strong {
          font-family:
            Georgia,
            serif;

          font-size: 17px;

          font-weight: 400;

          color: #4c3d2c;
        }

        .mgj-gold-card small {
          font-size: 9px;
        }

        @keyframes mgjFloatCard {
          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-9px);
          }
        }

        .mgj-dots {
          position: absolute;

          left: 50%;
          bottom: 3px;

          transform:
            translateX(-50%);

          z-index: 7;

          display: flex;
          gap: 5px;
        }

        .mgj-dots button {
          width: 6px;
          height: 6px;

          padding: 0;

          border: 0;

          border-radius: 50%;

          background:
            rgba(70,50,30,.22);

          cursor: pointer;

          transition:
            width .35s ease,
            background .35s ease;
        }

        .mgj-dots button.active {
          width: 24px;

          border-radius: 10px;

          background:
            var(--gold);
        }

        /* =====================================================
           MARQUEE
        ===================================================== */

        .mgj-marquee {
          overflow: hidden;

          padding: 17px 0;

          color: #e9dcc6;

          background:
            #1b1611;

          border-top:
            1px solid
            rgba(255,255,255,.04);

          border-bottom:
            1px solid
            rgba(255,255,255,.04);
        }

        .mgj-marquee-track {
          width: max-content;

          display: flex;
          align-items: center;

          gap: 30px;

          animation:
            mgjMarquee 28s
            linear infinite;

          white-space: nowrap;
        }

        .mgj-marquee span {
          font-size: 9px;

          letter-spacing: .22em;
        }

        .mgj-marquee svg {
          opacity: .6;
        }

        @keyframes mgjMarquee {
          from {
            transform:
              translateX(0);
          }

          to {
            transform:
              translateX(-50%);
          }
        }

        /* =====================================================
           SECTIONS
        ===================================================== */

        .mgj-section {
          position: relative;

          padding:
            110px
            clamp(24px, 7vw, 110px);
        }

        .mgj-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 30px;

          margin-bottom: 50px;
        }

        .mgj-small-label {
          display: inline-block;

          margin-bottom: 14px;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: .22em;

          color: #a17c4a;
        }

        .mgj-section-heading h2,
        .mgj-center-heading h2 {
          margin: 0;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(38px, 5vw, 66px);

          line-height: .98;

          font-weight: 400;

          letter-spacing: -.045em;
        }

        .mgj-section-heading h2 em,
        .mgj-center-heading h2 em {
          color: var(--gold);

          font-style: italic;
        }

        .mgj-text-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;

          padding: 10px 0;

          border: 0;

          border-bottom:
            1px solid
            rgba(100,75,45,.3);

          color: #5d4c3b;

          background: transparent;

          cursor: pointer;

          transition:
            gap .35s ease,
            color .35s ease;
        }

        .mgj-text-button:hover {
          gap: 16px;
          color: var(--gold);
        }

        /* =====================================================
           CATEGORY
        ===================================================== */

        .mgj-category-grid {
          display: grid;

          grid-template-columns:
            repeat(6, 1fr);

          gap: 14px;
        }

        .mgj-category-card {
          padding: 0;

          border: 0;

          background: transparent;

          text-align: left;

          cursor: pointer;

          transition:
            transform .5s
            cubic-bezier(.2,.8,.2,1);
        }

        .mgj-category-card:hover {
          transform:
            translateY(-10px);
        }

        .mgj-category-image {
          position: relative;

          aspect-ratio: .78;

          overflow: hidden;

          background:
            #eee7dc;
        }

        .mgj-category-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform .8s
            cubic-bezier(.2,.8,.2,1),
            filter .8s ease;
        }

        .mgj-category-card:hover
        .mgj-category-image img {
          transform:
            scale(1.1);
          filter:
            brightness(.82);
        }

        .mgj-category-number {
          position: absolute;

          top: 13px;
          left: 13px;

          color: white;

          font-size: 9px;

          letter-spacing: .15em;

          opacity: .8;
        }

        .mgj-category-overlay {
          position: absolute;

          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          color: white;

          background:
            rgba(30,20,10,.28);

          opacity: 0;

          transform:
            scale(.96);

          transition:
            opacity .5s ease,
            transform .5s ease;
        }

        .mgj-category-card:hover
        .mgj-category-overlay {
          opacity: 1;
          transform: scale(1);
        }

        .mgj-category-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 15px 2px;

          color: #40362d;

          font-size: 13px;
          font-weight: 600;
        }

        .mgj-category-footer svg {
          color: var(--gold);

          transition:
            transform .3s ease;
        }

        .mgj-category-card:hover
        .mgj-category-footer svg {
          transform:
            translateX(5px);
        }

        /* =====================================================
           FEATURED
        ===================================================== */

        .mgj-featured {
          background:
            #f0eae1;
        }

        .mgj-featured-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 18px;
        }

        .mgj-featured-card {
          padding: 0;

          border: 0;

          background: transparent;

          text-align: left;

          cursor: pointer;
        }

        .mgj-featured-image {
          position: relative;

          aspect-ratio: .8;

          overflow: hidden;

          background:
            #e5ddd0;
        }

        .mgj-featured-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform 1s
            cubic-bezier(.2,.8,.2,1),
            filter .7s ease;
        }

        .mgj-featured-card:hover
        .mgj-featured-image img {
          transform:
            scale(1.09);
          filter:
            brightness(.84);
        }

        .mgj-image-number {
          position: absolute;

          top: 16px;
          left: 16px;

          color: white;

          font-size: 9px;

          letter-spacing: .2em;

          text-shadow:
            0 2px 10px
            rgba(0,0,0,.3);
        }

        .mgj-featured-hover {
          position: absolute;

          left: 18px;
          right: 18px;
          bottom: 18px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 12px 15px;

          color: white;

          background:
            rgba(25,18,12,.72);

          backdrop-filter:
            blur(10px);

          transform:
            translateY(20px);

          opacity: 0;

          transition:
            transform .5s ease,
            opacity .5s ease;
        }

        .mgj-featured-card:hover
        .mgj-featured-hover {
          transform:
            translateY(0);

          opacity: 1;
        }

        .mgj-featured-info {
          padding-top: 17px;
        }

        .mgj-featured-info > span {
          font-size: 8px;

          text-transform: uppercase;

          letter-spacing: .16em;

          color: #9a8060;
        }

        .mgj-featured-info h3 {
          margin:
            6px 0 10px;

          font-family:
            Georgia,
            serif;

          font-size: 19px;

          font-weight: 400;

          color: #392f26;
        }

        .mgj-featured-info > div {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          font-size: 10px;

          color: #766656;

          transition:
            gap .3s ease;
        }

        .mgj-featured-card:hover
        .mgj-featured-info > div {
          gap: 12px;
        }

        /* =====================================================
           CUSTOM
        ===================================================== */

        .mgj-custom {
          position: relative;

          min-height: 620px;

          display: grid;

          grid-template-columns:
            1fr 1fr;

          align-items: center;

          overflow: hidden;

          padding:
            90px
            clamp(24px, 8vw, 130px);

          color: #f4eadb;

          background:
            radial-gradient(
              circle at 80% 50%,
              rgba(201,158,89,.15),
              transparent 32%
            ),
            #201913;
        }

        .mgj-custom-glow {
          position: absolute;

          width: 550px;
          height: 550px;

          right: 5%;
          top: 50%;

          transform:
            translateY(-50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(203,160,91,.18),
              transparent 67%
            );

          animation:
            mgjGlowPulse 7s
            ease-in-out infinite;
        }

        .mgj-custom-content {
          position: relative;
          z-index: 2;

          max-width: 620px;
        }

        .mgj-custom-content
        .mgj-small-label {
          color: #c5a16b;
        }

        .mgj-custom-content h2 {
          margin: 0;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(50px, 6vw, 88px);

          line-height: .94;

          font-weight: 400;

          letter-spacing: -.055em;
        }

        .mgj-custom-content h2 em {
          color: #c7a36d;

          font-style: italic;
        }

        .mgj-custom-content p {
          max-width: 480px;

          margin:
            28px 0 30px;

          color: #b9ad9d;

          font-size: 14px;

          line-height: 1.8;
        }

        .mgj-custom-art {
          position: relative;

          height: 480px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mgj-custom-circle {
          position: relative;

          width: 380px;
          height: 380px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border:
            1px solid
            rgba(211,172,106,.35);

          animation:
            mgjSlowRotate 30s
            linear infinite;
        }

        .mgj-custom-circle::before {
          content: "";

          position: absolute;

          inset: 28px;

          border-radius: 50%;

          border:
            1px solid
            rgba(211,172,106,.18);
        }

        .mgj-custom-circle::after {
          content: "";

          position: absolute;

          inset: 70px;

          border-radius: 50%;

          border:
            1px dashed
            rgba(211,172,106,.18);
        }

        @keyframes mgjSlowRotate {
          to {
            transform:
              rotate(360deg);
          }
        }

        .mgj-custom-circle-inner {
          width: 190px;
          height: 190px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: #d7b477;

          background:
            radial-gradient(
              circle,
              rgba(201,160,91,.18),
              rgba(255,255,255,.02)
            );

          box-shadow:
            inset 0 0 50px
            rgba(201,160,91,.08);

          animation:
            mgjInnerFloat 5s
            ease-in-out infinite;
        }

        @keyframes mgjInnerFloat {
          0%,
          100% {
            transform:
              scale(1);
          }

          50% {
            transform:
              scale(1.06);
          }
        }

        .mgj-custom-vertical {
          position: absolute;

          right: 0;

          writing-mode:
            vertical-rl;

          transform:
            rotate(180deg);

          font-size: 8px;

          letter-spacing: .28em;

          color: #8e7b63;
        }

        /* =====================================================
           ASSURANCE
        ===================================================== */

        .mgj-assurance {
          background:
            #faf7f1;
        }

        .mgj-center-heading {
          max-width: 700px;

          margin: 0 auto 65px;

          text-align: center;
        }

        .mgj-center-heading p {
          max-width: 500px;

          margin:
            22px auto 0;

          color: #75695c;

          line-height: 1.8;

          font-size: 14px;
        }

        .mgj-assurance-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 1px;

          background:
            rgba(100,75,45,.15);
        }

        .mgj-assurance-card {
          position: relative;

          padding: 45px;

          min-height: 280px;

          background:
            #faf7f1;

          transition:
            background .5s ease,
            transform .5s
            cubic-bezier(.2,.8,.2,1);
        }

        .mgj-assurance-card:hover {
          background:
            #f1e9dc;

          transform:
            translateY(-7px);
        }

        .mgj-assurance-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 30px;

          color: #a37b45;

          border:
            1px solid
            rgba(163,123,69,.25);

          border-radius: 50%;
        }

        .mgj-assurance-card > span {
          position: absolute;

          top: 28px;
          right: 28px;

          font-family:
            Georgia,
            serif;

          font-size: 12px;

          color: #b3a18a;
        }

        .mgj-assurance-card h3 {
          margin:
            0 0 13px;

          font-family:
            Georgia,
            serif;

          font-size: 23px;

          font-weight: 400;
        }

        .mgj-assurance-card p {
          max-width: 270px;

          margin: 0;

          color: #817568;

          font-size: 13px;

          line-height: 1.8;
        }

        /* =====================================================
           COLLECTION STRIP
        ===================================================== */

        .mgj-collection-strip {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 18px;

          background:
            #eee6db;
        }

        .mgj-wide-card {
          position: relative;

          min-height: 440px;

          overflow: hidden;

          padding: 45px;

          border: 0;

          text-align: left;

          color: white;

          background:
            #332a21;

          cursor: pointer;
        }

        .mgj-wide-card::after {
          content: "";

          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(20,14,9,.75),
              rgba(20,14,9,.1)
            );
        }

        .mgj-wide-card img {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          opacity: .78;

          transition:
            transform 1s
            cubic-bezier(.2,.8,.2,1);
        }

        .mgj-wide-card:hover img {
          transform:
            scale(1.09);
        }

        .mgj-wide-content {
          position: relative;

          z-index: 2;

          max-width: 310px;
        }

        .mgj-wide-content > span {
          font-size: 8px;

          letter-spacing: .2em;

          color: #d6b57f;
        }

        .mgj-wide-content h3 {
          margin:
            20px 0 15px;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(40px, 4vw, 60px);

          line-height: .9;

          font-weight: 400;
        }

        .mgj-wide-content p {
          color: #d6cbc0;

          font-size: 13px;

          line-height: 1.7;
        }

        .mgj-wide-content strong {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          margin-top: 25px;

          font-size: 10px;

          letter-spacing: .08em;

          transition:
            gap .3s ease;
        }

        .mgj-wide-card:hover
        .mgj-wide-content strong {
          gap: 14px;
        }

        /* =====================================================
           STORE
        ===================================================== */

        .mgj-store {
          position: relative;

          overflow: hidden;

          padding:
            120px
            24px;

          text-align: center;

          background:
            #e6ddd0;
        }

        .mgj-store-glow {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 500px;
          height: 500px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(187,142,72,.13),
              transparent 65%
            );

          animation:
            mgjGlowPulse 8s
            ease-in-out infinite;
        }

        .mgj-store-icon {
          position: relative;

          width: 55px;
          height: 55px;

          margin:
            0 auto 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: #a27b49;

          border:
            1px solid
            rgba(120,85,45,.2);
        }

        .mgj-store > h2 {
          position: relative;

          margin: 0;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(50px, 7vw, 90px);

          line-height: .9;

          font-weight: 400;

          letter-spacing: -.055em;
        }

        .mgj-store > h2 em {
          color: var(--gold);

          font-style: italic;
        }

        .mgj-store > p {
          position: relative;

          max-width: 500px;

          margin:
            25px auto 30px;

          color: #73675a;

          font-size: 14px;

          line-height: 1.8;
        }

        .mgj-store-buttons {
          position: relative;

          display: flex;

          justify-content: center;

          align-items: center;

          gap: 12px;
        }

        .mgj-whatsapp {
          min-height: 50px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          padding:
            0 22px;

          color: #534638;

          border:
            1px solid
            rgba(80,60,40,.2);

          text-decoration: none;

          background:
            rgba(255,255,255,.35);

          transition:
            transform .35s ease,
            background .35s ease;
        }

        .mgj-whatsapp:hover {
          transform:
            translateY(-4px);

          background:
            rgba(255,255,255,.7);
        }

        /* =====================================================
           FINAL
        ===================================================== */

        .mgj-final {
          position: relative;

          overflow: hidden;

          padding:
            130px 24px;

          text-align: center;

          color: #f5eadb;

          background:
            #17130f;
        }

        .mgj-final::before {
  content: "";

  position: absolute;
  pointer-events: none;

  width: 600px;
  height: 600px;

  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%);

  border-radius: 50%;

  border: 1px solid rgba(206,165,96,.08);
}

        .mgj-final-stars {
          position: relative;

          display: flex;
          justify-content: center;
          align-items: center;

          gap: 15px;

          margin-bottom: 25px;

          color: #c6a16b;
        }

        .mgj-final h2 {
          position: relative;

          margin: 0;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(52px, 7vw, 96px);

          line-height: .9;

          font-weight: 400;

          letter-spacing: -.06em;
        }

        .mgj-final h2 em {
          color: #c8a36b;

          font-style: italic;
        }

        .mgj-final p {
          position: relative;

          margin:
            25px auto 30px;

          max-width: 450px;

          color: #a99c8b;

          font-size: 14px;

          line-height: 1.8;
        }

        /* =====================================================
           REVEAL ANIMATION
        ===================================================== */

        [data-reveal] {
          opacity: 0;

          transform:
            translateY(55px);

          transition:
            opacity 1s
            cubic-bezier(.16,1,.3,1),
            transform 1s
            cubic-bezier(.16,1,.3,1);
        }

        [data-reveal].mgj-visible {
          opacity: 1;

          transform:
            translateY(0);
        }

        .mgj-category-card:nth-child(2),
        .mgj-featured-card:nth-child(2),
        .mgj-assurance-card:nth-child(2) {
          transition-delay: .08s;
        }

        .mgj-category-card:nth-child(3),
        .mgj-featured-card:nth-child(3),
        .mgj-assurance-card:nth-child(3) {
          transition-delay: .16s;
        }

        .mgj-category-card:nth-child(4),
        .mgj-featured-card:nth-child(4) {
          transition-delay: .24s;
        }

        .mgj-category-card:nth-child(5) {
          transition-delay: .32s;
        }

        .mgj-category-card:nth-child(6) {
          transition-delay: .4s;
        }

        @keyframes mgjFadeUp {
          from {
            opacity: 0;
            transform:
              translateY(25px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        @keyframes mgjHeroTitle {
          from {
            opacity: 0;

            transform:
              translateY(45px)
              scale(.97);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (
          prefers-reduced-motion: reduce
        ) {
          .mgj-home *,
          .mgj-home *::before,
          .mgj-home *::after {
            animation-duration:
              .01ms !important;

            animation-iteration-count:
              1 !important;

            scroll-behavior:
              auto !important;

            transition-duration:
              .01ms !important;
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1100px) {

          .mgj-hero {
            grid-template-columns:
              1fr;

            min-height: auto;

            padding-top: 80px;
          }

          .mgj-hero-left {
            max-width: 720px;

            margin: 0 auto;

            text-align: center;
          }

          .mgj-overline,
          .mgj-hero-buttons,
          .mgj-hero-stats {
            justify-content: center;
          }

          .mgj-hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .mgj-hero-right {
            min-height: 540px;

            max-width: 700px;

            width: 100%;

            margin: auto;
          }

          .mgj-category-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .mgj-featured-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .mgj-custom {
            grid-template-columns:
              1fr;
          }

          .mgj-custom-art {
            min-height: 400px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .mgj-hero {
            padding:
              60px 20px
              35px;
          }

          .mgj-hero-title {
            font-size:
              clamp(48px, 14vw, 72px);
          }

          .mgj-hero-description {
            font-size: 13px;
          }

          .mgj-hero-buttons {
            flex-direction: column;

            align-items: stretch;

            width: 100%;
          }

          .mgj-btn {
            width: 100%;
          }

          .mgj-hero-stats {
            gap: 12px;

            margin-top: 40px;
          }

          .mgj-hero-stats strong {
            font-size: 17px;
          }

          .mgj-hero-stats span {
            font-size: 7px;
          }

          .mgj-hero-right {
            min-height: 410px;
          }

          .mgj-hero-product {
            width: 90%;
            height: 390px;
          }

          .mgj-hero-ring {
            width: 340px;
          }

          .mgj-hero-glow {
            width: 300px;
            height: 300px;
          }

          .mgj-gold-card {
            right: 2px;
            top: auto;
            bottom: 20px;

            padding: 10px 12px;
          }

          .mgj-gold-card strong {
            font-size: 14px;
          }

          .mgj-product-caption {
            left: 5px;
            bottom: 40px;
          }

          .mgj-section {
            padding:
              75px 20px;
          }

          .mgj-section-heading {
            align-items: flex-start;

            flex-direction: column;

            margin-bottom: 35px;
          }

          .mgj-section-heading h2,
          .mgj-center-heading h2 {
            font-size:
              clamp(38px, 12vw, 58px);
          }

          .mgj-category-grid {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 10px;
          }

          .mgj-category-footer {
            padding:
              12px 2px;
          }

          .mgj-category-footer span {
            font-size: 11px;
          }

          .mgj-featured-grid {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 10px;
          }

          .mgj-featured-info h3 {
            font-size: 15px;
          }

          .mgj-featured-info > div {
            font-size: 9px;
          }

          .mgj-featured-hover {
            display: none;
          }

          .mgj-custom {
            padding:
              75px 20px;
          }

          .mgj-custom-content h2 {
            font-size:
              clamp(48px, 13vw, 70px);
          }

          .mgj-custom-art {
            min-height: 350px;
          }

          .mgj-custom-circle {
            width: 290px;
            height: 290px;
          }

          .mgj-custom-circle-inner {
            width: 145px;
            height: 145px;
          }

          .mgj-assurance-grid {
            grid-template-columns: 1fr;
          }

          .mgj-assurance-card {
            min-height: 230px;

            padding: 32px;
          }

          .mgj-collection-strip {
            grid-template-columns: 1fr;

            padding:
              55px 20px;
          }

          .mgj-wide-card {
            min-height: 380px;

            padding: 30px;
          }

          .mgj-wide-content h3 {
            font-size: 48px;
          }

          .mgj-store {
            padding:
              90px 20px;
          }

          .mgj-store-buttons {
            flex-direction: column;

            align-items: stretch;

            max-width: 340px;

            margin: auto;
          }

          .mgj-store-buttons
          .mgj-btn,
          .mgj-whatsapp {
            width: 100%;
          }

          .mgj-final {
            padding:
              100px 20px;
          }

          .mgj-final h2 {
            font-size:
              clamp(48px, 14vw, 70px);
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 420px) {

          .mgj-hero-stats {
            gap: 8px;
          }

          .mgj-hero-stats strong {
            font-size: 15px;
          }

          .mgj-category-grid {
            gap: 8px;
          }

          .mgj-category-image {
            aspect-ratio: .72;
          }

          .mgj-featured-grid {
            gap: 8px;
          }

          .mgj-hero-right {
            min-height: 350px;
          }

          .mgj-hero-product {
            height: 340px;
          }

          .mgj-hero-ring {
            width: 290px;
          }

          .mgj-gold-card {
            transform:
              scale(.9);
            transform-origin:
              right bottom;
          }
        }

      `}</style>
    </main>
  );
}