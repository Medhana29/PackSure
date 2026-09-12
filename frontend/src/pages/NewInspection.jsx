import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { scanApi } from "../api";

export default function NewInspection() {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!productName.trim()) {
      setError("Please enter the product name.");
      return;
    }

    if (!front || !back) {
      setError("Please upload both front and back images.");
      return;
    }

    const formData = new FormData();

    formData.append("front_image", front);
    formData.append("back_image", back);

    setLoading(true);

    try {
      const response = await scanApi.post("/api/scan", formData);

      const data = response.data;

      const inspectionId = `INS-${Date.now()}`;
      // Send only non-compliant products to Government Authority
if (
  data.compliance_check?.overall_status === "VIOLATION"
) {
  try {
    await fetch("http://localhost:8001/api/inspections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspection_id: inspectionId,
        consumer_email: localStorage.getItem("userEmail"),
        product_name: productName.trim(),
        declarations: data.declarations || {},
        compliance_check: data.compliance_check || {},
        ocr_confidence: data.ocr_confidence || {},
      }),
    });

    console.log(
      "Non-compliant inspection sent to Government Authority"
    );
  } catch (authorityError) {
    console.error(
      "Could not send inspection to Government:",
      authorityError
    );
  }
}

      const record = {
        ...data,

        inspectionId,

        productName: productName.trim(),

        status:
          data.compliance_check?.overall_status || "UNKNOWN",

        risk:
          data.compliance_check?.risk_level || "UNKNOWN",

        date: new Date().toLocaleString(),
      };

      // Save history
      const userEmail = localStorage.getItem("userEmail");
      const historyKey = `scanHistory_${userEmail}`;

      const history = JSON.parse(
        localStorage.getItem(historyKey) || "[]"
      );

      localStorage.setItem(
        historyKey,
        JSON.stringify([...history, record])
      );

      // Save current result
      localStorage.setItem(
        "scanResult",
        JSON.stringify(record)
      );

      navigate("/results");

    } catch (err) {
      console.error("SCAN ERROR:", err);

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Could not scan the images. Make sure the OCR API is running on port 8000."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="page narrow">

        <button
          className="back-link"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>New Inspection</h1>

        <p className="muted">
          Enter the product name and upload clear images of both sides
          of the package.
        </p>

        <form
          className="inspection-form"
          onSubmit={submit}
        >

          {/* PRODUCT NAME */}

          <label>Product Name</label>

          <input
            type="text"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          {productName && (
            <p className="file-name">
              ✓ Product: {productName}
            </p>
          )}


          {/* FRONT IMAGE */}

          <label>Front image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFront(e.target.files[0])
            }
          />

          {front && (
            <div className="image-preview-box">
              <img
                src={URL.createObjectURL(front)}
                alt="Front preview"
                className="image-preview"
              />

              <p className="file-name">
                ✓ {front.name}
              </p>
            </div>
          )}


          {/* BACK IMAGE */}

          <label>Back image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setBack(e.target.files[0])
            }
          />

          {back && (
            <div className="image-preview-box">
              <img
                src={URL.createObjectURL(back)}
                alt="Back preview"
                className="image-preview"
              />

              <p className="file-name">
                ✓ {back.name}
              </p>
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}


          {/* SCAN BUTTON */}

          <button
            className="primary-btn full"
            disabled={loading}
          >
            {loading
              ? "Scanning + checking..."
              : "Scan Product"}
          </button>

        </form>

      </main>
    </>
  );
}