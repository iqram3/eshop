const API_URL = "https://fakestoreapi.com/products";
const productList = document.getElementById("productList");
const loading = document.getElementById("loading");
const loadMoreButton = document.getElementById("loadMore");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const priceRangeSelect = document.getElementById("priceRange");
const sortSelect = document.getElementById("sort");
const noResultsMessage = document.getElementById("noResultsMessage");

let products = [];
let filteredProducts = [];
let displayedCount = 0;
const initialLoad = 10;
const loadMoreCount = 10;

// Function to fetch products from the API
async function fetchProducts() {
  loading.style.display = "block";
  loadMoreButton.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    products = await response.json();
    applyFiltersAndSort();
  } catch (error) {
    console.error("Error fetching products:", error);
    alert("Failed to fetch products. Please try again later.");
    loadMoreButton.style.display = "none";
  } finally {
    loading.style.display = "none";
    loadMoreButton.disabled = false;
  }
}

// Function to apply filters and sort products
function applyFiltersAndSort() {
  const searchQuery = searchInput.value.toLowerCase();
  const selectedCategory = categorySelect.value;
  const selectedPriceRange = priceRangeSelect.value;
  const selectedSort = sortSelect.value;

  filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery);
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    const matchesPriceRange =
      !selectedPriceRange ||
      withinPriceRange(product.price, selectedPriceRange);
    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  if (selectedSort === "price_asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (selectedSort === "price_desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  renderProducts(true);
}

// Function to check if the product is within the selected price range
function withinPriceRange(price, range) {
  const [min, max] = range.split("-").map(Number);
  return price >= min && price <= max;
}

// Function to render products on the page
function renderProducts(reset = false) {
  if (reset) {
    productList.innerHTML = "";
    displayedCount = 0;
  }

  const nextBatch = filteredProducts.slice(
    displayedCount,
    displayedCount + (reset ? initialLoad : loadMoreCount)
  );

  if (nextBatch.length === 0) {
    noResultsMessage.style.display = "block";
  } else {
    noResultsMessage.style.display = "none";
    nextBatch.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.className = "product";
      productItem.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <div class="product-details">
          <p>${product.title}</p>
          <p>$${product.price.toFixed(2)}</p>
          <div class="heart">💗</div>
        </div>
      `;
      productList.appendChild(productItem);
    });
    displayedCount += nextBatch.length;
    loadMoreButton.style.display =
      displayedCount < filteredProducts.length ? "block" : "none";
  }
}

// Event listeners
loadMoreButton.addEventListener("click", () => renderProducts());
searchInput.addEventListener("input", applyFiltersAndSort);
categorySelect.addEventListener("change", applyFiltersAndSort);
priceRangeSelect.addEventListener("change", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);

// Fetch initial products
fetchProducts();
