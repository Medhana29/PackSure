import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="product-card">

      <div className="product-image">
        📦
      </div>

      <div className="product-info">

        <h3>{product.name}</h3>

        <p>
          Manufacturer: {product.manufacturer}
        </p>

        <p>
          MRP: ₹{product.mrp}
        </p>

        <p>
          Quantity: {product.quantity}
        </p>

        <button
          className="secondary-btn"
          onClick={() => navigate("/results")}
        >
          View Details
        </button>

      </div>

    </div>
  );
}

export default ProductCard;