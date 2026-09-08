import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function SearchProduct() {

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const savedHistory =
      JSON.parse(localStorage.getItem("scanHistory")) || [];

    const scannedProducts = savedHistory.map((item) => ({
      id: item.inspectionId,

      name:
        item.declarations?.product_name ||
        item.productName ||
        "Unknown Product",

      manufacturer:
        item.declarations?.manufacturer ||
        "Not detected",

      mrp:
        item.declarations?.mrp ||
        "Not detected",

      quantity:
        item.declarations?.net_quantity ||
        "Not detected",

      status:
        item.compliance_check?.overall_status ||
        item.status ||
        "UNKNOWN",

      risk:
        item.compliance_check?.risk_level ||
        item.risk ||
        "UNKNOWN",

      inspectionId: item.inspectionId,

      originalData: item
    }));

    setProducts(scannedProducts);
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>

      <Navbar />

      <main className="page-container">

        <h1>Search Products</h1>

        <p>
          Search products that have already been inspected.
        </p>

        <div className="search-container">

          <input
            type="text"
            placeholder="Search product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="primary-btn">
            Search
          </button>

        </div>

        <div className="products-grid">

          {filteredProducts.length > 0 ? (

            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))

          ) : (

            <div className="empty-state">

              <h3>
                {products.length === 0
                  ? "No scanned products"
                  : "No products found"}
              </h3>

              <p>
                {products.length === 0
                  ? "Scan a product to see it here."
                  : "Try searching with another product name."}
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default SearchProduct;