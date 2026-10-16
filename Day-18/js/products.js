const PLACEHOLDER =
  "https://placehold.co/500x300/f0f4fb/7a8aa5?text=No+Product+Image";

export function createProductDetails(getProducts) {
  const modal = document.getElementById("productModal");
  const closeX = document.getElementById("modalX");
  const closeButton = document.getElementById("modalClose");

  const fields = {
    name: document.getElementById("modalProductName"),
    id: document.getElementById("modalProductId"),
    category: document.getElementById("modalCategory"),
    price: document.getElementById("modalPrice"),
    quantity: document.getElementById("modalQuantity"),
    supplier: document.getElementById("modalSupplier"),
    status: document.getElementById("modalStatus"),
    description: document.getElementById("modalDescription"),
    image: document.getElementById("modalProductImage")
  };

  let previousFocus = null;

  function setText(element, value, fallback = "Not provided") {
    element.textContent =
      value !== undefined && value !== null && String(value).trim() !== ""
        ? String(value)
        : fallback;
  }

  function openProductDetails(productId) {
    const product = getProducts().find(
      item => String(item.id) === String(productId)
    );

    if (!product) {
      alert("Product not found.");
      return;
    }

    previousFocus = document.activeElement;

    setText(fields.name, product.name, "Unnamed Product");
    setText(fields.id, product.id);
    setText(fields.category, product.category);
    setText(
      fields.price,
      Number(product.price || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      })
    );
    setText(fields.quantity, Number(product.stock || 0), "0");
    setText(fields.supplier, product.supplier);
    setText(fields.description, product.description, "No description available.");

    const stock = Number(product.stock);
    let status;
    let statusClass;

    if (!Number.isFinite(stock) || stock <= 0) {
      status = "Out of Stock";
      statusClass = "stock-out";
    } else if (stock < 10) {
      status = "Low Stock";
      statusClass = "stock-low";
    } else {
      status = "In Stock";
      statusClass = "stock-in";
    }

    fields.status.textContent = status;
    fields.status.className = statusClass;

    fields.image.onerror = () => {
      fields.image.onerror = null;
      fields.image.src = PLACEHOLDER;
    };
    fields.image.src = product.image || PLACEHOLDER;
    fields.image.alt = product.name || "Product image";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeX.focus();
  }

  function closeProductDetails() {
    if (!modal.classList.contains("open")) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    }
  }

  closeX.addEventListener("click", closeProductDetails);
  closeButton.addEventListener("click", closeProductDetails);

  modal.addEventListener("click", event => {
    if (event.target === modal) closeProductDetails();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeProductDetails();
  });

  return { openProductDetails, closeProductDetails };
}

export const initialProducts = [
  {
    id: "PRD-1001",
    name: "Dell Laptop",
    category: "Electronics",
    price: 55000,
    stock: 10,
    supplier: "Dell Technologies",
    description: "Powerful laptop for work, study, multitasking and entertainment.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600"
  },
  {
    id: "PRD-1002",
    name: "Wireless Mouse",
    category: "Accessories",
    price: 800,
    stock: 5,
    supplier: "Logitech",
    description: "Comfortable wireless mouse with responsive tracking for everyday use.",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600"
  },
  {
    id: "PRD-1003",
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 1500,
    stock: 25,
    supplier: "Tech Supplies",
    description: "Durable mechanical keyboard designed for comfortable typing.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"
  },
  {
    id: "PRD-1004",
    name: "HD Monitor",
    category: "Electronics",
    price: 12000,
    stock: 0,
    supplier: "Display World",
    description: "HD display for productivity, office work and entertainment.",
    image: ""
  },
  {
    id: "PRD-1005",
    name: "Office Chair",
    category: "Furniture",
    price: 6500,
    stock: 15,
    supplier: "Office Furniture Co.",
    description: "Comfortable adjustable chair suitable for a home or office workspace.",
    image: ""
  },
  {
    id: "PRD-1006",
    name: "USB-C Hub",
    category: "Accessories",
    price: 1200,
    stock: 8,
    supplier: "Tech Supplies",
    description: "Compact USB-C hub for connecting compatible devices and accessories.",
    image: ""
  }
];


