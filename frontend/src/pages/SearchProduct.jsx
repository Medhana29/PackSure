import { useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function SearchProduct() {

  const [search, setSearch] = useState("");

  const products = [
    {
      id: 1,
      name: "Tata Salt",
      manufacturer: "Tata Consumer Products",
      mrp: 30,
      quantity: "1 kg"
    },
    {
      id: 2,
      name: "Aashirvaad Atta",
      manufacturer: "ITC Limited",
      mrp: 280,
      quantity: "5 kg"
    },
    {
      id: 3,
      name: "Parle-G",
      manufacturer: "Parle Products",
      mrp: 10,
      quantity: "100 g"
    }
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
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
              <h3>No products found</h3>

              <p>
                Try searching with another product name.
              </p>
            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default SearchProduct;