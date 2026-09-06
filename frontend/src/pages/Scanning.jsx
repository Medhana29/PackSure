import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Scanning() {

  const navigate = useNavigate();

  useEffect(() => {

    const timer = setTimeout(() => {

      navigate("/results");

    }, 4000);

    return () => clearTimeout(timer);

  }, [navigate]);

  return (
    <div className="scanning-page">

      <div className="scanning-card">

        <div className="scanner-icon spin">
          ⚙️
        </div>

        <h1>Scanning Product...</h1>

        <p>
          Please wait while PackSure processes
          your package images.
        </p>

        <div className="progress-container">

          <div className="progress-bar"></div>

        </div>

        <div className="scanning-steps">

          <p>✓ Uploading images</p>

          <p>✓ Checking image quality</p>

          <p>⏳ Extracting package information</p>

          <p>○ Checking Legal Metrology compliance</p>

        </div>

      </div>

    </div>
  );
}

export default Scanning;