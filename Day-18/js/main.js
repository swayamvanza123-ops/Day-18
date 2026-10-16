
import { getProducts, saveProducts } from "./storage.js";
import { validateProduct } from "./validation.js";
import { createProductDetails } from "./productDetails.js";

let products = getProducts();
let selectedCategory = "All";
let editingId = null;

const $ = id => document.getElementById(id);

const form = $("productForm");
const productName = $("productName");
const productCategory = $("productCategory");
const productSupplier = $("productSupplier");
const productPrice = $("productPrice");
const productStock = $("productStock");
const productDescription = $("productDescription");
const productImage = $("productImage");
const imagePreviewImg = $("imagePreviewImg");
const imageFileName = $("imageFileName");
const productGrid = $("productGrid");
const searchInput = $("searchInput");
const stockFilter = $("stockFilter");
const submitBtn = $("submitBtn");
const cancelEdit = $("cancelEdit");
const clearFormButton = $("clearForm");
const toast = $("toast");

const PLACEHOLDER =
  "https://placehold.co/500x300/f0f4fb/7a8aa5?text=No+Product+Image";

const { openProductDetails } = createProductDetails(() => products);

$("currentYear").textContent = new Date().getFullYear();

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });
}

function getStatus(quantity) {
  const stock = Number(quantity);

  if (!Number.isFinite(stock) || stock <= 0) {
    return { label: "Out of Stock", className: "stock-out" };
  }

  if (stock < 10) {
    return { label: "Low Stock", className: "stock-low" };
  }

  return { label: "In Stock", className: "stock-in" };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function updateDashboard() {
  $("totalProducts").textContent = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0
  );
  $("totalStock").textContent = totalStock.toLocaleString("en-IN");

  // Low Stock means 1–9 units. Zero is counted separately.
  $("lowStock").textContent = products.filter(product => {
    const quantity = Number(product.stock);
    return Number.isFinite(quantity) && quantity >= 1 && quantity < 10;
  }).length;

  $("outOfStock").textContent = products.filter(
    product => Number(product.stock) <= 0
  ).length;

  // Inventory value = sum of (unit price × quantity).
  const inventoryValue = products.reduce((sum, product) => {
    const price = Number(product.price) || 0;
    const quantity = Number(product.stock) || 0;
    return sum + price * quantity;
  }, 0);

  $("inventoryValue").textContent = money(inventoryValue);
}

function makeButton(text, className, action, id) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.id = String(id);
  return button;
}

function renderProducts() {
  productGrid.replaceChildren();

  const query = searchInput.value.trim().toLowerCase();
  const statusFilter = stockFilter.value;

  const filtered = products.filter(product => {
    const categoryMatches =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const searchable = [
      product.name,
      product.id,
      product.category,
      product.supplier,
      product.description
    ].some(value => String(value || "").toLowerCase().includes(query));

    const statusMatches =
      statusFilter === "All" ||
      getStatus(product.stock).label === statusFilter;

    return categoryMatches && searchable && statusMatches;
  });

  $("productCount").textContent =
    `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`;

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No products found. Try changing your filters or add a new product.";
    productGrid.append(empty);
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.className = "product-image";
    image.alt = product.name || "Product image";
    image.loading = "lazy";
    image.onerror = () => {
      image.onerror = null;
      image.src = PLACEHOLDER;
    };
    image.src = product.image || PLACEHOLDER;

    const content = document.createElement("div");
    content.className = "product-card-content";

    const name = document.createElement("h3");
    name.textContent = product.name || "Unnamed Product";

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category || "Uncategorized";

    const id = document.createElement("p");
    id.className = "product-id";
    id.textContent = `ID: ${product.id}`;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = money(product.price);

    const quantity = document.createElement("p");
    quantity.className = "product-quantity";
    quantity.textContent = `Available quantity: ${Number(product.stock) || 0}`;

    const supplier = document.createElement("p");
    supplier.className = "product-supplier";
    supplier.textContent = `Supplier: ${product.supplier || "Not provided"}`;

    const status = getStatus(product.stock);
    const badge = document.createElement("span");
    badge.className = `stock-badge ${status.className}`;
    badge.textContent = status.label;

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
      makeButton("View Details", "view-btn", "details", product.id),
      makeButton("Edit", "edit-btn", "edit", product.id),
      makeButton("Delete", "delete-btn", "delete", product.id)
    );

    content.append(
      name, category, id, price, quantity, supplier, badge, actions
    );
    card.append(image, content);
    productGrid.append(card);
  });
}

function renderAll() {
  updateDashboard();
  renderProducts();
}

function resetForm() {
  form.reset();
  editingId = null;

  imagePreviewImg.src = PLACEHOLDER;
  imageFileName.textContent = "No image selected. A placeholder will be used.";

  $("formHeading").textContent = "Add New Product";
  submitBtn.textContent = "＋ Add Product";
  cancelEdit.classList.add("hidden");
  productImage.value = "";
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
}

productImage.addEventListener("change", async () => {
  const file = productImage.files[0];

  if (!file) {
    const current = products.find(
      product => String(product.id) === String(editingId)
    );

    imagePreviewImg.src = current?.image || PLACEHOLDER;
    imageFileName.textContent = current?.image
      ? "Using the saved product image"
      : "No image selected. A placeholder will be used.";
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("Please select a valid image file.");
    productImage.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast("Image must be smaller than 2 MB.");
    productImage.value = "";
    return;
  }

  try {
    const data = await readImageFile(file);
    imagePreviewImg.src = data;
    imageFileName.textContent = file.name;
  } catch {
    showToast("Could not read the image.");
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  const productData = {
    name: productName.value.trim(),
    category: productCategory.value,
    supplier: productSupplier.value.trim(),
    price: Number(productPrice.value),
    stock: Number(productStock.value),
    description: productDescription.value.trim()
  };

  const error = validateProduct(productData);

  if (error) {
    showToast(error);
    return;
  }

  const existing = products.find(
    product => String(product.id) === String(editingId)
  );

  let imageData = existing?.image || "";
  const file = productImage.files[0];

  if (file) {
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2 MB.");
      return;
    }

    try {
      imageData = await readImageFile(file);
    } catch {
      showToast("Unable to read the image.");
      return;
    }
  }

  let updatedProducts;
  const isEditing = editingId !== null;

  if (isEditing) {
    updatedProducts = products.map(product =>
      String(product.id) === String(editingId)
        ? { ...product, ...productData, image: imageData }
        : product
    );
  } else {
    const newProduct = {
      ...productData,
      id: `PRD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      image: imageData
    };

    updatedProducts = [newProduct, ...products];
  }

  if (!saveProducts(updatedProducts)) {
    showToast("Could not save. Browser storage may be full.");
    return;
  }

  products = updatedProducts;
  resetForm();
  renderAll();

  showToast(isEditing
    ? "Product updated successfully!"
    : "Product added successfully!");
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  const product = products.find(
    item => String(item.id) === String(id)
  );

  if (!product) {
    showToast("Product not found.");
    return;
  }

  if (action === "details") {
    openProductDetails(product.id);
    return;
  }

  if (action === "edit") {
    editingId = product.id;

    productName.value = product.name || "";
    productCategory.value = product.category || "";
    productSupplier.value = product.supplier || "";
    productPrice.value = product.price ?? "";
    productStock.value = product.stock ?? "";
    productDescription.value = product.description || "";

    productImage.value = "";
    imagePreviewImg.onerror = () => {
      imagePreviewImg.onerror = null;
      imagePreviewImg.src = PLACEHOLDER;
    };
    imagePreviewImg.src = product.image || PLACEHOLDER;
    imageFileName.textContent = product.image
      ? "Saved image. Choose another file to replace it."
      : "No saved image. Choose a file to upload.";

    $("formHeading").textContent = "Edit Product";
    submitBtn.textContent = "Save Changes";
    cancelEdit.classList.remove("hidden");

    $("add-product").scrollIntoView({ behavior: "smooth" });
    productName.focus();
    return;
  }

  if (action === "delete") {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    const updatedProducts = products.filter(
      item => String(item.id) !== String(id)
    );

    if (!saveProducts(updatedProducts)) {
      showToast("Unable to save changes.");
      return;
    }

    products = updatedProducts;

    if (String(editingId) === String(id)) {
      resetForm();
    }

    renderAll();
    showToast("Product deleted successfully.");
  }
});

cancelEdit.addEventListener("click", resetForm);
clearFormButton.addEventListener("click", resetForm);

searchInput.addEventListener("input", renderProducts);
stockFilter.addEventListener("change", renderProducts);

$("categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;

  document.querySelectorAll(".filter-btn").forEach(filterButton => {
    filterButton.classList.toggle("active", filterButton === button);
  });

  renderProducts();
});

$("lowStockNav").addEventListener("click", () => {
  stockFilter.value = "Low Stock";
  renderProducts();
});

renderAll();
