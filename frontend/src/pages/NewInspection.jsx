import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function NewInspection() {
  const navigate = useNavigate();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const handleFrontImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFrontImage(file);
    setFrontPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleBackImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setBackImage(file);
    setBackPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleScan = async () => {
    if (!frontImage || !backImage) {
      setError("Please upload both front and back images.");
      return;
    }

    setError("");
    setIsScanning(true);

    try {
      const formData = new FormData();

      formData.append("front_image", frontImage);
      formData.append("back_image", backImage);

      console.log("Sending images to backend...");

      const response = await fetch(
        "http://127.0.0.1:8000/api/scan",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Backend error:", errorText);

        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("========== BACKEND RESPONSE ==========");
      console.log(data);

      /*
        Save the complete backend response.
        Results.jsx will read this.
      */
      // Save latest result
localStorage.setItem("scanResult", JSON.stringify(data));

// Save result to history
const existingHistory =
  JSON.parse(localStorage.getItem("scanHistory")) || [];

existingHistory.push({
  ...data,

  inspectionId: `INS-${Date.now()}`,

  productName:
    data.declarations?.product_name || "Unknown Product",

  status:
    data.compliance_check?.overall_status ||
    "UNKNOWN",

  risk:
    data.compliance_check?.risk_level ||
    "UNKNOWN",

  date: new Date().toLocaleString(),

  confidence: 0
});

localStorage.setItem(
  "scanHistory",
  JSON.stringify(existingHistory)
);

      console.log("Scan result saved.");

      /*
        Go to Results page
      */
      navigate("/results");

    } catch (err) {
      console.error("SCAN ERROR:", err);

      setError(
        "Unable to process the scan. Please try again."
      );

    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="inspection-page">

      <Navbar />

      <main className="page-container">

        <section className="inspection-header">

          <h1>New Inspection</h1>

          <p>
            Upload clear images of the front and back
            of the product package.
          </p>

        </section>

        <section className="inspection-upload-section">

          {/* FRONT */}

          <div className="upload-card">

            <h2>Front Image</h2>

            <p>
              Upload the front side of the package.
            </p>

            <label className="upload-box">

              {frontPreview ? (
                <img
                  src={frontPreview}
                  alt="Front preview"
                  className="image-preview"
                />
              ) : (
                <div className="upload-placeholder">

                  <span className="upload-icon">
                    📷
                  </span>

                  <span>
                    Click to upload front image
                  </span>

                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFrontImage}
                hidden
              />

            </label>

            {frontImage && (
              <p className="file-name">
                {frontImage.name}
              </p>
            )}

          </div>


          {/* BACK */}

          <div className="upload-card">

            <h2>Back Image</h2>

            <p>
              Upload the back side of the package.
            </p>

            <label className="upload-box">

              {backPreview ? (
                <img
                  src={backPreview}
                  alt="Back preview"
                  className="image-preview"
                />
              ) : (
                <div className="upload-placeholder">

                  <span className="upload-icon">
                    📷
                  </span>

                  <span>
                    Click to upload back image
                  </span>

                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleBackImage}
                hidden
              />

            </label>

            {backImage && (
              <p className="file-name">
                {backImage.name}
              </p>
            )}

          </div>

        </section>


        {/* ERROR */}

        {error && (
          <div className="inspection-error">
            {error}
          </div>
        )}


        {/* BUTTON */}

        <section className="scan-action">

          <button
            className="primary-btn"
            onClick={handleScan}
            disabled={isScanning}
          >

            {isScanning
              ? "Scanning..."
              : "🔍 Scan Product"}

          </button>

        </section>


        {/* LOADING */}

        {isScanning && (

          <div className="scanning-message">

            <div className="scanning-spinner">
              ⏳
            </div>

            <h3>
              Scanning Product...
            </h3>

            <p>
              Extracting declarations and checking
              compliance.
            </p>

            <p>
              Please wait...
            </p>

          </div>

        )}

      </main>

    </div>
  );
}

export default NewInspection;