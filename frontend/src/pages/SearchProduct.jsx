import React from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function SearchProduct() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const userEmail = localStorage.getItem("userEmail");
  const historyKey = `scanHistory_${userEmail}`;

  const history = JSON.parse(
    localStorage.getItem(historyKey) || "[]"
  );

  const products = useMemo(() => {
    const map = new Map();

    history.forEach((item) => {
      const name =
        item.productName ||
        item.declarations?.product_name ||
        "Unknown Product";

      const key = name.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          name,
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
            item.status,

          inspectionId: item.inspectionId,

          original: item,
        });
      }
    });

    return [...map.values()];
  }, [history]);

  const filtered = products.filter(
    (p) =>
      p.name
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      p.manufacturer
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="page">

        <p className="eyebrow">
          YOUR REAL SCANS
        </p>

        <h1>Search Products</h1>

        <p className="muted">
          Search only products that exist in your inspection history.
        </p>

        <input
          className="search-input"
          placeholder="Search product or manufacturer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {filtered.length === 0 ? (

          <div className="empty-state">
            <h2>No matching products</h2>
            <p>
              Scan a product first or change your search.
            </p>
          </div>

        ) : (

          <div className="product-list">

            {filtered.map((product) => (

              <button
                className="product-card"
                key={product.inspectionId}
                onClick={() => {
                  localStorage.setItem(
                    "scanResult",
                    JSON.stringify(product.original)
                  );

                  navigate("/results");
                }}
              >

                <div>
                  <h3>{product.name}</h3>

                  <p>{product.manufacturer}</p>

                  <small>
                    {product.quantity} · {product.mrp}
                  </small>
                </div>

                <StatusBadge
                  status={product.status}
                />

              </button>

            ))}

          </div>

        )}

      </main>
    </>
  );
}