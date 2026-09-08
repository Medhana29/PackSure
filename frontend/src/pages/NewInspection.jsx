import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ImageUploadCard from "../components/ImageUploadCard";

function NewInspection() {

  const navigate = useNavigate();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);

  function handleImageChange(event, setter) {

    const file = event.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setter({
      file: file,
      preview: imageUrl
    });
  }

  function continueToQuality() {

    if (!frontImage || !backImage) {

      alert(
        "Front and Back images are required."
      );

      return;
    }

    // Store temporarily for next screen
    sessionStorage.setItem(
      "frontImage",
      frontImage.preview
    );

    sessionStorage.setItem(
      "backImage",
      backImage.preview
    );

    if (sideImage) {
      sessionStorage.setItem(
        "sideImage",
        sideImage.preview
      );
    }

    navigate("/quality");
  }

  return (
    <div>

      <Navbar />

      <main className="page-container">

        <div className="page-heading">

          <h1>New Product Inspection</h1>

          <p>
            Upload clear images of all sides of the product package.
          </p>

        </div>

        <div className="upload-grid">

          <ImageUploadCard
            title="Front Image"
            description="Upload the front side of the package."
            required={true}
            image={frontImage?.preview}
            onChange={(e) =>
              handleImageChange(e, setFrontImage)
            }
          />

          <ImageUploadCard
            title="Back Image"
            description="Upload the back side containing declarations."
            required={true}
            image={backImage?.preview}
            onChange={(e) =>
              handleImageChange(e, setBackImage)
            }
          />

          <ImageUploadCard
            title="Side Image"
            description="Optional: Upload a side view."
            required={false}
            image={sideImage?.preview}
            onChange={(e) =>
              handleImageChange(e, setSideImage)
            }
          />

        </div>

        <div className="inspection-actions">

          <button
            className="secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          <button
            className="primary-btn"
            onClick={continueToQuality}
          >
            Continue →
          </button>

        </div>

      </main>

    </div>
  );
}

export default NewInspection;