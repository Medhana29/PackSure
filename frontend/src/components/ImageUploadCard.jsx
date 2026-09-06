function ImageUploadCard({
  title,
  description,
  required = false,
  image,
  onChange
}) {
  return (
    <div className="upload-card">

      <div className="upload-icon">
        📷
      </div>

      <h3>
        {title}

        {required && (
          <span className="required">
            *
          </span>
        )}
      </h3>

      <p>{description}</p>

      <label className="upload-btn">

        {image ? "Change Image" : "Choose Image"}

        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          hidden
        />

      </label>

      {image && (
        <div className="preview-container">
          <img
            src={image}
            alt={title}
            className="image-preview"
          />
        </div>
      )}

    </div>
  );
}

export default ImageUploadCard;