import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

function ImageQuality() {

  const navigate = useNavigate();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  useEffect(() => {

    const front = sessionStorage.getItem("frontImage");
    const back = sessionStorage.getItem("backImage");

    setFrontImage(front);
    setBackImage(back);

  }, []);

  return (
    <div>

      <Navbar />

      <main className="page-container">

        <div className="page-heading">

          <h1>Image Quality Check</h1>

          <p>
            Make sure the package images are clear enough
            for accurate scanning.
          </p>

        </div>

        <div className="quality-grid">

          <div className="quality-card">

            <h3>Front Image</h3>

            {frontImage && (
              <img
                src={frontImage}
                alt="Front package"
                className="quality-image"
              />
            )}

            <div className="quality-status success">
              ✓ Resolution: Good
            </div>

            <div className="quality-status success">
              ✓ Blur: Low
            </div>

            <div className="quality-status success">
              ✓ Lighting: Good
            </div>

            <div className="quality-status success">
              ✓ Rotation: Correct
            </div>

          </div>

          <div className="quality-card">

            <h3>Back Image</h3>

            {backImage && (
              <img
                src={backImage}
                alt="Back package"
                className="quality-image"
              />
            )}

            <div className="quality-status success">
              ✓ Resolution: Good
            </div>

            <div className="quality-status success">
              ✓ Blur: Low
            </div>

            <div className="quality-status success">
              ✓ Lighting: Good
            </div>

            <div className="quality-status success">
              ✓ Rotation: Correct
            </div>

          </div>

        </div>

        <div className="quality-note">

          <strong>Image quality looks good.</strong>

          <p>
            You can continue to the scanning process.
          </p>

        </div>

        <div className="inspection-actions">

          <button
            className="secondary-btn"
            onClick={() => navigate("/inspection")}
          >
            ← Upload Again
          </button>

          <button
            className="primary-btn"
            onClick={() => navigate("/scanning")}
          >
            Start Scanning →
          </button>

        </div>

      </main>

    </div>
  );
}

export default ImageQuality;