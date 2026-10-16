
import { initialProducts } from "./products.js";

const STORAGE_KEY = "inventoryProducts";

export function getProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load saved products:", error);
  }

  const products = initialProducts.map(product => ({ ...product }));
  saveProducts(products);
  return products;
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error("Could not save products:", error);
    return false;
  }
}
