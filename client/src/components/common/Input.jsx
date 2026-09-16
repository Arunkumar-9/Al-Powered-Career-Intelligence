import "./Common.css";

function Input({ as = "input", className = "", ...rest }) {
  if (as === "textarea") {
    return <textarea className={`ui-textarea ${className}`} {...rest} />;
  }
  if (as === "select") {
    return <select className={`ui-select ${className}`} {...rest} />;
  }
  return <input className={`ui-input ${className}`} {...rest} />;
}

export default Input;
