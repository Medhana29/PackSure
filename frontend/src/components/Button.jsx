function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`primary-btn ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;