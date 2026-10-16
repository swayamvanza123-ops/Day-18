
export function validateProduct(product) {
  if (!product.name || product.name.trim().length < 3) {
    return "Product name must contain at least 3 characters.";
  }

  if (!product.category) {
    return "Please select a product category.";
  }

  if (!product.supplier || !product.supplier.trim()) {
    return "Please enter the supplier name.";
  }

  if (!Number.isFinite(product.price) ||
      product.price <= 0 ||
      product.price > 1000000000) {
    return "Enter a valid price greater than zero.";
  }

  if (!Number.isInteger(product.stock) ||
      product.stock < 0 ||
      product.stock > 1000000000) {
    return "Enter a valid whole-number quantity.";
  }

  if (!product.description ||
      product.description.trim().length < 10) {
    return "Description must contain at least 10 characters.";
  }

  return "";
}
