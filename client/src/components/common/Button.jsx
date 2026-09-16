import "./Common.css";

// variant: "primary" | "outline" | "ghost"
// size: "md" | "sm"
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className = "",
  ...rest
}) {
  const variantClass =
    variant === "outline"
      ? "ui-btn--outline"
      : variant === "ghost"
      ? "ui-btn--ghost"
      : "ui-btn--primary";

  const sizeClass = size === "sm" ? "ui-btn--sm" : "";

  return (
    <button
      className={`ui-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <span className="ui-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : icon}
      {children}
    </button>
  );
}

export default Button;
