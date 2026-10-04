import ring from "../assets/ring/ring.jpeg";
import ring1 from "../assets/ring/ring 1.jpeg";
import ring2 from "../assets/ring/ring 2.jpeg";
import ring3 from "../assets/ring/ring 3.jpeg";
import ring4 from "../assets/ring/ring 4.jpeg";
import ring5 from "../assets/ring/ring 5.jpeg";
import ring6 from "../assets/ring/ring 6.jpeg";
import ring7 from "../assets/ring/ring 7.jpeg";
import ring8 from "../assets/ring/ring 8.jpeg";
import ring9 from "../assets/ring/ring 9.jpeg";
import ring10 from "../assets/ring/ring 10.jpeg";
import ring11 from "../assets/ring/ring 11.jpeg";
import ring12 from "../assets/ring/ring 12.jpeg";
import ring13 from "../assets/ring/ring 13.jpeg";
import ring14 from "../assets/ring/ring 14.jpeg";
import ring15 from "../assets/ring/ring 15.jpeg";
import ring16 from "../assets/ring/ring 16.jpeg";
import ring17 from "../assets/ring/ring 17.jpeg";
import ring18 from "../assets/ring/ring 18.jpeg";
import ring19 from "../assets/ring/ring 19.jpeg";

/*
==================================================
AUTOMATIC IMAGE LOADING
==================================================
*/

/* Men's Chains */
const menChainFiles = import.meta.glob(
  "../assets/menschain/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/* Women's Chains */
const womenChainFiles = import.meta.glob(
  "../assets/womenschain/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/* Women's Rings */
const womenRingFiles = import.meta.glob(
  "../assets/womensring/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/* Women's Necklaces / Malai */
const necklaceFiles = import.meta.glob(
  "../assets/malai&necklace/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/* Women's Earrings */
const earringFiles = import.meta.glob(
  "../assets/earring/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/* Women's Bracelets */
const braceletFiles = import.meta.glob(
  "../assets/bracelet/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/* Women's Bangles */
const bangleFiles = import.meta.glob(
  "../assets/bangle/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/*
==================================================
SORT IMAGES
==================================================
*/

function sortedImages(files) {
  return Object.entries(files)
    .sort(([a], [b]) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
    .map(([, url]) => url);
}

const menChainImages = sortedImages(menChainFiles);
const womenChainImages = sortedImages(womenChainFiles);
const womenRingImages = sortedImages(womenRingFiles);
const necklaceImages = sortedImages(necklaceFiles);
const earringImages = sortedImages(earringFiles);
const braceletImages = sortedImages(braceletFiles);
const bangleImages = sortedImages(bangleFiles);

/*
==================================================
CATEGORIES
==================================================
*/

export const CATEGORIES = [
  "Rings",
  "Chains",
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Bangles",
  "Custom",
];

export const AVAILABILITY = [
  "Online",
  "In-store",
  "Both",
];

export const GENDERS = [
  "Men",
  "Women",
];

/*
==================================================
EMPTY PRODUCT
==================================================
*/

export const emptyProduct = {
  id: null,
  name: "",
  category: CATEGORIES[0],
  gender: "Women",
  price: "",
  material: "22K Gold",
  description: "",
  imageUrl: "",
  availability: "Both",
  inStock: true,
};

/*
==================================================
MEN'S RINGS
20 MODELS
==================================================
*/

const mensRings = [
  [101, "Ring Model RG-001", ring],
  [102, "Ring Model RG-002", ring1],
  [103, "Ring Model RG-003", ring2],
  [104, "Ring Model RG-004", ring3],
  [105, "Ring Model RG-005", ring4],
  [106, "Ring Model RG-006", ring5],
  [107, "Ring Model RG-007", ring6],
  [108, "Ring Model RG-008", ring7],
  [109, "Ring Model RG-009", ring8],
  [110, "Ring Model RG-010", ring9],
  [111, "Ring Model RG-011", ring10],
  [112, "Ring Model RG-012", ring11],
  [113, "Ring Model RG-013", ring12],
  [114, "Ring Model RG-014", ring13],
  [115, "Ring Model RG-015", ring14],
  [116, "Ring Model RG-016", ring15],
  [117, "Ring Model RG-017", ring16],
  [118, "Ring Model RG-018", ring17],
  [119, "Ring Model RG-019", ring18],
  [120, "Ring Model RG-020", ring19],
].map(([id, name, imageUrl]) => ({
  id,
  name,
  category: "Rings",
  gender: "Men",
  price: "",
  material: "22K Gold",
  description:
    "Men's gold ring model from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
WOMEN'S RINGS
==================================================
*/

const womensRings = womenRingImages.map((imageUrl, index) => ({
  id: 1000 + index,
  name: `Women's Stone Ring WR-${String(index + 1).padStart(3, "0")}`,
  category: "Rings",
  gender: "Women",
  price: "",
  material: "22K Gold",
  description:
    "Women's stone ring from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
MEN'S CHAINS
==================================================
*/

const mensChains = menChainImages.map((imageUrl, index) => ({
  id: 2000 + index,
  name: `Men's Gold Chain MC-${String(index + 1).padStart(3, "0")}`,
  category: "Chains",
  gender: "Men",
  price: "",
  material: "22K Gold",
  description:
    "Men's gold chain model from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
WOMEN'S CHAINS
==================================================
*/

const womensChains = womenChainImages.map((imageUrl, index) => ({
  id: 3000 + index,
  name: `Women's Gold Chain WC-${String(index + 1).padStart(3, "0")}`,
  category: "Chains",
  gender: "Women",
  price: "",
  material: "22K Gold",
  description:
    "Women's gold chain model from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
WOMEN'S NECKLACES / MALAI
==================================================
*/

const necklaces = necklaceImages.map((imageUrl, index) => ({
  id: 4000 + index,
  name: `Gold Necklace Model NC-${String(index + 1).padStart(3, "0")}`,
  category: "Necklaces",
  gender: "Women",
  price: "",
  material: "22K Gold",
  description:
    "Gold necklace model from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
WOMEN'S EARRINGS
==================================================
*/

const earrings = earringImages.map((imageUrl, index) => ({
  id: 5000 + index,
  name: `Gold Earring Model ER-${String(index + 1).padStart(3, "0")}`,
  category: "Earrings",
  gender: "Women",
  price: "",
  material: "22K Gold",
  description:
    "Gold earring model from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
WOMEN'S BRACELETS
21 MODELS
==================================================
*/

const bracelets = braceletImages.map((imageUrl, index) => ({
  id: 6000 + index,
  name: `Gold Bracelet Model BR-${String(index + 1).padStart(3, "0")}`,
  category: "Bracelets",
  gender: "Women",
  price: "",
  material: "22K Gold",
  description:
    "Gold bracelet model from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
WOMEN'S BANGLES
52 MODELS
==================================================
*/

const bangles = bangleImages.map((imageUrl, index) => ({
  id: 7000 + index,
  name: `Gold Bangle Model BG-${String(index + 1).padStart(3, "0")}`,
  category: "Bangles",
  gender: "Women",
  price: "",
  material: "22K Gold",
  description:
    "Gold bangle model from Murugan Goldsmith and Jewels.",
  imageUrl,
  availability: "Both",
  inStock: true,
}));

/*
==================================================
EXISTING PRODUCTS
==================================================
*/

const existingProducts = [
  {
    id: 3,
    name: "Temple Bangle Pair",
    category: "Bangles",
    gender: "Women",
    price: "62500",
    material: "22K Gold",
    description:
      "Traditional temple-motif gold bangles, sold as a pair.",
    imageUrl: "",
    availability: "In-store",
    inStock: false,
  },

  {
    id: 5,
    name: "Layered Gold Bracelet",
    category: "Bracelets",
    gender: "Women",
    price: "14800",
    material: "22K Gold",
    description:
      "Elegant gold bracelet design.",
    imageUrl: "",
    availability: "Both",
    inStock: true,
  },
];

/*
==================================================
FINAL PRODUCT LIST
==================================================
*/

export const seedProducts = [
  ...mensRings,
  ...womensRings,
  ...mensChains,
  ...womensChains,
  ...necklaces,
  ...earrings,
  ...bracelets,
  ...bangles,
  ...existingProducts,
];